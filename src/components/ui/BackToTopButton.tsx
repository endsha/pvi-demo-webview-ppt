import { useEffect, useState } from 'react'
import { VerticalAlignTopOutlined } from '@ant-design/icons'

const SCROLL_THRESHOLD = 200

export function BackToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SCROLL_THRESHOLD)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <button
      type="button"
      aria-label="Lên đầu trang"
      onClick={scrollToTop}
      className={`fixed bottom-8 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-lg bg-pvi-navy text-white shadow-lg transition-opacity duration-300 hover:bg-pvi-red md:right-8 ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <VerticalAlignTopOutlined />
    </button>
  )
}
