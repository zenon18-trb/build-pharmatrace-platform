// One-off script: creates the four demo auth users (one per organization/role)
// with confirmed emails, using the Supabase service role key.
// Run with: node --env-file-if-exists=/vercel/share/.env.project scripts/seed-demo-users.mjs
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('[v0] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const DEMO_PASSWORD = 'PharmaTrace2026!'

async function getOrgIdByCode(code) {
  const { data, error } = await admin.from('organizations').select('id').eq('code', code).single()
  if (error) throw error
  return data.id
}

const demoAccounts = [
  {
    email: 'a.rivera@acme-pharma.demo',
    fullName: 'Ana Rivera',
    orgCode: 'ACME-MFG',
  },
  {
    email: 'k.osei@medilink.demo',
    fullName: 'Kwame Osei',
    orgCode: 'MEDILINK-DIST',
  },
  {
    email: 'l.park@careplus.demo',
    fullName: 'Lena Park',
    orgCode: 'CAREPLUS-RTL',
  },
  {
    email: 'inspector@ndra.demo',
    fullName: 'Inspector Doyle',
    orgCode: 'NDRA-REG',
  },
]

for (const account of demoAccounts) {
  const organizationId = await getOrgIdByCode(account.orgCode)

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: account.email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: {
      full_name: account.fullName,
      organization_id: organizationId,
    },
  })

  if (createError) {
    if (createError.message?.toLowerCase().includes('already been registered')) {
      console.log(`[v0] ${account.email} already exists, skipping`)
      continue
    }
    console.error(`[v0] Failed to create ${account.email}:`, createError.message)
    continue
  }

  console.log(`[v0] Created ${account.email} (user ${created.user.id}) for org ${account.orgCode}`)
}

console.log('[v0] Done seeding demo users.')
