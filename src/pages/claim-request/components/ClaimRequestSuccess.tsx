import { CheckOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { useNavigate } from '@tanstack/react-router'

export function ClaimRequestSuccess() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center px-4 py-24 text-center">
      <div className="flex size-44 items-center justify-center rounded-full bg-green-100">
        <div className="flex size-32 items-center justify-center rounded-full bg-green-500">
          <CheckOutlined className="text-5xl text-white" />
        </div>
      </div>

      <h1 className="mt-8 text-2xl font-bold text-pvi-navy md:text-3xl">
        Tạo yêu cầu bồi thường thành công
      </h1>

      <Button
        size="large"
        onClick={() => navigate({ to: '/general-info' })}
        className="mt-8 min-w-56 border-pvi-navy/20 font-semibold text-pvi-navy"
      >
        Quay về
      </Button>
    </div>
  )
}
