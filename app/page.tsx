import Link from 'next/link'
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  Factory,
  Link2,
  QrCode,
  ShieldCheck,
  Store,
  Truck,
} from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { VerifyCta } from '@/components/verification/verify-cta'
import { batches } from '@/lib/domain/data'

const loop = [
  {
    icon: Factory,
    title: 'Create',
    body: 'Manufacturers register medicines and batches, generating a unique verification identity for every unit.',
  },
  {
    icon: Link2,
    title: 'Track',
    body: 'Critical provenance events are anchored on Polygon Amoy as a tamper-evident record.',
  },
  {
    icon: Truck,
    title: 'Transfer',
    body: 'Custody moves manufacturer → distributor → retailer, each step signed and auditable.',
  },
  {
    icon: Boxes,
    title: 'Receive',
    body: 'Recipients verify provenance before inventory is accepted — mismatches are blocked.',
  },
  {
    icon: QrCode,
    title: 'Verify',
    body: 'Patients scan a QR code to confirm authenticity. No wallet, no login, no crypto.',
  },
]

const chainNodes = [
  { icon: Factory, label: 'Manufacturer' },
  { icon: Truck, label: 'Distributor' },
  { icon: Store, label: 'Retailer' },
  { icon: QrCode, label: 'Patient' },
]

export default function LandingPage() {
  const sampleId = batches[0]!.publicVerificationId

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="sticky top-0 z-40 border-b border-border-default bg-surface-card/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm text-text-secondary md:flex">
            <a href="#how" className="transition-colors hover:text-text-primary">
              How it works
            </a>
            <a href="#verify" className="transition-colors hover:text-text-primary">
              Verify a medicine
            </a>
            <a href="#trust" className="transition-colors hover:text-text-primary">
              Trust model
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" className="h-9 px-3">
                Sign in
              </Button>
            </Link>
            <Link href="/app/dashboard">
              <Button className="h-9 px-4 text-white">
                Open app
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pt-16 pb-12 sm:px-6 sm:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-success-bg px-3 py-1 text-xs font-medium text-success">
                <ShieldCheck className="size-3.5" strokeWidth={1.75} />
                Tamper-evident provenance
              </span>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance text-text-primary sm:text-5xl">
                Trust in every dose.
              </h1>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-text-secondary">
                PharmaTrace tracks pharmaceutical batches from manufacturer to
                patient, creating an auditable trail that anyone can verify — and
                counterfeiters cannot forge.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/app/dashboard">
                  <Button className="h-11 px-5 text-white">
                    Explore the platform
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <a href="#verify">
                  <Button variant="outline" className="h-11 px-5">
                    <QrCode className="size-4" />
                    Verify a medicine
                  </Button>
                </a>
              </div>
              <dl className="mt-10 grid max-w-md grid-cols-3 gap-6">
                {[
                  ['Operational truth', 'PostgreSQL'],
                  ['Provenance layer', 'Polygon Amoy'],
                  ['Patient access', 'Walletless'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-text-muted">{label}</dt>
                    <dd className="mt-1 text-sm font-semibold text-text-primary">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Supply-chain visualization */}
            <div className="rounded-xl border border-border-default bg-surface-card p-6 shadow-elevation-2">
              <p className="text-xs font-medium tracking-wide text-text-muted uppercase">
                Live supply chain
              </p>
              <div className="mt-5 space-y-3">
                {chainNodes.map((node, i) => (
                  <div key={node.label}>
                    <div className="flex items-center gap-3 rounded-md border border-border-subtle bg-surface-subtle px-4 py-3">
                      <span className="flex size-9 items-center justify-center rounded-md bg-surface-card text-brand-secondary shadow-elevation-1">
                        <node.icon className="size-[18px]" strokeWidth={1.75} />
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-text-primary">
                          {node.label}
                        </p>
                        <p className="font-mono text-xs text-text-muted">
                          {i < 3 ? 'Custody confirmed' : 'Scan to verify'}
                        </p>
                      </div>
                      <CheckCircle2 className="size-4 text-success" strokeWidth={1.75} />
                    </div>
                    {i < chainNodes.length - 1 && (
                      <div className="ml-[34px] h-4 w-px bg-border-default" aria-hidden />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="border-y border-border-default bg-surface-subtle/50">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="text-2xl font-bold tracking-tight text-text-primary">
              The core loop
            </h2>
            <p className="mt-2 max-w-2xl text-text-secondary">
              Create → Track → Transfer → Receive → Verify. Every critical event is
              recorded operationally and anchored on-chain.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {loop.map((step, i) => (
                <div
                  key={step.title}
                  className="rounded-lg border border-border-default bg-surface-card p-5 shadow-elevation-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex size-9 items-center justify-center rounded-md bg-accent-highlight text-brand-secondary">
                      <step.icon className="size-[18px]" strokeWidth={1.75} />
                    </span>
                    <span className="font-mono text-xs text-text-muted">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-text-primary">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Verify CTA */}
        <section id="verify" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="rounded-xl border border-border-default bg-surface-card p-8 shadow-elevation-2 sm:p-12">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-info-bg px-3 py-1 text-xs font-medium text-info">
                <QrCode className="size-3.5" strokeWidth={1.75} />
                Public verification
              </span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-text-primary">
                Verify a medicine batch
              </h2>
              <p className="mt-2 text-text-secondary">
                Enter the code printed on the pack or scan its QR. Verification is
                instant and requires no account.
              </p>
              <div className="mt-6">
                <VerifyCta sampleId={sampleId} />
              </div>
            </div>
          </div>
        </section>

        {/* Trust model */}
        <section id="trust" className="border-t border-border-default bg-surface-subtle/50">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <h2 className="text-2xl font-bold tracking-tight text-text-primary">
                  Trust before technology
                </h2>
                <p className="mt-2 text-text-secondary">
                  The database remains the operational source of truth. The blockchain
                  is a supporting provenance layer — not the product identity.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
                {[
                  {
                    icon: ShieldCheck,
                    title: 'Tamper-evident',
                    body: 'Critical custody events are anchored on-chain and cannot be silently altered.',
                  },
                  {
                    icon: Boxes,
                    title: 'Operational source of truth',
                    body: 'Rich medicine, inventory and invoice data lives in PostgreSQL with RLS.',
                  },
                  {
                    icon: QrCode,
                    title: 'Walletless for patients',
                    body: 'No MetaMask, no gas, no keys. Patients simply scan and read a result.',
                  },
                  {
                    icon: Link2,
                    title: 'Confirmed, never optimistic',
                    body: 'The UI shows Pending until a transaction is actually confirmed on-chain.',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-lg border border-border-default bg-surface-card p-5 shadow-elevation-1"
                  >
                    <span className="flex size-9 items-center justify-center rounded-md bg-surface-subtle text-brand-secondary">
                      <item.icon className="size-[18px]" strokeWidth={1.75} />
                    </span>
                    <h3 className="mt-4 text-sm font-semibold text-text-primary">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border-default bg-surface-card">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <Logo />
          <p className="text-xs text-text-muted">
            PharmaTrace provides digital traceability evidence. It does not by itself
            constitute regulatory certification.
          </p>
        </div>
      </footer>
    </div>
  )
}
