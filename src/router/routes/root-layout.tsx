import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'

interface RouterContext {
  queryClient: QueryClient
}

// eslint-disable-next-line react-refresh/only-export-components
function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <Outlet />
      <SiteFooter />
    </div>
  )
}

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})
