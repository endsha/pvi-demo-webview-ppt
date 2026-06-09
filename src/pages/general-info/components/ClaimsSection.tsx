import { useMemo, useState } from 'react'
import { Button, Input, Pagination } from 'antd'
import { ArrowRightOutlined } from '@ant-design/icons'
import { ClaimsTable } from './ClaimsTable'
import { ClaimStatusFilter } from './ClaimStatusFilter'
import { MOCK_CLAIM_REQUESTS } from '../mock-claims'
import {
  filterClaimsByStatus,
  searchClaims,
  CLAIMS_PAGE_SIZE,
  type ClaimStatusFilterValue,
} from '../claims-helpers'
import { paginate } from '../general-info-helpers'

export function ClaimsSection() {
  const [statusFilter, setStatusFilter] = useState<ClaimStatusFilterValue>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(
    () => searchClaims(filterClaimsByStatus(MOCK_CLAIM_REQUESTS, statusFilter), search),
    [statusFilter, search],
  )
  const paged = useMemo(() => paginate(filtered, page, CLAIMS_PAGE_SIZE), [filtered, page])

  const handleStatus = (v: ClaimStatusFilterValue) => {
    setStatusFilter(v)
    setPage(1)
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-xl font-bold text-pvi-navy">Danh sách yêu cầu bồi thường</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input.Search
            className="w-full sm:w-56"
            placeholder="Tìm kiếm"
            allowClear
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
          <ClaimStatusFilter value={statusFilter} onChange={handleStatus} />
          <Button type="primary" iconPosition="end" icon={<ArrowRightOutlined />}>
            Gửi yêu cầu bồi thường
          </Button>
        </div>
      </div>

      <ClaimsTable claims={paged} />

      <div className="mt-5 flex justify-center">
        <Pagination
          current={page}
          pageSize={CLAIMS_PAGE_SIZE}
          total={filtered.length}
          onChange={setPage}
          showSizeChanger={false}
        />
      </div>
    </div>
  )
}
