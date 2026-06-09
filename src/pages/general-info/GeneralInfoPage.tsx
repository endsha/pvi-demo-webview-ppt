import { useState } from 'react'
import { GeneralInfoHeader } from './components/GeneralInfoHeader'
import { InfoTabs, type InfoTabKey } from './components/InfoTabs'
import { ClaimsPlaceholder } from './components/ClaimsPlaceholder'

export function GeneralInfoPage() {
  const [activeTab, setActiveTab] = useState<InfoTabKey>('general')

  return (
    <main className="flex-1 bg-form-band">
      <GeneralInfoHeader />
      <InfoTabs active={activeTab} onChange={setActiveTab} />
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        {activeTab === 'general' ? (
          <div className="text-center text-gray-400">Sections coming in next tasks</div>
        ) : (
          <ClaimsPlaceholder />
        )}
      </div>
    </main>
  )
}
