'use client'

import Link from 'next/link'
import { Bell, Menu } from 'lucide-react'
import { useRole } from './role-context'
import { ThemeToggle } from './theme-toggle'
import { Button } from '@/components/ui/button'
import { roleLabels } from '@/lib/config/navigation'
import { alerts } from '@/lib/domain/data'
import type { Role } from '@/lib/domain/types'

const roles: Role[] = ['MANUFACTURER', 'DISTRIBUTOR', 'RETAILER', 'ADMIN']

export function Topbar({ onOpenNav }: { onOpenNav: () => void }) {
  const { role, user, setRole } = useRole()
  const alertCount = alerts.length

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border-default bg-surface-card/80 px-4 backdrop-blur sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onOpenNav}
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </Button>

      <div className="flex-1" />

      <label className="hidden items-center gap-2 sm:flex">
        <span className="text-xs text-text-muted">View as</span>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="h-9 rounded-md border border-border-default bg-surface-card px-2.5 text-sm text-text-primary focus:border-border-active focus:ring-3 focus:ring-brand-secondary/15 focus:outline-none"
        >
          {roles.map((r) => (
            <option key={r} value={r}>
              {roleLabels[r]}
            </option>
          ))}
        </select>
      </label>

        <Button
          render={<Link href="/app/alerts" />}
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Alerts"
        >
          <Bell className="size-4" />
          {alertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-danger text-[10px] font-semibold text-white">
              {alertCount}
            </span>
          )}
        </Button>

      <ThemeToggle />

      <div className="flex items-center gap-2.5 border-l border-border-subtle pl-3">
        <span className="flex size-8 items-center justify-center rounded-full bg-brand-primary text-xs font-semibold text-white">
          {user.name
            .split(' ')
            .map((n) => n[0])
            .join('')}
        </span>
        <div className="hidden leading-tight sm:block">
          <p className="text-sm font-medium text-text-primary">{user.name}</p>
          <p className="text-xs text-text-muted">{user.organizationName}</p>
        </div>
      </div>
    </header>
  )
}
