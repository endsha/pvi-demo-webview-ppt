import { cn } from '@/utils/cn'

export type InfoTabKey = 'general' | 'claims'

interface InfoTabsProps {
  active: InfoTabKey
  onChange: (key: InfoTabKey) => void
}

const TABS: { key: InfoTabKey; label: string }[] = [
  { key: 'general', label: 'Thông tin chung' },
  { key: 'claims', label: 'Yêu cầu bồi thường' },
]

export function InfoTabs({ active, onChange }: InfoTabsProps) {
  return (
    <div className="flex w-full border-b border-gray-200 bg-white">
      {TABS.map((tab) => {
        const isActive = tab.key === active
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={cn(
              'flex-1 border-b-2 px-4 py-3 text-center text-sm font-semibold transition-colors',
              isActive
                ? 'border-pvi-red text-pvi-red'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
