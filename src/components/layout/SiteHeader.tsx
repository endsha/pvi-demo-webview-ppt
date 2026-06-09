import { PviLogo } from '@/components/brand/PviLogo'

export function SiteHeader() {
  return (
    <header className="flex w-full items-center justify-center border-b border-gray-100 bg-white py-4">
      <PviLogo variant="color" />
    </header>
  )
}
