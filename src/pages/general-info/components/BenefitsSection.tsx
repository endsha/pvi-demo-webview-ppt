import { useMemo, useState } from 'react'
import { Collapse } from 'antd'
import { VehicleFilter } from './VehicleFilter'
import { BenefitAccordion } from './BenefitAccordion'
import { MOCK_BENEFITS, MOCK_BENEFIT_NOTES } from '../mock-data'
import { filterBenefitsByVehicle, type VehicleFilterValue } from '../general-info-helpers'

export function BenefitsSection() {
  const [vehicle, setVehicle] = useState<VehicleFilterValue>('all')
  const benefits = useMemo(() => filterBenefitsByVehicle(MOCK_BENEFITS, vehicle), [vehicle])

  return (
    <Collapse
      defaultActiveKey={['benefits']}
      expandIconPosition="end"
      items={[
        {
          key: 'benefits',
          label: <span className="text-base font-bold">II. Quyền lợi bảo hiểm</span>,
          extra: (
            <div onClick={(e) => e.stopPropagation()}>
              <VehicleFilter value={vehicle} onChange={setVehicle} />
            </div>
          ),
          children: (
            <div className="flex flex-col gap-4">
              <BenefitAccordion benefits={benefits} />
              <div className="rounded-lg border border-dashed border-gray-300 p-4">
                <div className="mb-2 text-sm font-semibold text-gray-700">Lưu ý</div>
                <ul className="list-disc space-y-1 pl-5">
                  {MOCK_BENEFIT_NOTES.map((note) => (
                    <li key={note} className="text-xs text-gray-500">
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ),
        },
      ]}
    />
  )
}
