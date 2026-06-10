import { createRoute, lazyRouteComponent } from '@tanstack/react-router'
import { rootRoute } from './root-layout'

// Lazy-loaded: split out of the initial bundle.
export const generalInfoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/general-info',
  component: lazyRouteComponent(
    () => import('@/pages/general-info/GeneralInfoPage'),
    'GeneralInfoPage',
  ),
})
