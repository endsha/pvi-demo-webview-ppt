import { createRoute, lazyRouteComponent } from '@tanstack/react-router'
import { rootRoute } from './root-layout'

// Lazy-loaded: heavy antd form, split out of the initial bundle.
export const claimRequestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/claim-request',
  component: lazyRouteComponent(
    () => import('@/pages/claim-request/ClaimRequestPage'),
    'ClaimRequestPage',
  ),
})
