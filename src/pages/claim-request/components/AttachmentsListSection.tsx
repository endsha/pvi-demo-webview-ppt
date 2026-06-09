import { FileTextOutlined } from '@ant-design/icons'
import { SectionCard } from './SectionCard'
import { MOCK_ATTACHMENTS } from '../mock-claim-request-detail'

export function AttachmentsListSection() {
  return (
    <SectionCard title="Tài liệu đính kèm">
      {MOCK_ATTACHMENTS.length === 0 ? (
        <p className="text-sm text-gray-500">Không có tài liệu đính kèm</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {MOCK_ATTACHMENTS.map((file) => (
            <li
              key={file.id}
              className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3"
            >
              <FileTextOutlined className="text-pvi-navy" />
              <span className="flex-1 truncate text-sm text-gray-700">{file.name}</span>
              <a
                className="text-sm font-medium text-pvi-red"
                href={file.url}
                onClick={(e) => e.preventDefault()}
              >
                Xem
              </a>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}
