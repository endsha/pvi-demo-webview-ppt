import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from '@tanstack/react-router'

export function ClaimRequestHeader() {
  const navigate = useNavigate()

  return (
    <div className="relative px-10 py-6 text-center">
      <button
        type="button"
        aria-label="Quay lại"
        onClick={() => navigate({ to: '/general-info' })}
        className="absolute left-2 top-7 text-pvi-navy transition-colors hover:text-pvi-red md:left-4"
      >
        <ArrowLeftOutlined />
      </button>
      <h1 className="text-2xl font-bold text-pvi-navy md:text-3xl">Nhập yêu cầu bồi thường</h1>
    </div>
  )
}
