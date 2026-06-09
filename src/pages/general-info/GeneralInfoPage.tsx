import { useState } from 'react'
import { GeneralInfoHeader } from './components/GeneralInfoHeader'
import { InfoTabs, type InfoTabKey } from './components/InfoTabs'
import { ClaimsSection } from './components/ClaimsSection'
import { PolicyInfoSection } from './components/PolicyInfoSection'
import { BenefitsSection } from './components/BenefitsSection'
import { AccumulationSection } from './components/AccumulationSection'

export function GeneralInfoPage() {
  const [activeTab, setActiveTab] = useState<InfoTabKey>('general')

  return (
    <main className="flex-1 bg-form-band">
      <GeneralInfoHeader />
      <InfoTabs active={activeTab} onChange={setActiveTab} />
      {activeTab === 'general' ? (
        <div className="mx-auto w-full max-w-3xl px-4 py-6">
          <div className="flex flex-col gap-6">
            <PolicyInfoSection />
            <BenefitsSection />
            <AccumulationSection />
          </div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-5xl px-4 py-6">
          <ClaimsSection />
        </div>
      )}
    </main>
  )
}
