import type { ReactNode } from 'react'
import { RoleProvider } from '@/components/app-shell/role-context'
import { AppShell } from '@/components/app-shell/app-shell'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <RoleProvider>
      <AppShell>{children}</AppShell>
    </RoleProvider>
  )
}
