import type { Dayjs } from 'dayjs'

export type TreatmentType = 'outpatient' | 'inpatient'

export type PaymentCase =
  | 'death'
  | 'permanentDisability'
  | 'medicalExpense'
  | 'hospitalAllowance'

export interface ClaimRequestFormValues {
  // Insured person
  driverCode: string
  fullName: string
  gender: string
  idNumber?: string
  birthDate?: string // free-text input in the design (not a date picker)
  email: string
  zaloPhone: string
  // Accident & medical — date fields are AntD DatePicker values (Dayjs)
  accidentDate?: Dayjs
  accidentPlace: string
  examDate?: Dayjs
  admissionDate?: Dayjs
  treatmentPlace?: string
  diagnosis: string
  consequence: string
  treatmentType: TreatmentType
  treatmentFrom?: Dayjs
  treatmentTo?: Dayjs
  // Payment
  requestedAmount?: number
  paymentCases: PaymentCase[]
  beneficiaryName: string
  accountNumber: string
  bankName: string
  bankAddress?: string
  // Commitment
  commitTruthful: boolean
  commitThirdParty: boolean
  commitSignature: boolean
}

export const DEFAULT_TREATMENT_TYPE: TreatmentType = 'outpatient'

export const TREATMENT_TYPE_OPTIONS: { value: TreatmentType; label: string }[] = [
  { value: 'outpatient', label: 'Ngoại trú' },
  { value: 'inpatient', label: 'Nội trú' },
]

export const PAYMENT_CASE_OPTIONS: { value: PaymentCase; label: string }[] = [
  { value: 'death', label: 'Tử vong do tai nạn' },
  { value: 'permanentDisability', label: 'Thương tật toàn bộ vĩnh viễn do tai nạn' },
  { value: 'medicalExpense', label: 'Chi phí y tế do tai nạn' },
  { value: 'hospitalAllowance', label: 'Trợ cấp nằm viện do tai nạn' },
]

export const COMMITMENT_STATEMENTS = [
  {
    name: 'commitTruthful',
    text: 'Tôi cam đoan những thông tin kê khai trên đây là chính xác và đầy đủ. Tôi xin hoàn toàn chịu trách nhiệm trước pháp luật nếu có bất cứ sự sai lệch nào về thông tin đã cung cấp và bất cứ tranh chấp nào về quyền thụ hưởng số tiền được chi trả bảo hiểm.',
  },
  {
    name: 'commitThirdParty',
    text: 'Bằng Giấy yêu cầu chi trả tiền bảo hiểm này, tôi cho phép đại diện của Bảo hiểm PVI được quyền tiếp xúc với các bên thứ ba để thu thập thông tin cần thiết cho việc xét bồi thường này, bao gồm nhưng không giới hạn ở mức tiếp xúc với (các) bác sĩ đã và đang điều trị của tôi.',
  },
  {
    name: 'commitSignature',
    text: 'Việc nhấn "Gửi yêu cầu bồi thường" trên Cổng bồi thường trực tuyến sẽ thay cho chữ ký sống của tôi trên Giấy yêu cầu chi trả tiền bảo hiểm này.',
  },
] as const

export type CommitmentField = (typeof COMMITMENT_STATEMENTS)[number]['name']

export const COMMITMENT_FIELDS: CommitmentField[] = COMMITMENT_STATEMENTS.map((s) => s.name)

export function areAllCommitmentsAccepted(
  values: Partial<Record<CommitmentField, boolean>> | undefined,
): boolean {
  if (!values) return false
  return COMMITMENT_FIELDS.every((field) => values[field] === true)
}

export function formatVndInput(value: string | number | null | undefined): string {
  if (value === undefined || value === null || value === '') return ''
  return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function parseVndInput(displayValue: string | undefined): string {
  return (displayValue ?? '').replace(/[^\d]/g, '')
}
