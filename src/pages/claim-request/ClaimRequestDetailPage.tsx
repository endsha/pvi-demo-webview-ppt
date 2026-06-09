import { Form } from 'antd'
import { ClaimRequestHeader } from './components/ClaimRequestHeader'
import { InsuredPersonSection } from './components/InsuredPersonSection'
import { AccidentMedicalSection } from './components/AccidentMedicalSection'
import { PaymentInfoSection } from './components/PaymentInfoSection'
import { AttachmentsListSection } from './components/AttachmentsListSection'
import { BackToTopButton } from '@/components/ui/BackToTopButton'
import { MOCK_CLAIM_DETAIL } from './mock-claim-request-detail'
import type { ClaimRequestFormValues } from './claim-request-form-helpers'

export function ClaimRequestDetailPage() {
  const [form] = Form.useForm<ClaimRequestFormValues>()

  return (
    <main className="flex-1 bg-form-band">
      <ClaimRequestHeader
        title="Chi tiết yêu cầu bồi thường"
        onBack={() => window.history.back()}
      />
      <div className="mx-auto w-full max-w-3xl px-4 pb-12">
        <Form
          form={form}
          layout="vertical"
          disabled
          initialValues={MOCK_CLAIM_DETAIL}
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
