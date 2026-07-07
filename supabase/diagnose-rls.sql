-- ============================================
-- RLS Permission Error Diagnostic Script
-- ============================================
-- Run this in Supabase SQL Editor while logged in as admin
-- to diagnose why is_admin() returns false

-- Step 1: Check current authenticated user
-- ============================================
SELECT '=== Step 1: Current User ===' as step;
SELECT auth.uid() as current_user_id;

-- Expected: UUID of the authenticated admin user
-- If NULL: User is not authenticated

-- Step 2: Verify admin metadata in auth.users
-- ============================================
SELECT '=== Step 2: Admin Metadata ===' as step;
SELECT
  id,
  email,
  raw_app_meta_data,
  raw_app_meta_data->>'is_admin' as is_admin_value
FROM auth.users
WHERE id = auth.uid();

-- Expected: raw_app_meta_data should contain {"is_admin": true}
-- If is_admin_value is NULL or 'false': Admin metadata not set

-- Step 3: Test is_admin() function directly
-- ============================================
SELECT '=== Step 3: is_admin() Function ===' as step;
SELECT is_admin() as is_admin_result;

-- Expected: true
-- If false: Function not working or metadata missing

-- Step 4: Verify function definition and permissions
-- ============================================
SELECT '=== Step 4: Function Definition ===' as step;
SELECT
  proname as function_name,
  prosecdef as is_security_definer,
  proconfig as search_path_config
FROM pg_proc
WHERE proname = 'is_admin';

-- Expected: is_security_definer = true
-- SECURITY DEFINER is required to access auth.users

-- Step 5: Check existing RLS policies on blog_posts
-- ============================================
SELECT '=== Step 5: RLS Policies ===' as step;
SELECT
  schemename,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'blog_posts';

-- Expected: Policy with USING (is_admin()) and WITH CHECK (is_admin())

-- Step 6: Verify table grants
-- ============================================
SELECT '=== Step 6: Table Grants ===' as step;
SELECT
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'blog_posts';

-- Expected: 'authenticated' role should have INSERT, UPDATE, DELETE, SELECT

-- Step 7: Test INSERT with explicit auth context
-- ============================================
SELECT '=== Step 7: Test INSERT (will rollback) ===' as step;

BEGIN;
-- Try an insert to see the exact error
INSERT INTO blog_posts (
  slug,
  title,
  content,
  status,
  author
) VALUES (
  'test-rls-diagnostic',
  'RLS Diagnostic Test',
  'Test content',
  'draft',
  'Test Author'
);
ROLLBACK;

-- If this fails with "permission denied", RLS is blocking

-- Step 8: Debug is_admin() resolution
-- ============================================
SELECT '=== Step 8: Debug is_admin() Resolution ===' as step;

-- Check if auth.uid() matches any user
SELECT
  CASE
    WHEN auth.uid() IS NULL THEN 'auth.uid() is NULL - not authenticated'
    WHEN NOT EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid()) THEN 'No user found with auth.uid()'
    ELSE 'User exists in auth.users'
  END as auth_status;

-- Check the exact raw_app_meta_data value
SELECT
  (raw_app_meta_data->>'is_admin')::boolean as raw_is_admin,
  (app_metadata->>'is_admin')::boolean as app_is_admin
FROM auth.users
WHERE id = auth.uid();

-- Step 9: Check for conflicting policies
-- ============================================
SELECT '=== Step 9: Check Policy Conflicts ===' as step;
SELECT
  policyname,
  cmd as command,
  CASE
    WHEN cmd = 'INSERT' AND with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check
    WHEN cmd = 'UPDATE' THEN 'USING: ' || COALESCE(qual::text, 'N/A')
    WHEN cmd = 'DELETE' THEN 'USING: ' || COALESCE(qual::text, 'N/A')
    WHEN cmd = 'ALL' THEN 'USING: ' || COALESCE(qual::text, 'N/A') || ' | WITH CHECK: ' || COALESCE(with_check::text, 'N/A')
    ELSE 'N/A'
  END as policy_expression
FROM pg_policies
WHERE tablename = 'blog_posts';

-- Step 10: Final verdict
-- ============================================
SELECT '=== Step 10: Final Verdict ===' as step;
SELECT
  CASE
    WHEN auth.uid() IS NULL THEN 'ISSUE: User not authenticated'
    WHEN NOT EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid()) THEN 'ISSUE: User session invalid'
    WHEN (SELECT (raw_app_meta_data->>'is_admin')::boolean FROM auth.users WHERE id = auth.uid()) IS NOT TRUE
      THEN 'ISSUE: Admin metadata not set (raw_app_meta_data->>is_admin is not true)'
    WHEN NOT is_admin() THEN 'ISSUE: is_admin() function returning false despite metadata'
    ELSE 'CONFIGURATION OK - Check table grants or other policies'
  END as diagnosis;