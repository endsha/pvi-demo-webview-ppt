import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from '@tanstack/react-router'

interface ClaimRequestHeaderProps {
  title?: string
  onBack?: () => void
}

export function ClaimRequestHeader({
  title = 'Nhập yêu cầu bồi thường',
  onBack,
}: ClaimRequestHeaderProps) {
  const navigate = useNavigate()
  const handleBack = onBack ?? (() => navigate({ to: '/general-info' }))

  return (
    <div className="relative px-10 py-6 text-center">
      <button
        type="button"
        aria-label="Quay lại"
        onClick={handleBack}
        className="absolute left-2 top-7 text-pvi-navy transition-colors hover:text-pvi-red md:left-4"
      >
        <ArrowLeftOutlined />
      </button>
      <h1 className="text-2xl font-bold text-pvi-navy md:text-3xl">{title}</h1>
    </div>
  )
}
