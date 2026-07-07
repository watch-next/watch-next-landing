-- Create a helper function to set admin role for a user by email
-- Usage: SELECT set_admin_role('admin@example.com', true);
DROP FUNCTION IF EXISTS public.set_admin_role(text, boolean);
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

  -- Update both app_metadata and raw_app_meta_data
 -- Update BOTH app_metadata and raw_app_meta_data
-- app_metadata is what the frontend reads from the user session
-- raw_app_meta_data is the database column that backs it
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

-- Grant usage to service role only (not exposed to regular users)
REVOKE ALL ON FUNCTION set_admin_role(text, boolean) FROM PUBLIC;