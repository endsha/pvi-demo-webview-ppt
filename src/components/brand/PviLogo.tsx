import { cn } from '@/utils/cn'
import logoUrl from '@/assets/big-logo-pvi.png'

interface PviLogoProps {
  variant?: 'color' | 'white'
  className?: string
}

// Official PVI Insurance mark. The `white` variant renders a monochrome
// white version so the logo stays legible on dark surfaces (e.g. the footer).
export function PviLogo({ variant = 'color', className }: PviLogoProps) {
  return (
    <img
      src={logoUrl}
      alt="PVI Insurance"
      width={408}
      height={149}
      className={cn('h-10 w-auto', variant === 'white' && 'brightness-0 invert', className)}
    />
  )
}
