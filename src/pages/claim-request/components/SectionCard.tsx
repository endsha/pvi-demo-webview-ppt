import { Collapse } from 'antd'
import type { ReactNode } from 'react'

interface SectionCardProps {
  title: ReactNode
  children: ReactNode
}

export function SectionCard({ title, children }: SectionCardProps) {
  return (
    <Collapse
      defaultActiveKey={['1']}
      expandIconPosition="end"
      className="border-0 bg-white shadow-sm [&_.ant-collapse-content-box]:px-6 [&_.ant-collapse-header]:px-6"
      items={[
        {
          key: '1',
          label: <span className="text-lg font-bold text-pvi-navy">{title}</span>,
          children,
        },
      ]}
    />
  )
}
