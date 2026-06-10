import { createRoute, lazyRouteComponent } from '@tanstack/react-router'
import { rootRoute } from './root-layout'

interface ClaimRequestDetailSearch {
  id?: string
}

// Lazy-loaded: detail page split out of the initial bundle.
export const claimRequestDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/claim-request-detail',
  validateSearch: (search: Record<string, unknown>): ClaimRequestDetailSearch => ({
    id: typeof search.id === 'string' ? search.id : undefined,
  }),
  component: lazyRouteComponent(
    () => import('@/pages/claim-request/ClaimRequestDetailPage'),
    'ClaimRequestDetailPage',
  ),
})
