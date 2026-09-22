import Link from 'next/link'
import type { Metadata } from 'next'
import { Logo } from '@/components/brand/logo'
import { VerificationPanel } from '@/components/verification/verification-panel'
import { resolveVerification } from '@/lib/domain/data'

export const metadata: Metadata = {
  title: 'Verify medicine',
  description: 'Verify the authenticity and provenance of a PharmaTrace medicine batch.',
}

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ publicId: string }>
}) {
  const { publicId } = await params
  const result = resolveVerification(decodeURIComponent(publicId))

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="border-b border-border-default bg-surface-card">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-center px-4">
          <Link href="/">
            <Logo />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
        <VerificationPanel result={result} />

        <p className="mx-auto mt-10 max-w-md text-center text-xs leading-relaxed text-text-muted">
          PharmaTrace provides digital traceability and verification evidence.
          Regulatory compliance and product authenticity remain subject to applicable
          laws, official recall notices, and physical inspection.
        </p>
      </main>
    </div>
  )
}
