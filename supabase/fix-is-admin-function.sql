-- ============================================
-- Fix is_admin() Function to Use auth.jwt()
-- ============================================
-- The original is_admin() reads from raw_app_meta_data,
-- but this doesn't work if the JWT doesn't include app_metadata.
--
-- This fix makes is_admin() read from auth.jwt() which is
-- the proper way to check claims in RLS policies.
-- ============================================

-- Drop the old function
DROP FUNCTION IF EXISTS is_admin();

-- Create fixed function that reads from auth.jwt()
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  -- Check if is_admin claim exists in JWT app_metadata
  RETURN COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean,
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Ensure app_metadata is set correctly in auth.users
-- ============================================
-- This ensures future JWTs will include is_admin

DROP FUNCTION IF EXISTS set_admin_role(text, boolean);

CREATE OR REPLACE FUNCTION set_admin_role(user_email text, is_admin boolean DEFAULT true)
RETURNS text AS $$
DECLARE
  target_user_id uuid;
BEGIN
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email
  LIMIT 1;

  IF target_user_id IS NULL THEN
    RETURN 'User not found: ' || user_email;
  END IF;

  -- Update BOTH app_metadata and raw_app_meta_data
  -- app_metadata is used for JWT claims
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

-- ============================================
-- Instructions
-- ============================================
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Set admin role for your user:
--    SELECT set_admin_role('your@email.com', true);
-- 3. Logout and login again to get fresh JWT
-- 4. Verify: select auth.jwt() -> 'app_metadata';