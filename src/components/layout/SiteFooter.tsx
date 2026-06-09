import { HomeFilled, PhoneFilled, UpOutlined } from '@ant-design/icons'
import { PviLogo } from '@/components/brand/PviLogo'

const PHONE_NUMBERS = ['028 999 983 86', '028 999 66 995'] as const

export function SiteFooter() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer className="w-full bg-pvi-navy text-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1 text-sm font-semibold text-white"
          >
            Top <UpOutlined />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <PviLogo variant="white" className="mb-4" />
            <h2 className="mb-3 text-base font-bold text-footer-blue">
              TỔNG CÔNG TY BẢO HIỂM PVI - CHI NHÁNH BẢO HIỂM PVI DIGITAL
            </h2>
            <p className="flex items-start gap-2 text-sm leading-relaxed">
              <HomeFilled className="mt-1 shrink-0 text-footer-blue" />
              <span>
                Phòng G08 Tầng 1, Tòa nhà Petrovietnam, Số 1-5 Lê Duẩn, Phường Sài Gòn,
                Thành phố Hồ Chí Minh
              </span>
            </p>
          </div>

          <div className="md:text-right">
            <h2 className="mb-3 text-base font-bold text-footer-blue">Nhận báo giá ngay</h2>
            <ul className="space-y-2">
              {PHONE_NUMBERS.map((phone) => (
                <li key={phone} className="flex items-center gap-2 md:justify-end">
                  <PhoneFilled className="text-footer-blue" />
                  <a href={`tel:${phone.replace(/\s/g, '')}`} className="font-bold underline">
                    {phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
