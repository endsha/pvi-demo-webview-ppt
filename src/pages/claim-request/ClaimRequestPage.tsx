import { Form, message } from 'antd'
import { ClaimRequestHeader } from './components/ClaimRequestHeader'
import { InsuredPersonSection } from './components/InsuredPersonSection'
import { AccidentMedicalSection } from './components/AccidentMedicalSection'
import { PaymentInfoSection } from './components/PaymentInfoSection'
import { AttachmentsSection } from './components/AttachmentsSection'
import { CommitmentSection } from './components/CommitmentSection'
import { INSURED_PERSON_DEFAULTS } from './mock-claim-request'
import { DEFAULT_TREATMENT_TYPE, type ClaimRequestFormValues } from './claim-request-form-helpers'

export function ClaimRequestPage() {
  const [form] = Form.useForm<ClaimRequestFormValues>()
  const [messageApi, contextHolder] = message.useMessage()

  const handleFinish = (values: ClaimRequestFormValues) => {
    // UI-only: no API.
    console.info('Yêu cầu bồi thường:', values)
    messageApi.success('Đã nộp hồ sơ yêu cầu bồi thường (demo).')
  }

  return (
    <main className="flex-1 bg-form-band">
      {contextHolder}
      <ClaimRequestHeader />
      <div className="mx-auto w-full max-w-3xl px-4 pb-12">
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            ...INSURED_PERSON_DEFAULTS,
            treatmentType: DEFAULT_TREATMENT_TYPE,
            paymentCases: [],
            commitTruthful: false,
            commitThirdParty: false,
            commitSignature: false,
          }}
          requiredMark={(label, { required }) => (
            <>
              {label}
              {required && <span className="text-pvi-red"> *</span>}
            </>
          )}
          onFinish={handleFinish}
        >
          <div className="flex flex-col gap-5">
            <InsuredPersonSection />
            <AccidentMedicalSection />
            <PaymentInfoSection />
            <AttachmentsSection />
            <CommitmentSection />
          </div>
        </Form>
      </div>
    </main>
  )
}
