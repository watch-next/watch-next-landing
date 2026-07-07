/**
 * Set Admin Role Script
 *
 * Grants admin privileges to a user by email.
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.
 *
 * Usage:
 *   npx tsx scripts/set-admin.ts admin@example.com
 */

import { createClient } from '@supabase/supabase-js'

const adminEmail = process.argv[2]

if (!adminEmail) {
  console.error('Usage: npx tsx scripts/set-admin.ts <admin-email>')
  console.error('Example: npx tsx scripts/set-admin.ts admin@watchnext.app')
  process.exit(1)
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: Missing Supabase credentials')
  console.error('Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file')
  console.error('Or export them as environment variables')
  process.exit(1)
}

async function setAdmin(email: string) {
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

  // Try using the SQL function first (preferred method)
  const { data: result, error: rpcError } = await supabase.rpc('set_admin_role', {
    user_email: email,
    is_admin: true,
  })

  if (rpcError) {
    if (rpcError.message.includes('function') || rpcError.message.includes('not exist')) {
      console.log('SQL function set_admin_role() not found, using fallback method...')
      await setAdminFallback(supabase, email)
    } else {
      console.error('Error calling set_admin_role():', rpcError.message)
      process.exit(1)
    }
  } else {
    console.log(`\n✓ ${result}`)
    console.log('The user can now access the admin panel at /admin/blog')
  }
}

async function setAdminFallback(
  supabase: ReturnType<typeof createClient>,
  email: string
) {
  // Find user by email
  const { data: user, error: fetchError } = await supabase
    .from('auth.users')
    .select('id, email, app_metadata, raw_app_meta_data')
    .eq('email', email)
    .single()

  if (fetchError || !user) {
    console.error(`Error: User with email "${email}" not found`)
    console.error('Make sure the user has signed up first via /admin/login')
    process.exit(1)
  }

  console.log(`Found user: ${user.email} (ID: ${user.id})`)

  // Update app_metadata to include is_admin: true
  const { error: updateError } = await supabase
    .from('auth.users')
    .update({
      app_metadata: { ...(user.app_metadata || {}), is_admin: true },
      raw_app_meta_data: { ...(user.raw_app_meta_data || {}), is_admin: true },
    })
    .eq('id', user.id)

  if (updateError) {
    console.error('Error updating user:', updateError.message)
    process.exit(1)
  }

  console.log(`\n✓ Successfully granted admin privileges to ${email}`)
  console.log('The user can now access the admin panel at /admin/blog')
}

setAdmin(adminEmail).catch((err) => {
  console.error('Unexpected error:', err.message)
  process.exit(1)
})