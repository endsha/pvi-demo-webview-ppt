import type { ComponentType } from 'react'
import {
  CheckCircleFilled,
  CloseCircleFilled,
  LoadingOutlined,
  MinusCircleFilled,
} from '@ant-design/icons'
import { CLAIM_STATUS_META, type ClaimStatus } from '../claims-helpers'
import { cn } from '@/utils/cn'

const STATUS_ICON: Record<ClaimStatus, ComponentType> = {
  processing: LoadingOutlined,
  rejected: CloseCircleFilled,
  paid: CheckCircleFilled,
  closed: MinusCircleFilled,
}

interface ClaimStatusBadgeProps {
  status: ClaimStatus
}

export function ClaimStatusBadge({ status }: ClaimStatusBadgeProps) {
  const { label, colorClass } = CLAIM_STATUS_META[status]
  const Icon = STATUS_ICON[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap font-medium', colorClass)}>
      <Icon />
      {label}
    </span>
  )
}
