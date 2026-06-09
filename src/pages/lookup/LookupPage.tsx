import { LookupHero } from './components/LookupHero'
import { LookupForm } from './components/LookupForm'

export function LookupPage() {
  return (
    <main className="flex-1">
      <LookupHero />
      <LookupForm />
    </main>
  )
}
