import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './root-layout'
import { ClaimRequestDetailPage } from '@/pages/claim-request/ClaimRequestDetailPage'

export const claimRequestDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/claim-request-detail',
  component: ClaimRequestDetailPage,
})
