import { createRouter } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { rootRoute } from './routes/root-layout'
import { lookupRoute } from './routes/lookup-route'
import { generalInfoRoute } from './routes/general-info-route'

export const queryClient = new QueryClient()

const routeTree = rootRoute.addChildren([lookupRoute, generalInfoRoute])

export const router = createRouter({
  routeTree,
  context: { queryClient },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
