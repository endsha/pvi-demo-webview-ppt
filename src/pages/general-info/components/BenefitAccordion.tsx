import { Collapse, Empty } from 'antd'
import type { Benefit } from '../general-info-helpers'
import { formatVnd } from '../general-info-helpers'

interface BenefitAccordionProps {
  benefits: Benefit[]
}

function DetailRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-gray-500">• {label}</span>
      <span className="text-sm font-medium text-gray-900">{formatVnd(value)}</span>
    </div>
  )
}

export function BenefitAccordion({ benefits }: BenefitAccordionProps) {
  if (benefits.length === 0) {
    return <Empty description="Không có quyền lợi phù hợp" className="py-8" />
  }

  return (
    <Collapse
      expandIconPosition="end"
      items={benefits.map((b) => ({
        key: b.id,
        label: (
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col">
              <span className="font-semibold text-pvi-navy">
                {b.order}. {b.title}
              </span>
              {b.description && (
                <span className="mt-1 text-xs text-gray-400">{b.description}</span>
              )}
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Hạn mức bảo hiểm tối đa</div>
              <div className="font-bold text-pvi-red">{formatVnd(b.maxLimit)}</div>
            </div>
          </div>
        ),
        children: (
          <div className="px-1">
            <DetailRow label="Hạn mức tích lũy" value={b.detail.accumulatedLimit} />
            <DetailRow label="Số tiền đã chi trả" value={b.detail.paidAmount} />
            <DetailRow label="Ước bồi thường phát sinh" value={b.detail.estimatedClaim} />
          </div>
        ),
      }))}
    />
  )
}
