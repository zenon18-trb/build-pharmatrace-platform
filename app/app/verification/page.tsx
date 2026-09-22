'use client'

import { useState, type FormEvent } from 'react'
import { Search, ShieldCheck } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/app-shell/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { VerificationPanel } from '@/components/verification/verification-panel'
import { resolveVerification } from '@/lib/domain/data'
import type { VerificationResult } from '@/lib/domain/types'

export default function VerificationPage() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<VerificationResult | null>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setResult(resolveVerification(query.trim()))
  }

  return (
    <div>
      <PageHeader
        title="Verification"
        description="Look up a batch by its public verification ID or batch number to check authenticity and provenance."
      />

      <Card className="mx-auto max-w-2xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-text-muted" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. a1b2c3d4-verify-pcm-001 or PCM-2026-001"
                className="pl-8"
              />
            </div>
            <Button type="submit" disabled={!query.trim()}>
              Verify
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mx-auto mt-6 max-w-2xl">
        {result ? (
          <VerificationPanel result={result} />
        ) : (
          <EmptyState
            icon={<ShieldCheck className="size-6" />}
            title="No lookup yet"
            description="Enter a verification ID or batch number above to see its authenticity result."
          />
        )}
      </div>
    </div>
  )
}
