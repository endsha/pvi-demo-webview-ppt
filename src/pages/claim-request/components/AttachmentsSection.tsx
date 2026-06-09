import { Button, Upload } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { SectionCard } from './SectionCard'

export function AttachmentsSection() {
  return (
    <SectionCard title="Tài liệu đính kèm">
      <p className="mb-2 text-sm text-gray-700">Vui lòng tải lên tài liệu liên quan, gồm:</p>
      <ol className="mb-4 list-decimal space-y-1 pl-5 text-sm text-gray-600">
        <li>
          Biên bản tai nạn:{' '}
          <a
            className="font-medium text-pvi-red"
            href="#"
            onClick={(e) => e.preventDefault()}
          >
            Tải mẫu biên bản
          </a>
        </li>
        <li>
          Chứng từ y tế phát sinh: Sổ khám, toa thuốc, các phiếu chỉ định &amp; kết quả cận lâm sàng
          (siêu âm, Xquang, xét nghiệm…)
        </li>
        <li>Chứng từ thanh toán: Hóa đơn tài chính, Phiếu thu, các bảng kê chi tiết kèm theo</li>
        <li>
          Hai mặt CMND/CCCD, Giấy phép lái xe, Giấy đăng ký xe (trường hợp điều khiển phương tiện
          giao thông)
        </li>
        <li>Các chứng từ liên quan khác (nếu có)</li>
      </ol>

      <Upload beforeUpload={() => false} multiple>
        <Button type="primary" icon={<UploadOutlined />}>
          Tải lên
        </Button>
      </Upload>

      <div className="mt-4 text-sm text-pvi-red">
        <p className="font-medium">Lưu ý:</p>
        <p>- Chỉ hỗ trợ các định dạng PNG, JPG, WORD, EXCEL, PDF, EMAIL, TXT, RAR và tối đa 5MB</p>
        <p>- Hình chụp cần rõ nét, không bị mất gốc/thông tin</p>
      </div>

      <p className="mt-4 text-sm text-gray-700">
        Trong một số trường hợp, Bảo hiểm PVI có thể yêu cầu Quý khách hàng hỗ trợ gửi bản gốc
        và/hoặc bổ sung các chứng từ yêu cầu bồi thường cho chúng tôi để xử lý bồi thường
      </p>
    </SectionCard>
  )
}
