import { useMemo } from 'react'
import { Form } from 'antd'
import { useSearch } from '@tanstack/react-router'
import { ClaimRequestHeader } from './components/ClaimRequestHeader'
import { InsuredPersonSection } from './components/InsuredPersonSection'
import { AccidentMedicalSection } from './components/AccidentMedicalSection'
import { PaymentInfoSection } from './components/PaymentInfoSection'
import { AttachmentsListSection } from './components/AttachmentsListSection'
import { BackToTopButton } from '@/components/ui/BackToTopButton'
import { MOCK_CLAIM_REQUESTS } from '@/pages/general-info/mock-claims'
import { buildClaimDetail } from './mock-claim-request-detail'

export function ClaimRequestDetailPage() {
  const { id } = useSearch({ from: '/claim-request-detail' })
  const claim = useMemo(() => MOCK_CLAIM_REQUESTS.find((c) => c.id === id), [id])
  const detail = useMemo(() => buildClaimDetail(claim), [claim])

  const title = claim ? `Chi tiết yêu cầu ${claim.requestNo}` : 'Chi tiết yêu cầu bồi thường'

  return (
    <main className="flex-1 bg-form-band">
      <ClaimRequestHeader title={title} onBack={() => window.history.back()} />
      <div className="mx-auto w-full max-w-3xl px-4 pb-12">
        <Form
          key={claim?.id ?? 'default'}
          layout="vertical"
          disabled
          initialValues={detail}
          requiredMark={(label, { required }) => (
            <>
              {label}
              {required && <span className="text-pvi-red"> *</span>}
            </>
          )}
        >
          <div className="flex flex-col gap-5">
            <InsuredPersonSection />
            <AccidentMedicalSection />
            <PaymentInfoSection />
            <AttachmentsListSection />
          </div>
        </Form>
      </div>
      <BackToTopButton />
    </main>
  )
}
