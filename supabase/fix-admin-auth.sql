-- ============================================
-- Fix Admin Authentication Issue
-- ============================================
-- This script fixes the issue where admin users
-- cannot access the admin panel because the
-- is_admin flag is not set in app_metadata.
--
-- The frontend checks user.app_metadata.is_admin
-- but the old SQL function only updated raw_app_meta_data.
-- ============================================

-- Step 1: Drop old function if exists
DROP FUNCTION IF EXISTS public.set_admin_role(text, boolean);

-- Step 2: Create fixed function that updates BOTH app_metadata AND raw_app_meta_data
CREATE OR REPLACE FUNCTION set_admin_role(user_email text, is_admin boolean DEFAULT true)
RETURNS text AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Find user by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email
  LIMIT 1;

  -- Check if user exists
  IF target_user_id IS NULL THEN
    RETURN 'User not found: ' || user_email;
  END IF;

  -- Update BOTH app_metadata and raw_app_meta_data
  -- app_metadata is what the frontend reads from the JWT token
  -- raw_app_meta_data is the database column
  UPDATE auth.users
  SET
    app_metadata = COALESCE(app_metadata, '{}'::jsonb)
      || jsonb_build_object('is_admin', is_admin),
    raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb)
      || jsonb_build_object('is_admin', is_admin)
  WHERE id = target_user_id;

  RETURN 'Admin role ' || CASE WHEN is_admin THEN 'granted' ELSE 'revoked' END || ' for ' || user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Restrict access to service role only
REVOKE ALL ON FUNCTION set_admin_role(text, boolean) FROM PUBLIC;

-- ============================================
-- Step 3: Apply fix to existing admin user
-- Replace with your admin email if different
-- ============================================
SELECT set_admin_role('admin@watchnext.app', true);

-- ============================================
-- Step 4: Verify the fix worked
-- ============================================
SELECT
  email,
  app_metadata->>'is_admin' as app_metadata_is_admin,
  raw_app_meta_data->>'is_admin' as raw_app_meta_data_is_admin
FROM auth.users
WHERE email = 'admin@watchnext.app';

-- Expected output:
-- email              | app_metadata_is_admin | raw_app_meta_data_is_admin
-- -------------------+----------------------|---------------------------
-- admin@watchnext.app| true                 | true