import { cn } from '@/utils/cn'

interface PviLogoProps {
  variant?: 'color' | 'white'
  className?: string
}

// NOTE: inline-SVG recreation of the PVI mark. Replace with the official
// asset when available — keep this component's API the same.
export function PviLogo({ variant = 'color', className }: PviLogoProps) {
  const textClass = variant === 'white' ? 'text-white' : 'text-pvi-navy'

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path
          d="M20 2 L24.5 15.5 L38 20 L24.5 24.5 L20 38 L15.5 24.5 L2 20 L15.5 15.5 Z"
          fill="#E4002B"
        />
        <path
          d="M20 9 L22.7 17.3 L31 20 L22.7 22.7 L20 31 L17.3 22.7 L9 20 L17.3 17.3 Z"
          fill="#FFFFFF"
        />
      </svg>
      <span className="flex flex-col leading-none">
        <span className={cn('text-2xl font-extrabold tracking-tight', textClass)}>PVI</span>
        <span className={cn('text-[10px] font-semibold tracking-[0.2em]', textClass)}>
          INSURANCE
        </span>
      </span>
    </span>
  )
}
