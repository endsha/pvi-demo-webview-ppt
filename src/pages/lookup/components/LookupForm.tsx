import { Button, Form, Input, Select } from 'antd'
import {
  DEFAULT_INSURANCE_TYPE,
  INSURANCE_TYPE_OPTIONS,
  MOCK_PHONE,
  type LookupFormValues,
} from '../lookup-form-helpers'

export function LookupForm() {
  const [form] = Form.useForm<LookupFormValues>()

  const handleFinish = (values: LookupFormValues) => {
    // UI-only: no API. Log the selected values (the approved "no-op" behavior).
    console.info('Tra cứu:', values)
  }

  return (
    <div className="w-full bg-form-band">
      <div className="mx-auto w-full max-w-xl px-6 py-10">
        <Form
          form={form}
          layout="vertical"
          initialValues={{ phone: MOCK_PHONE, insuranceType: DEFAULT_INSURANCE_TYPE }}
          onFinish={handleFinish}
        >
          <Form.Item label="Số điện thoại" name="phone">
            <Input readOnly classNames={{ input: 'text-gray-400' }} />
          </Form.Item>

          <Form.Item label="Loại bảo hiểm" name="insuranceType">
            <Select options={INSURANCE_TYPE_OPTIONS} />
          </Form.Item>

          <Form.Item className="mb-0">
            <Button type="primary" htmlType="submit" block>
              Tra cứu
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}
