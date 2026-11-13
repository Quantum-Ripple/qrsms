export const FEE_ITEMS = [
  { code: 'fees', label: 'School fees' },
  { code: 'transport', label: 'Transport' },
  { code: 'uniform', label: 'Uniform' },
  { code: 'other', label: 'Other charges' },
]

export const KIND_LABELS = {
  app: 'In-app',
  paybill: 'Paybill',
  bank: 'Bank',
  other: 'Cash or other',
}

export function appliesToLabel(mode) {
  if (!mode.applies_to?.length) return 'All fee items'
  return mode.applies_to
    .map((code) => FEE_ITEMS.find((item) => item.code === code)?.label || code)
    .join(', ')
}
