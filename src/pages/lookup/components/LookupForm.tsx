import { Button, Form, Input, Select } from 'antd'
import { useNavigate } from '@tanstack/react-router'
import {
  DEFAULT_INSURANCE_TYPE,
  INSURANCE_TYPE_OPTIONS,
  REGISTERED_PHONE_DISPLAY,
  isRegisteredPhone,
  type LookupFormValues,
} from '../lookup-form-helpers'

export function LookupForm() {
  const [form] = Form.useForm<LookupFormValues>()
  const navigate = useNavigate()

  const handleFinish = (values: LookupFormValues) => {
    // UI-only: no API. Persisted lookup happens on the General Info page.
    console.info('Tra cứu:', values)
    navigate({ to: '/general-info' })
  }

  return (
    <div className="w-full bg-form-band">
      <div className="mx-auto w-full max-w-xl px-6 py-10">
        <Form
          form={form}
          layout="vertical"
          initialValues={{ phone: '', insuranceType: DEFAULT_INSURANCE_TYPE }}
          onFinish={handleFinish}
        >
          <Form.Item
            label="Số điện thoại"
            name="phone"
            validateTrigger="onSubmit"
            extra={`Số đăng ký mẫu: ${REGISTERED_PHONE_DISPLAY}`}
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              {
                validator: (_, value: string) =>
                  !value || isRegisteredPhone(value)
                    ? Promise.resolve()
                    : Promise.reject(new Error('Số điện thoại không tồn tại trong hệ thống')),
              },
            ]}
          >
            <Input inputMode="tel" placeholder="Nhập số điện thoại" allowClear />
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
