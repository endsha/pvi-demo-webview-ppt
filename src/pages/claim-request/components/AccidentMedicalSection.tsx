import { Col, DatePicker, Form, Input, Radio, Row } from 'antd'
import { SectionCard } from './SectionCard'
import { TREATMENT_TYPE_OPTIONS, type ClaimRequestFormValues } from '../claim-request-form-helpers'

const DATE_FORMAT = 'DD/MM/YYYY'

export function AccidentMedicalSection() {
  const form = Form.useFormInstance<ClaimRequestFormValues>()
  const treatmentType = Form.useWatch('treatmentType', form)
  const isInpatient = treatmentType === 'inpatient'

  return (
    <SectionCard title="Thông tin về tai nạn và khám chữa bệnh">
      <Row gutter={[24, 0]}>
        <Col xs={24} md={12}>
          <Form.Item
            label="Ngày tai nạn"
            name="accidentDate"
            rules={[{ required: true, message: 'Vui lòng chọn ngày tai nạn' }]}
          >
            <DatePicker className="w-full" format={DATE_FORMAT} placeholder="Chọn Ngày tai nạn" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="Nơi xảy ra tai nạn"
            name="accidentPlace"
            rules={[{ required: true, message: 'Vui lòng nhập nơi xảy ra tai nạn' }]}
          >
            <Input placeholder="Nhập nơi xảy ra tai nạn" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="Ngày khám bệnh"
            name="examDate"
            rules={[{ required: true, message: 'Vui lòng chọn ngày khám bệnh' }]}
          >
            <DatePicker className="w-full" format={DATE_FORMAT} placeholder="Chọn ngày khám bệnh" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Ngày nhập viện" name="admissionDate">
            <DatePicker className="w-full" format={DATE_FORMAT} placeholder="Chọn ngày nhập viện" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Nơi điều trị" name="treatmentPlace">
            <Input placeholder="Nhập nơi điều trị" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="Nguyên nhân / Chẩn đoán về tai nạn"
            name="diagnosis"
            rules={[{ required: true, message: 'Vui lòng nhập nguyên nhân/chẩn đoán về tai nạn' }]}
          >
            <Input placeholder="Nhập nguyên nhân/chẩn đoán về tai nạn" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="Hậu quả"
            name="consequence"
            rules={[{ required: true, message: 'Vui lòng nhập hậu quả' }]}
          >
            <Input placeholder="Nhập hậu quả" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="Hình thức điều trị"
            name="treatmentType"
            rules={[{ required: true, message: 'Vui lòng chọn hình thức điều trị' }]}
          >
            <Radio.Group options={TREATMENT_TYPE_OPTIONS} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Từ ngày" name="treatmentFrom">
            <DatePicker
              className="w-full"
              format={DATE_FORMAT}
              placeholder="Chọn ngày"
              disabled={!isInpatient}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Đến ngày" name="treatmentTo">
            <DatePicker
              className="w-full"
              format={DATE_FORMAT}
              placeholder="Chọn ngày"
              disabled={!isInpatient}
            />
          </Form.Item>
        </Col>
      </Row>
    </SectionCard>
  )
}
