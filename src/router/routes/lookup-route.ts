import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './root-layout'
import { LookupPage } from '@/pages/lookup/LookupPage'

// Single initial route — imported directly (code-splitting the only route adds nothing).
export const lookupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LookupPage,
})
