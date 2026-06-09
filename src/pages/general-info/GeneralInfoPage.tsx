import { useState } from 'react'
import { GeneralInfoHeader } from './components/GeneralInfoHeader'
import { InfoTabs, type InfoTabKey } from './components/InfoTabs'
import { ClaimsPlaceholder } from './components/ClaimsPlaceholder'
import { PolicyInfoSection } from './components/PolicyInfoSection'

export function GeneralInfoPage() {
  const [activeTab, setActiveTab] = useState<InfoTabKey>('general')

  return (
    <main className="flex-1 bg-form-band">
      <GeneralInfoHeader />
      <InfoTabs active={activeTab} onChange={setActiveTab} />
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        {activeTab === 'general' ? (
          <div className="flex flex-col gap-6">
            <PolicyInfoSection />
          </div>
        ) : (
          <ClaimsPlaceholder />
        )}
      </div>
    </main>
  )
}
