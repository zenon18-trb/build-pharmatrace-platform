'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ScanLine } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function VerifyCta({ sampleId }: { sampleId: string }) {
  const router = useRouter()
  const [code, setCode] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const value = code.trim()
    if (value) router.push(`/verify/${encodeURIComponent(value)}`)
  }

  return (
    <form onSubmit={submit} className="flex w-full flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <ScanLine className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted" />
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter batch verification code"
          aria-label="Batch verification code"
          className="h-11 w-full rounded-md border border-border-default bg-surface-card pr-3 pl-9 text-sm text-text-primary placeholder:text-text-muted focus:border-border-active focus:ring-3 focus:ring-brand-secondary/15 focus:outline-none"
        />
      </div>
      <Button type="submit" className="h-11 px-5 text-white">
        Verify medicine
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-11 px-5"
        onClick={() => router.push(`/verify/${sampleId}`)}
      >
        Try a sample
      </Button>
    </form>
  )
}
