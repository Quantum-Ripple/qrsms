
export const ADMISSION_TOKEN = '{admission}'
export const SAMPLE_ADMISSION = 'ADM-0000'
export const IN_APP_PAYMENT_MODE = Object.freeze({
  id: 'in-app',
  name: 'Pay With Mpesa Now',
  kind: 'app',
  steps: [],
})

// "3456798#{admission}" + "ADM230"  ->  "3456798#ADM230"
export function formatAccount(mode, admission = SAMPLE_ADMISSION) {
  return (mode.account_format || ADMISSION_TOKEN).replace(ADMISSION_TOKEN, admission)
}

// The bursar's own steps win. If there are none, build the standard steps from the details.
export function paymentSteps(mode, admission = SAMPLE_ADMISSION) {
  const custom = (mode.steps || []).filter((s) => s && s.trim())
  if (custom.length) return custom

  if (mode.kind === 'app') {
    return [
      'Go to Make Payments.',
      'Enter the amount.',
      'Enter your M-Pesa phone number.',
      'Press Pay now.',
      'A prompt comes to your phone. Enter your M-Pesa PIN.',
      'Confirm the amount shows in your fee statement.',
    ]
  }

  if (mode.kind === 'paybill') {
    return [
      'Open M-Pesa and choose Lipa na M-Pesa, then Pay Bill.',
      `Enter the business number ${mode.business_number || '[business number]'}.`,
      `Enter the account number ${formatAccount(mode, admission)}.`,
      'Enter the amount, then your M-Pesa PIN.',
      'Wait for the M-Pesa SMS, then check your fee statement.',
    ]
  }

  if (mode.kind === 'till') {
    return [
      'Open M-Pesa and choose Lipa na M-Pesa, then Buy Goods and Services.',
      `Enter the till number ${mode.business_number || '[till number]'}.`,
      'Enter the amount, then your M-Pesa PIN.',
      'Keep the M-Pesa SMS as your proof of payment.',
    ]
  }

  if (mode.kind === 'bank') {
    const bank = mode.bank_name || 'the bank'
    return [
      `Go to a ${bank} branch${mode.branch ? ` (${mode.branch} or any branch)` : ''} and ask for a deposit slip.`,
      `Account name: ${mode.account_name || '[account name]'}. Account number: ${mode.account_number || '[account number]'}.`,
      `Write ${admission} as the reference.`,
      'Deposit the money and keep your slip.',
      'Your fee statement updates once the school confirms the deposit.',
    ]
  }

  return []
}