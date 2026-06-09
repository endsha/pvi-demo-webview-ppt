import { useMemo, useState } from 'react'
import { Collapse, DatePicker, Input, Pagination, Select } from 'antd'
import dayjs from 'dayjs'
import { VehicleFilter } from './VehicleFilter'
import { AccumulationTable } from './AccumulationTable'
import { MOCK_ACCUMULATION_ORDERS, DEFAULT_RANGE_FROM, DEFAULT_RANGE_TO } from '../mock-data'
import {
  filterOrdersByVehicle,
  searchOrders,
  sortOrders,
  paginate,
  sumOrderAmount,
  formatVnd,
  ACCUMULATION_PAGE_SIZE,
  type SortOrder,
  type VehicleFilterValue,
} from '../general-info-helpers'

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
]

export function AccumulationSection() {
  const [vehicle, setVehicle] = useState<VehicleFilterValue>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOrder>('newest')
  const [page, setPage] = useState(1)

  const filtered = useMemo(
    () => filterOrdersByVehicle(MOCK_ACCUMULATION_ORDERS, vehicle),
    [vehicle],
  )
  const visible = useMemo(
    () => sortOrders(searchOrders(filtered, search), sort),
    [filtered, search, sort],
  )
  const paged = useMemo(
    () => paginate(visible, page, ACCUMULATION_PAGE_SIZE),
    [visible, page],
  )

  const handleVehicle = (v: VehicleFilterValue) => {
    setVehicle(v)
    setPage(1)
  }

  return (
    <Collapse
      defaultActiveKey={['accumulation']}
      expandIconPosition="end"
      items={[
        {
          key: 'accumulation',
          label: (
            <span className="text-base font-bold">III. Chi tiết các đơn bảo hiểm tích lũy</span>
          ),
          extra: (
            <div onClick={(e) => e.stopPropagation()}>
              <VehicleFilter value={vehicle} onChange={handleVehicle} />
            </div>
          ),
          children: (
            <div className="flex flex-col gap-5">
              <div>
                <div className="mb-2 text-sm font-semibold text-gray-700">Thời hạn tích lũy</div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <DatePicker
                    className="w-full sm:w-48"
                    format="DD/MM/YYYY"
                    defaultValue={dayjs(DEFAULT_RANGE_FROM)}
                  />
                  <DatePicker
                    className="w-full sm:w-48"
                    format="DD/MM/YYYY"
                    defaultValue={dayjs(DEFAULT_RANGE_TO)}
                  />
                </div>
              </div>

              <div className="rounded-lg bg-form-band p-4">
                <div className="mb-2 text-sm font-semibold text-gray-700">Tổng số tích lũy</div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-gray-500">Số đơn bảo hiểm đã tích lũy</span>
                  <span className="font-semibold text-pvi-red">{filtered.length}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-gray-500">Số tiền bảo hiểm đã tích lũy</span>
                  <span className="font-semibold text-pvi-navy">
                    {formatVnd(sumOrderAmount(filtered))}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="text-sm font-semibold text-gray-700">
                  Danh sách các đơn BH tích lũy
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Input.Search
                    className="w-full sm:max-w-xs"
                    placeholder="Tìm kiếm"
                    allowClear
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setPage(1)
                    }}
                  />
                  <Select
                    className="w-full sm:w-40"
                    value={sort}
                    options={SORT_OPTIONS}
                    onChange={(v) => setSort(v)}
                  />
                </div>
              </div>

              <AccumulationTable orders={paged} />

              <div className="flex justify-center">
                <Pagination
                  current={page}
                  pageSize={ACCUMULATION_PAGE_SIZE}
                  total={visible.length}
                  onChange={setPage}
                  showSizeChanger={false}
                />
              </div>
            </div>
          ),
        },
      ]}
    />
  )
}
