'use client'

import { useState, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { SidebarContent } from './sidebar'
import { Topbar } from './topbar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function AppShell({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false)

  return (
    <div className="min-h-dvh bg-canvas">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border-default bg-surface-card lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {navOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-brand-primary/40 backdrop-blur-sm"
            onClick={() => setNavOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 w-64 border-r border-border-default bg-surface-card shadow-elevation-3">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-3"
              onClick={() => setNavOpen(false)}
              aria-label="Close navigation"
            >
              <X className="size-4" />
            </Button>
            <SidebarContent onNavigate={() => setNavOpen(false)} />
          </div>
        </div>
      )}

      <div className={cn('lg:pl-64')}>
        <Topbar onOpenNav={() => setNavOpen(true)} />
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  )
}
