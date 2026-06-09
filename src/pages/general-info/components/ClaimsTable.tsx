import { Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { ClaimRequest } from '../claims-helpers'
import { formatVnd, formatDate, formatDateTime } from '../general-info-helpers'
import { ClaimStatusBadge } from './ClaimStatusBadge'

interface ClaimsTableProps {
  claims: ClaimRequest[]
}

const columns: ColumnsType<ClaimRequest> = [
  {
    title: 'Số yêu cầu',
    dataIndex: 'requestNo',
    render: (requestNo: string) => (
      <button type="button" className="font-semibold text-blue-600 hover:underline">
        {requestNo}
      </button>
    ),
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    render: (status: ClaimRequest['status']) => <ClaimStatusBadge status={status} />,
  },
  {
    title: 'Ngày tạo',
    dataIndex: 'createdAt',
    render: (at: string) => formatDateTime(at),
  },
  {
    title: 'Ngày tai nạn',
    dataIndex: 'accidentDate',
    render: (at: string) => formatDate(at),
  },
  {
    title: 'Tổng số tiền yêu cầu chi trả',
    dataIndex: 'requestedAmount',
    render: (amount: number) => formatVnd(amount),
  },
  {
    title: 'Số tiền đã chi trả',
    dataIndex: 'paidAmount',
    render: (amount: number) => formatVnd(amount),
  },
]

export function ClaimsTable({ claims }: ClaimsTableProps) {
  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={claims}
      pagination={false}
      scroll={{ x: 'max-content' }}
      locale={{ emptyText: 'Không tìm thấy yêu cầu phù hợp' }}
    />
  )
}
