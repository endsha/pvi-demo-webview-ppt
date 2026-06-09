import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './root-layout'
import { ClaimRequestPage } from '@/pages/claim-request/ClaimRequestPage'

export const claimRequestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/claim-request',
  component: ClaimRequestPage,
})
