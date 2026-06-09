import type { ClaimRequestFormValues } from './claim-request-form-helpers'

// Mock prefilled values; in the real webview the host injects these read-only fields.
export const INSURED_PERSON_DEFAULTS: Pick<
  ClaimRequestFormValues,
  'driverCode' | 'fullName' | 'gender'
> = {
  driverCode: '6062006',
  fullName: 'Trần Việt Dũng',
  gender: 'Nam',
}
