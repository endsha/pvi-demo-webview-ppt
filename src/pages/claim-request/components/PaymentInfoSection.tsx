import { Checkbox, Col, Form, Input, InputNumber, Row } from 'antd'
import { SectionCard } from './SectionCard'
import { PAYMENT_CASE_OPTIONS, formatVndInput, parseVndInput } from '../claim-request-form-helpers'

export function PaymentInfoSection() {
  return (
    <SectionCard title="Thông tin thanh toán">
      <h3 className="mb-4 font-semibold text-pvi-navy">1. Nội dung yêu cầu chi trả bảo hiểm</h3>

      <Form.Item
        label="Tổng số tiền yêu cầu chi trả"
        name="requestedAmount"
        rules={[{ required: true, message: 'Vui lòng nhập số tiền yêu cầu chi trả' }]}
      >
        <InputNumber
          className="w-full"
          controls={false}
          formatter={formatVndInput}
          parser={parseVndInput}
          suffix={<span className="text-gray-400">VND</span>}
          placeholder="Nhập số tiền yêu cầu chi trả"
        />
      </Form.Item>

      <Form.Item
        label="Chi trả cho những trường hợp"
        name="paymentCases"
        rules={[{ required: true, message: 'Vui lòng chọn ít nhất một trường hợp' }]}
      >
        <Checkbox.Group className="w-full">
          <div className="flex w-full flex-col gap-3 rounded-xl border border-gray-200 p-4">
            {PAYMENT_CASE_OPTIONS.map((option) => (
              <Checkbox key={option.value} value={option.value}>
                {option.label}
              </Checkbox>
            ))}
          </div>
        </Checkbox.Group>
      </Form.Item>

      <h3 className="mb-4 mt-6 font-semibold text-pvi-navy">2. Thông tin người thụ hưởng</h3>
      <Row gutter={[24, 0]}>
        <Col xs={24} md={12}>
          <Form.Item
            label="Người thụ hưởng"
            name="beneficiaryName"
            rules={[{ required: true, message: 'Vui lòng nhập tên người thụ hưởng' }]}
          >
            <Input placeholder="Nhập tên người thụ hưởng" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="Số tài khoản"
            name="accountNumber"
            rules={[{ required: true, message: 'Vui lòng nhập số tài khoản' }]}
          >
            <Input placeholder="Nhập số tài khoản" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="Ngân hàng"
            name="bankName"
            rules={[{ required: true, message: 'Vui lòng nhập Ngân hàng' }]}
          >
            <Input placeholder="Nhập Ngân hàng" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Địa chỉ Ngân hàng" name="bankAddress">
            <Input placeholder="Nhập địa chỉ Ngân hàng" />
          </Form.Item>
        </Col>
      </Row>
    </SectionCard>
  )
}
