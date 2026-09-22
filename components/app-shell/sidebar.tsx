'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Link2 } from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { useRole } from './role-context'
import { iconMap } from './icon-map'
import { navForRole, roleLabels } from '@/lib/config/navigation'
import { cn } from '@/lib/utils'

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { role } = useRole()
  const items = navForRole(role)

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center px-5">
        <Link href="/app/dashboard" onClick={onNavigate}>
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {items.map((item) => {
          const Icon = iconMap[item.icon]
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-accent-highlight text-brand-secondary'
                  : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary',
              )}
            >
              {Icon && <Icon className="size-[18px]" strokeWidth={1.75} />}
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="shrink-0 border-t border-border-subtle p-3">
        <div className="rounded-md bg-surface-subtle px-3 py-2.5">
          <p className="text-xs font-medium text-text-secondary">{roleLabels[role]}</p>
          <p className="mt-1 inline-flex items-center gap-1.5 font-mono text-[11px] text-text-muted">
            <Link2 className="size-3" strokeWidth={1.75} />
            Polygon Amoy · 80002
          </p>
        </div>
      </div>
    </div>
  )
}
