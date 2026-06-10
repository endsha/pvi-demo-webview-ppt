import { Col, Form, Input, Row } from 'antd'
import { SectionCard } from './SectionCard'

const READONLY_INPUT = 'bg-gray-100 text-gray-500'

export function InsuredPersonSection() {
  return (
    <SectionCard title="Thông tin về người được bảo hiểm">
      <Row gutter={[24, 0]}>
        <Col xs={24} md={12}>
          <Form.Item label="Mã Tài xế Grab" name="driverCode">
            <Input readOnly className={READONLY_INPUT} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Họ và tên" name="fullName">
            <Input readOnly className={READONLY_INPUT} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Giới tính" name="gender">
            <Input readOnly className={READONLY_INPUT} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Số CMND/ CCCD/ Hộ chiếu" name="idNumber">
            <Input placeholder="Nhập số CMND/CCCD/Hộ chiếu" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Ngày sinh" name="birthDate">
            <Input placeholder="Nhập ngày sinh" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Vui lòng nhập email' }]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="Số điện thoại sử dụng Zalo"
            name="zaloPhone"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại sử dụng zalo' }]}
          >
            <Input placeholder="Nhập số điện thoại sử dụng zalo" />
          </Form.Item>
        </Col>
      </Row>
    </SectionCard>
  )
}
