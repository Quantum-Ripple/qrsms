
import Dashboard from './views/Dashboard.vue'
import Settings from './views/Settings.vue'
import AnnouncementsPage from './views/Announcements.vue'
import Payments from './views/Payments.vue'
import FeeStructures from './views/FeeStructures.vue'
import Expenditures from './views/Expenditures.vue'
import Invoices from './views/Invoices.vue'
import TransportConfiguration from './views/TransportConfiguration.vue'
import FeeDetails from './components/FeeStructure/FeeDetails.vue'
import FeeCreate from './components/FeeStructure/FeeCreate.vue'
import FeePrint from './components/FeeStructure/FeePrint.vue'
import InvoiceCreate from './components/Invoices/InvoiceCreate.vue'
import InvoiceDetail from './components/Invoices/InvoiceDetail.vue'
import PaymentDetails from './components/payments/PaymentDetails.vue'
import ExpenseDetails from './components/Expenses/ExpenseDetails.vue'
import EventDetail from './components/events/EventDetail.vue'
import TransportBilling from './views/TransportBilling.vue'
import SchoolFees from './views/SchoolFees.vue'
import UniformPage from './components/uniform/UniformPage.vue'
import OtherCharges from './components/charges/OtherCharges.vue'

import ChargeAssignment from './components/charges/ChargeAssignment.vue'

export default [
  // Base dashboard
  { path: '', name: 'FinanceDashboard', component: Dashboard },

  // Announcements
  { path: 'announcements', name: 'FinanceAnnouncements', component: AnnouncementsPage },

  // School fees
  {
    path: 'school-fees',
    component: SchoolFees,
    children: [
      { path: '', name: 'FinanceSchoolFees', redirect: { name: 'FinanceFeeStructure' } },
      { path: 'fee-structure', name: 'FinanceFeeStructure', component: FeeStructures },
      { path: 'transport-configurations', name: 'TransportConfigurations', component: TransportConfiguration },
      { path: 'uniforms', name: 'FinanceUniforms', component: UniformPage },
      { path: 'other-charges', name: 'FinanceOtherCharges', component: OtherCharges },
    ],
  },
  { path: 'fee-structure', redirect: { name: 'FinanceFeeStructure' } },
  { path: 'transport-configurations', redirect: { name: 'TransportConfigurations' } },
  { path: 'fee-details/:id', name: 'FeeDetails', component: FeeDetails, props: true },
  { path: 'fee-create', name: 'FeeCreate', component: FeeCreate },
  { path: 'fee-print/:id', name: 'FeePrint', component: FeePrint, props: true },

  // Invoices
  { path: 'invoices', name: 'FinanceInvoices', component: Invoices },
  { path: 'invoice-create', name: 'InvoiceCreate', component: InvoiceCreate },
  { path: 'invoice-detail/:id', name: 'InvoiceDetail', component: InvoiceDetail, props: true },

  // Payments
  { path: 'payments', name: 'FinancePayments', component: Payments },
  { path: 'payment-details/:id', name: 'PaymentDetails', component: PaymentDetails, props: true },

  // Expenditures
  { path: 'expenditures', name: 'FinanceExpenditures', component: Expenditures },
  { path: 'expense-details/:id', name: 'ExpenseDetails', component: ExpenseDetails, props: true },

  // Transport
  { path: 'transport-billing', name: 'TransportBilling', component: TransportBilling },

  // Events
  { path: 'event-details/:id', name: 'FinanceEventDetail', component: EventDetail, props: true },

  // Settings
  { path: 'settings', name: 'FinanceSettings', component: Settings },

  { path: 'student-charge-assign', name: 'ChargeAssignment',component: ChargeAssignment},

  {
  path: 'billing',
  name: 'FinanceBilling',
  component: () => import('./views/BillingRun.vue'),
  redirect: (to) => ({ name: 'FinanceBillingReview', query: to.query }),
  children: [
    { path: 'review', name: 'FinanceBillingReview', component: () => import('./components/charges/ChargeAssignment.vue') },
    { path: 'generate', name: 'FinanceBillingGenerate', component: () => import('./components/charges/ChargeGenerate.vue') },
    
  ],
},
{
  path: 'payments-register', name: 'FinancePaymentRegister',component: () => import('./components/payments/PaymentRegister.vue')
},
]
