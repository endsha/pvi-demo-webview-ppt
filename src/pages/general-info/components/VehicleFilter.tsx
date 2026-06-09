import { Segmented } from 'antd'
import type { VehicleFilterValue } from '../general-info-helpers'

interface VehicleFilterProps {
  value: VehicleFilterValue
  onChange: (value: VehicleFilterValue) => void
}

const OPTIONS: { value: VehicleFilterValue; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'motorbike', label: 'Xe máy' },
  { value: 'car', label: 'Ô tô' },
]

export function VehicleFilter({ value, onChange }: VehicleFilterProps) {
  return (
    <Segmented
      value={value}
      onChange={(v) => onChange(v as VehicleFilterValue)}
      options={OPTIONS}
    />
  )
}
