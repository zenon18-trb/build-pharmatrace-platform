'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { roleLabels } from '@/lib/config/navigation'
import type { Role } from '@/lib/domain/types'

const roles: Role[] = ['MANUFACTURER', 'DISTRIBUTOR', 'RETAILER', 'ADMIN']

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState<Role>('MANUFACTURER')

  function enter() {
    window.localStorage.setItem('pharmatrace.role', role)
    router.push('/app/dashboard')
  }

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="flex h-16 items-center justify-center border-b border-border-default bg-surface-card">
        <Link href="/">
          <Logo />
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md p-8">
          <h1 className="text-xl font-bold tracking-tight text-text-primary">
            Sign in to PharmaTrace
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            This demo lets you explore the platform from any role. Choose a role to
            continue.
          </p>

          <div className="mt-6 space-y-2">
            {roles.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                aria-pressed={role === r}
                className={`flex w-full items-center justify-between rounded-md border px-4 py-3 text-left text-sm font-medium transition-colors ${
                  role === r
                    ? 'border-border-active bg-accent-highlight text-brand-secondary'
                    : 'border-border-default text-text-secondary hover:bg-surface-subtle'
                }`}
              >
                {roleLabels[r]}
                <span
                  className={`size-4 rounded-full border-2 ${
                    role === r
                      ? 'border-brand-secondary bg-brand-secondary'
                      : 'border-border-default'
                  }`}
                  aria-hidden
                />
              </button>
            ))}
          </div>

          <Button className="mt-6 w-full" onClick={enter}>
            Continue as {roleLabels[role]}
          </Button>

          <p className="mt-4 text-center text-xs text-text-muted">
            No account needed — this is a demonstration environment.
          </p>
        </Card>
      </main>
    </div>
  )
}
