import { Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { AccumulationOrder } from '../general-info-helpers'
import { formatVnd, formatDateTime } from '../general-info-helpers'

interface AccumulationTableProps {
  orders: AccumulationOrder[]
}

const VEHICLE_ICON: Record<AccumulationOrder['vehicle'], string> = {
  motorbike: '🛵',
  car: '🚗',
}

const columns: ColumnsType<AccumulationOrder> = [
  {
    title: 'Loại xe',
    dataIndex: 'vehicle',
    width: 80,
    render: (vehicle: AccumulationOrder['vehicle']) => (
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-form-band text-lg">
        {VEHICLE_ICON[vehicle]}
      </span>
    ),
  },
  { title: 'Mã chuyến', dataIndex: 'tripCode' },
  {
    title: 'Số tiền tích lũy / chuyến',
    dataIndex: 'amount',
    render: (amount: number) => <span className="text-pvi-navy">{formatVnd(amount)}</span>,
  },
  {
    title: 'Thời gian hoàn thành chuyến',
    dataIndex: 'completedAt',
    render: (at: string) => formatDateTime(at),
  },
]

export function AccumulationTable({ orders }: AccumulationTableProps) {
  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={orders}
      pagination={false}
      scroll={{ x: 'max-content' }}
      locale={{ emptyText: 'Không tìm thấy chuyến phù hợp' }}
    />
  )
}
