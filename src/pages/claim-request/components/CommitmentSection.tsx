import { Button, Checkbox, Form, Switch } from 'antd'
import { SectionCard } from './SectionCard'
import {
  COMMITMENT_FIELDS,
  COMMITMENT_STATEMENTS,
  areAllCommitmentsAccepted,
  type ClaimRequestFormValues,
} from '../claim-request-form-helpers'

export function CommitmentSection() {
  const form = Form.useFormInstance<ClaimRequestFormValues>()
  const values = Form.useWatch([], form)
  const allAccepted = areAllCommitmentsAccepted(values)

  const handleToggleAll = (checked: boolean) => {
    form.setFieldsValue(Object.fromEntries(COMMITMENT_FIELDS.map((field) => [field, checked])))
  }

  const title = (
    <span className="inline-flex items-center gap-3">
      Cam kết
      <span onClick={(e) => e.stopPropagation()}>
        <Switch checked={allAccepted} onChange={handleToggleAll} />
      </span>
    </span>
  )

  return (
    <SectionCard title={title}>
      <div className="flex flex-col gap-4">
        {COMMITMENT_STATEMENTS.map((statement) => (
          <Form.Item key={statement.name} name={statement.name} valuePropName="checked" noStyle>
            <Checkbox>
              <span className="text-sm text-gray-700">{statement.text}</span>
            </Checkbox>
          </Form.Item>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <Button
          htmlType="submit"
          disabled={!allAccepted}
          className="min-w-48 border-pvi-navy text-pvi-navy"
        >
          Nộp hồ sơ
        </Button>
      </div>
    </SectionCard>
  )
}
