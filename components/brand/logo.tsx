import { ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string
  showWordmark?: boolean
}) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className="flex size-8 items-center justify-center rounded-md bg-brand-primary text-white">
        <ShieldCheck className="size-[18px]" strokeWidth={1.75} />
      </span>
      {showWordmark && (
        <span className="text-base font-semibold tracking-tight text-text-primary">
          PharmaTrace
        </span>
      )}
    </span>
  )
}
