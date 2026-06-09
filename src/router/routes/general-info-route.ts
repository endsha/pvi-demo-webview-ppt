import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './root-layout'
import { GeneralInfoPage } from '@/pages/general-info/GeneralInfoPage'

export const generalInfoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/general-info',
  component: GeneralInfoPage,
})
