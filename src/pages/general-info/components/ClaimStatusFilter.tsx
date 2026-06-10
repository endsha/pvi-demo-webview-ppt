import { Button, Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import { CheckOutlined, FilterOutlined } from '@ant-design/icons'
import {
  CLAIM_STATUS_FILTER_OPTIONS,
  type ClaimStatusFilterValue,
} from '../claims-helpers'

interface ClaimStatusFilterProps {
  value: ClaimStatusFilterValue
  onChange: (value: ClaimStatusFilterValue) => void
}

export function ClaimStatusFilter({ value, onChange }: ClaimStatusFilterProps) {
  const items: MenuProps['items'] = CLAIM_STATUS_FILTER_OPTIONS.map((opt) => ({
    key: opt.value,
    label: (
      <span className="flex min-w-32 items-center justify-between gap-6">
        {opt.label}
        {opt.value === value && <CheckOutlined className="text-pvi-navy" />}
      </span>
    ),
  }))

  return (
    <Dropdown
      trigger={['click']}
      menu={{ items, onClick: ({ key }) => onChange(key as ClaimStatusFilterValue) }}
    >
      <Button
        icon={<FilterOutlined />}
        aria-label="Lọc theo trạng thái"
        className="aspect-square !px-0"
      />
    </Dropdown>
  )
}
