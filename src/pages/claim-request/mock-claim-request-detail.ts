import dayjs from 'dayjs'
import type { ClaimRequestFormValues } from './claim-request-form-helpers'

export interface AttachmentFile {
  id: string
  name: string
  url: string
}

// Mock prefilled detail of a submitted claim. In the real webview the host injects
// an existing claim record; here the values come from the design screenshots.
export const MOCK_CLAIM_DETAIL: ClaimRequestFormValues = {
  // Insured person
  driverCode: '6062006',
  fullName: 'Trần Việt Dũng',
  gender: 'Nam',
  idNumber: '',
  birthDate: '',
  email: '',
  zaloPhone: '',
  // Accident & medical
  accidentDate: dayjs('2026-06-01'),
  accidentPlace: '1 Le Duan',
  examDate: dayjs('2026-06-02'),
  admissionDate: dayjs('2026-06-03'),
  treatmentPlace: '',
  diagnosis: 'Testing',
  consequence: 'Testing',
  treatmentType: 'outpatient',
  treatmentFrom: undefined,
  treatmentTo: undefined,
  // Payment
  requestedAmount: 1000,
  paymentCases: ['medicalExpense', 'hospitalAllowance'],
  beneficiaryName: 'Tran Viet Dung',
  accountNumber: '0000000000',
  bankName: 'Testing',
  bankAddress: '',
  // Commitment fields are not rendered on the detail page; set true for type completeness.
  commitTruthful: true,
  commitThirdParty: true,
  commitSignature: true,
}

export const MOCK_ATTACHMENTS: AttachmentFile[] = [
  { id: '1', name: 'bien-ban-tai-nan.pdf', url: '#' },
  { id: '2', name: 'chung-tu-y-te.jpg', url: '#' },
  { id: '3', name: 'hoa-don-thanh-toan.pdf', url: '#' },
]
