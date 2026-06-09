import { useState, type ReactNode } from 'react'
import { Button, Collapse, DatePicker, Select } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { MOCK_POLICY_INFO, DEFAULT_LOOKUP_DATE } from '../mock-data'
import { formatDate, formatVnd } from '../general-info-helpers'

interface InfoRowProps {
  label: string
  children: ReactNode
}

function InfoRow({ label, children }: InfoRowProps) {
  return (
    <div className="flex flex-col gap-1 py-2 sm:flex-row sm:items-center sm:gap-4">
      <span className="text-sm text-gray-500 sm:w-64 sm:shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900">{children}</span>
    </div>
  )
}

export function PolicyInfoSection() {
  const info = MOCK_POLICY_INFO
  const [lookupDate, setLookupDate] = useState<Dayjs>(dayjs(DEFAULT_LOOKUP_DATE))
  const [committedDate, setCommittedDate] = useState<Dayjs>(dayjs(DEFAULT_LOOKUP_DATE))

  const handleLookup = () => {
    // UI-only: re-applies the chosen date to the displayed accumulated label. No API.
    setCommittedDate(lookupDate)
  }

  return (
    <Collapse
      defaultActiveKey={['info']}
      expandIconPosition="end"
      items={[
        {
          key: 'info',
          label: <span className="text-base font-bold">I. Thông tin chung</span>,
          children: (
            <div className="rounded-lg bg-white p-4">
              <InfoRow label="Họ và tên">{info.fullName}</InfoRow>
              <InfoRow label="Mã Tài xế GSM">{info.driverCode}</InfoRow>
              <InfoRow label="Chọn Customer Partner ID">
                <Select
                  className="w-full sm:w-80"
                  value={info.partnerId}
                  options={[{ value: info.partnerId, label: info.partnerId }]}
                />
              </InfoRow>
              <InfoRow label="Số điện thoại">{info.phone}</InfoRow>
              <InfoRow label={`Số tiền bảo hiểm tích lũy đến ${formatDate(committedDate.toDate())}`}>
                {formatVnd(info.accumulatedAmount)}
              </InfoRow>
              <InfoRow label="Hợp đồng nguyên tắc">
                <span className="cursor-pointer text-pvi-navy underline">{info.contractNo}</span>
              </InfoRow>

              <div className="mt-4 flex flex-col gap-3 rounded-lg bg-form-band p-4 sm:flex-row sm:items-center">
                <span className="text-sm text-gray-500 sm:w-64 sm:shrink-0">Ngày tra cứu</span>
                <DatePicker
                  className="w-full sm:w-60"
                  format="DD/MM/YYYY"
                  allowClear={false}
                  value={lookupDate}
                  onChange={(d) => d && setLookupDate(d)}
                />
                <Button type="primary" onClick={handleLookup}>
                  Tra cứu
                </Button>
              </div>
            </div>
          ),
        },
      ]}
    />
  )
}
