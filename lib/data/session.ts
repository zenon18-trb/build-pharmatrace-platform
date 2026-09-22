import { createClient } from '@/lib/supabase/server'
import type { Role } from '@/lib/domain/types'

export interface SessionProfile {
  userId: string
  email: string
  fullName: string | null
  role: Role
  organizationId: string
  organizationName: string
  organizationCode: string
  organizationType: string
  walletAddress: string | null
}

/**
 * Loads the current authenticated user's profile + organization.
 * Returns null if there is no session or no profile row (e.g. mid sign-up).
 */
export async function getSessionProfile(): Promise<SessionProfile | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile, error } = await supabase
    .from('profiles')
    .select(
      'id, full_name, email, role, organization_id, organizations(legal_name, code, type, wallet_address)',
    )
    .eq('id', user.id)
    .maybeSingle()

  if (error || !profile) return null

  const org = profile.organizations as unknown as {
    legal_name: string
    code: string
    type: string
    wallet_address: string | null
  } | null

  if (!org) return null

  return {
    userId: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role as Role,
    organizationId: profile.organization_id,
    organizationName: org.legal_name,
    organizationCode: org.code,
    organizationType: org.type,
    walletAddress: org.wallet_address,
  }
}
