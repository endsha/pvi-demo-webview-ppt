import { createRoute, lazyRouteComponent } from '@tanstack/react-router'
import { rootRoute } from './root-layout'

// Lazy-loaded: detail page split out of the initial bundle.
export const claimRequestDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/claim-request-detail',
  component: lazyRouteComponent(
    () => import('@/pages/claim-request/ClaimRequestDetailPage'),
    'ClaimRequestDetailPage',
  ),
})
