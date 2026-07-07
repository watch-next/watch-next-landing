/**
 * Fix Admin Metadata Script
 *
 * Applies the updated set_admin_role SQL function and refreshes admin user metadata.
 * This fixes the issue where app_metadata.is_admin was not being set correctly.
 *
 * Usage:
 *   npx tsx scripts/fix-admin-metadata.ts admin@watchnext.app
 */

import { createClient } from '@supabase/supabase-js'

const adminEmail = process.argv[2]

if (!adminEmail) {
  console.error('Usage: npx tsx scripts/fix-admin-metadata.ts <admin-email>')
  console.error('Example: npx tsx scripts/fix-admin-metadata.ts admin@watchnext.app')
  process.exit(1)
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: Missing Supabase credentials')
  console.error('Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file')
  process.exit(1)
}

const sqlFunction = `
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
`

async function applyFix(email: string) {
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

  console.log('Step 1: Applying updated set_admin_role() SQL function...')

  // Apply the SQL function via RPC
  // We need to execute this directly on the database
  const { error: applyError } = await supabase.rpc('exec_sql', { sql: sqlFunction })

  // If exec_sql RPC doesn't exist, we'll use a different approach
  if (applyError && (applyError.message.includes('function') || applyError.message.includes('not exist'))) {
    console.log('Note: Cannot apply function via RPC. Function SQL saved for manual execution.')
    console.log('Please run this SQL in your Supabase SQL Editor:')
    console.log('---')
    console.log(sqlFunction)
    console.log('---')
  } else if (applyError) {
    console.error('Error applying function:', applyError.message)
  } else {
    console.log('✓ SQL function updated successfully')
  }

  console.log('\nStep 2: Re-applying admin role to', email)

  // Re-apply admin role with the fixed function
  const { data: result, error: setError } = await supabase.rpc('set_admin_role', {
    user_email: email,
    is_admin: true,
  })

  if (setError) {
    console.error('Error setting admin role:', setError.message)
    console.log('\nManual fix required. Run this SQL in Supabase SQL Editor:')
    console.log(`SELECT set_admin_role('${email}', true);`)
    process.exit(1)
  }

  console.log('✓', result)

  console.log('\nStep 3: Verifying admin metadata...')

  // Verify the fix worked
  const { data: user, error: fetchError } = await supabase
    .from('auth.users')
    .select('email, app_metadata, raw_app_meta_data')
    .eq('email', email)
    .single()

  if (fetchError || !user) {
    console.error('Error fetching user:', fetchError?.message)
    process.exit(1)
  }

  console.log('User metadata:')
  console.log('  app_metadata:', JSON.stringify(user.app_metadata, null, 2))
  console.log('  raw_app_meta_data:', JSON.stringify(user.raw_app_meta_data, null, 2))

  const hasAdminInAppMetadata = user.app_metadata?.is_admin === true
  const hasAdminInRawMetadata = user.raw_app_meta_data?.is_admin === true

  if (hasAdminInAppMetadata && hasAdminInRawMetadata) {
    console.log('\n✓ Admin metadata correctly set in both app_metadata and raw_app_meta_data')
    console.log('\nNext steps:')
    console.log('1. Log out of the admin account (if currently logged in)')
    console.log('2. Log in again at /admin/login to get a fresh JWT token')
    console.log('3. Navigate to /admin/blog - access should now be granted')
  } else {
    console.log('\n⚠ Warning: Admin metadata not found in expected locations')
    console.log('Please run this SQL manually in Supabase SQL Editor:')
    console.log(`
UPDATE auth.users
SET
  app_metadata = COALESCE(app_metadata, '{}'::jsonb) || '{"is_admin": true}'::jsonb,
  raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"is_admin": true}'::jsonb
WHERE email = '${email}';
    `.trim())
  }
}

applyFix(adminEmail).catch((err) => {
  console.error('Unexpected error:', err.message)
  process.exit(1)
})