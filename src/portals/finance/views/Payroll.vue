<template>
  <div class="min-h-screen bg-gray-50 p-4 md:p-6">
    <main class="qr-payroll mx-auto max-w-7xl">
      <header class="pr-top">
        <h1>Payroll</h1>
        <div class="pr-actions">
          <button class="pr-btn" type="button" :disabled="loading" @click="refresh">Refresh</button>
          <button class="pr-btn pr-btn-primary" type="button" @click="beginRun">{{ existingPeriodRun ? 'Open payroll' : 'Prepare payroll' }}</button>
        </div>
      </header>

      <div v-if="error" class="pr-error" role="alert">{{ error }}</div>
      <div v-if="notice" class="pr-success" role="status">{{ notice }}</div>

      <div class="pr-stat-grid">
        <div class="pr-stat"><div class="pr-stat-label">Active employees</div><div class="pr-stat-value">{{ activeProfiles.length }}</div></div>
        <div class="pr-stat"><div class="pr-stat-label">{{ currentRun ? 'Latest net payroll' : 'Current payroll' }}</div><div class="pr-stat-value">{{ currentRun ? `KES ${money(currentRun.net_total)}` : 'Not started' }}</div><div class="pr-stat-note">{{ currentRun ? payrollMonthName(currentRun.year, currentRun.month) : payrollMonthName(period.year, period.month) }}</div></div>
        <div class="pr-stat"><div class="pr-stat-label">Advances to review</div><div class="pr-stat-value">{{ advances.filter(a => a.status === 'SUBMITTED').length }}</div></div>
        <div class="pr-stat"><div class="pr-stat-label">Payrolls awaiting approval</div><div class="pr-stat-value">{{ runs.filter(r => r.status === 'SUBMITTED').length }}</div></div>
      </div>

      <div class="pr-tabs" role="tablist" aria-label="Payroll sections">
        <button v-for="item in tabs" :key="item.key" type="button" role="tab" class="pr-tab" :class="{active: tab===item.key}" :aria-selected="tab===item.key" @click="tab=item.key">{{ item.label }}</button>
      </div>

      <section v-if="tab==='overview'" class="pr-overview">
        <div class="pr-panel">
          <div class="pr-panel-head"><h2>Monthly payroll</h2></div>
          <div class="pr-panel-body">
            <div class="pr-fields">
              <label class="pr-label">Year<input class="pr-input" type="number" min="2000" max="2100" v-model.number="period.year" /></label>
              <label class="pr-label">Month<select class="pr-select" v-model.number="period.month"><option v-for="(name,i) in months" :key="i" :value="i+1">{{ name }}</option></select></label>
            </div>
            <button class="pr-btn pr-btn-primary pr-prepare" type="button" :disabled="busy || !validPeriod" @click="beginRun">{{ existingPeriodRun ? 'Open payroll' : 'Prepare payroll' }}</button>
          </div>
        </div>
        <div class="pr-panel">
          <div class="pr-panel-head"><h2>Quick actions</h2></div>
          <div class="pr-panel-body">
            <button class="pr-btn" @click="tab='staff'; openEnroll()">Enroll staff</button>
            <button class="pr-btn" @click="tab='advances'; openAssisted()">Non-teaching staff advance</button>
            <button class="pr-btn" @click="tab='history'">View all payrolls</button>
          </div>
        </div>

        <section class="pr-section pr-overview-full" aria-labelledby="recent-payrolls-heading">
          <div class="pr-section-head"><h2 id="recent-payrolls-heading">Recent payrolls</h2><span class="pr-small pr-muted">{{ runs.length }} total</span></div>
          <div v-if="!runs.length" class="pr-panel pr-empty">No payroll runs yet.</div>
          <template v-else>
            <div class="pr-panel pr-table-scroll pr-desktop-table">
              <table class="pr-table" aria-label="Recent payroll runs">
                <thead><tr><th>Month</th><th>Employees</th><th>Net salary</th><th>Status</th><th class="right">Action</th></tr></thead>
                <tbody>
                  <tr v-for="run in sortedRuns.slice(0,8)" :key="run.id">
                    <td class="pr-name">{{ payrollMonthName(run.year,run.month) }}</td><td>{{ run.employee_count }}</td><td>KES {{ money(run.net_total) }}</td>
                    <td><span class="pr-badge" :class="tone(run.status)">{{ labelStatus(run.status) }}</span></td>
                    <td class="right"><button class="pr-btn pr-btn-small" @click="openRun(run.id)">Open</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="pr-mobile-list">
              <article v-for="run in sortedRuns.slice(0,8)" :key="run.id" class="pr-mobile-card">
                <div class="pr-card-head"><h3>{{ payrollMonthName(run.year,run.month) }}</h3><span class="pr-badge" :class="tone(run.status)">{{ labelStatus(run.status) }}</span></div>
                <dl class="pr-card-details"><div><dt>Employees</dt><dd>{{ run.employee_count }}</dd></div><div><dt>Net salary</dt><dd>KES {{ money(run.net_total) }}</dd></div></dl>
                <button class="pr-btn pr-card-action" @click="openRun(run.id)">Open payroll</button>
              </article>
            </div>
          </template>
        </section>

        <details class="pr-panel pr-guide pr-overview-full">
          <summary><span>How payroll works</span><ChevronDownIcon class="pr-guide-chevron" aria-hidden="true" /></summary>
          <ol class="pr-guide-steps">
            <li><strong>1. Prepare</strong><p>Review salaries and monthly changes.</p></li>
            <li><strong>2. Approve</strong><p>The principal approves the payroll.</p></li>
            <li><strong>3. Record payment</strong><p>Record payments made outside QRSMS.</p></li>
            <li><strong>4. Report</strong><p>View payslips and expenditure records after payment.</p></li>
          </ol>
        </details>
      </section>

      <section v-else-if="tab==='staff'" class="pr-section">
        <div class="pr-panel">
          <div class="pr-panel-head"><h2>Staff pay profiles</h2><button class="pr-btn pr-btn-primary" @click="openEnroll">Enroll staff</button></div>
          <div class="pr-panel-body pr-filterbar">
            <label class="pr-label">Search staff<input class="pr-input" placeholder="Name, position or phone" v-model.trim="staffQuery" /></label>
            <label class="pr-label">Status<select class="pr-select" v-model="staffFilter"><option value="all">All employees</option><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
          </div>
        </div>
        <div v-if="!filteredProfiles.length" class="pr-panel pr-empty">No matching employees.</div>
        <template v-else>
          <div class="pr-panel pr-table-scroll pr-desktop-table">
            <table class="pr-table" aria-label="Staff pay profiles">
              <thead><tr><th>Employee</th><th>Category</th><th>Basic salary</th><th>M-Pesa number</th><th>Status</th><th class="right">Manage</th></tr></thead>
              <tbody>
                <tr v-for="profile in filteredProfiles" :key="profile.id">
                  <td><div class="pr-name">{{ profile.employee_name }}</div><div class="pr-description">{{ profile.position }}</div></td>
                  <td>{{ profile.employee_kind==='TEACHER'?'Teaching':'Non-teaching' }}</td><td class="pr-amount">KES {{ money(profile.basic_salary) }}</td><td>{{ profile.mpesa_number || '—' }}</td>
                  <td><span class="pr-badge" :class="profile.is_active?'success':'warning'">{{ profile.is_active?'Active':'Inactive' }}</span></td>
                  <td class="right"><div class="pr-inline-actions"><button class="pr-btn pr-btn-small" @click="openProfile(profile)">Edit</button><button class="pr-btn pr-btn-small" @click="openAllowances(profile)">Allowances</button></div></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="pr-mobile-list">
            <article v-for="profile in filteredProfiles" :key="profile.id" class="pr-mobile-card">
              <div class="pr-card-head"><div><h3>{{ profile.employee_name }}</h3><p class="pr-description">{{ profile.position }}</p></div><span class="pr-badge" :class="profile.is_active?'success':'warning'">{{ profile.is_active?'Active':'Inactive' }}</span></div>
              <dl class="pr-card-details">
                <div><dt>Category</dt><dd>{{ profile.employee_kind==='TEACHER'?'Teaching':'Non-teaching' }}</dd></div>
                <div><dt>Basic salary</dt><dd>KES {{ money(profile.basic_salary) }}</dd></div>
                <div><dt>M-Pesa number</dt><dd>{{ profile.mpesa_number || '—' }}</dd></div>
              </dl>
              <div class="pr-card-actions"><button class="pr-btn" @click="openProfile(profile)">Edit</button><button class="pr-btn" @click="openAllowances(profile)">Allowances</button></div>
            </article>
          </div>
        </template>
      </section>

      <section v-else-if="tab==='advances'" class="pr-section">
        <div class="pr-panel">
          <div class="pr-panel-head"><h2>Salary advances</h2><button class="pr-btn pr-btn-primary" @click="openAssisted">Non-teaching staff advance</button></div>
          <div class="pr-panel-body pr-filterbar">
            <label class="pr-label">Search employee<input class="pr-input" placeholder="Employee name" v-model.trim="advanceQuery" /></label>
            <label class="pr-label">Status<select v-model="advanceFilter" class="pr-select"><option value="all">All statuses</option><option value="SUBMITTED">To review</option><option value="RECOMMENDED">Recommended</option><option value="APPROVED">Approved</option><option value="PAID">Disbursed</option></select></label>
          </div>
        </div>
        <div v-if="!filteredAdvances.length" class="pr-panel pr-empty">No advances found.</div>
        <template v-else>
          <div class="pr-panel pr-table-scroll pr-desktop-table">
            <table class="pr-table" aria-label="Salary advances">
              <thead><tr><th>Employee</th><th>Payroll month</th><th>Amount</th><th>Reason</th><th>Status</th><th class="right">Action</th></tr></thead>
              <tbody>
                <tr v-for="advance in filteredAdvances" :key="advance.id">
                  <td class="pr-name">{{ advance.employee_name }}</td><td>{{ payrollMonthName(advance.year, advance.month) }}</td><td class="pr-amount">KES {{ money(advance.amount) }}</td><td>{{ advance.reason }}</td>
                  <td><span class="pr-badge" :class="tone(advance.status)">{{ labelStatus(advance.status) }}</span></td>
                  <td class="right"><div class="pr-inline-actions"><button v-if="advance.status==='SUBMITTED'" class="pr-btn pr-btn-small" @click="handleAdvance('recommend',advance)">Recommend</button><button v-if="advance.status==='SUBMITTED'" class="pr-btn pr-btn-small pr-btn-danger" @click="openDecision('decline',advance)">Decline</button><button v-if="advance.status==='APPROVED'" class="pr-btn pr-btn-small" @click="openDisburse(advance)">Record payment</button></div></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="pr-mobile-list">
            <article v-for="advance in filteredAdvances" :key="advance.id" class="pr-mobile-card">
              <div class="pr-card-head"><h3>{{ advance.employee_name }}</h3><span class="pr-badge" :class="tone(advance.status)">{{ labelStatus(advance.status) }}</span></div>
              <dl class="pr-card-details">
                <div><dt>Payroll month</dt><dd>{{ payrollMonthName(advance.year, advance.month) }}</dd></div><div><dt>Amount</dt><dd>KES {{ money(advance.amount) }}</dd></div>
                <div class="pr-card-full"><dt>Reason</dt><dd>{{ advance.reason }}</dd></div>
              </dl>
              <div v-if="advance.status==='SUBMITTED' || advance.status==='APPROVED'" class="pr-card-actions">
                <button v-if="advance.status==='SUBMITTED'" class="pr-btn" @click="handleAdvance('recommend',advance)">Recommend</button>
                <button v-if="advance.status==='SUBMITTED'" class="pr-btn pr-btn-danger" @click="openDecision('decline',advance)">Decline</button>
                <button v-if="advance.status==='APPROVED'" class="pr-btn" @click="openDisburse(advance)">Record payment</button>
              </div>
            </article>
          </div>
        </template>
      </section>

      <section v-else class="pr-section" aria-labelledby="payroll-history-heading">
        <div class="pr-section-head"><h2 id="payroll-history-heading">Payroll history</h2></div>
        <div v-if="!sortedRuns.length" class="pr-panel pr-empty">No payroll history yet.</div>
        <template v-else>
          <div class="pr-panel pr-table-scroll pr-desktop-table">
            <table class="pr-table" aria-label="Payroll history">
              <thead><tr><th>Month</th><th>Employees</th><th>Gross salary</th><th>Net salary</th><th>Status</th><th class="right">Action</th></tr></thead>
              <tbody>
                <tr v-for="run in sortedRuns" :key="run.id">
                  <td class="pr-name">{{ payrollMonthName(run.year,run.month) }}</td><td>{{ run.employee_count }}</td><td>KES {{ money(run.gross_total) }}</td><td class="pr-amount">KES {{ money(run.net_total) }}</td>
                  <td><span class="pr-badge" :class="tone(run.status)">{{ labelStatus(run.status) }}</span></td>
                  <td class="right"><button class="pr-btn pr-btn-small" @click="openRun(run.id)">Open</button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="pr-mobile-list">
            <article v-for="run in sortedRuns" :key="run.id" class="pr-mobile-card">
              <div class="pr-card-head"><h3>{{ payrollMonthName(run.year,run.month) }}</h3><span class="pr-badge" :class="tone(run.status)">{{ labelStatus(run.status) }}</span></div>
              <dl class="pr-card-details">
                <div><dt>Employees</dt><dd>{{ run.employee_count }}</dd></div><div><dt>Gross salary</dt><dd>KES {{ money(run.gross_total) }}</dd></div><div><dt>Net salary</dt><dd>KES {{ money(run.net_total) }}</dd></div>
              </dl>
              <button class="pr-btn pr-card-action" @click="openRun(run.id)">Open payroll</button>
            </article>
          </div>
        </template>
      </section>

      <div v-if="modal" class="pr-modal-scrim" @click.self="closeModal">
        <section class="pr-modal" role="dialog" aria-modal="true" :aria-label="modalTitle">
          <header class="pr-modal-head"><div><h2>{{ modalTitle }}</h2><p v-if="modalSub">{{ modalSub }}</p></div><button class="pr-close" aria-label="Close dialog" @click="closeModal">×</button></header>
          <div v-if="modalError" class="pr-error" style="margin:12px 16px 0" role="alert">{{ modalError }}</div>

          <form v-if="modal==='enroll'" @submit.prevent="saveEnrollment">
            <div class="pr-modal-body pr-stack"><div class="pr-fields">
              <label class="pr-label">Staff category<select class="pr-select" v-model="employeeKind" @change="loadDirectory"><option value="teacher">Teaching</option><option value="non_teaching">Non-teaching</option></select></label>
              <label class="pr-label">Existing employee
                <select v-if="directoryRows.length" v-model.number="employeeId" class="pr-select" required><option value="" disabled>Select employee</option><option v-for="staff in directoryRows" :key="staff.id" :value="staff.id">{{ personName(staff) }} · #{{staff.id}}</option></select>
                <input v-else class="pr-input" v-model.number="employeeId" type="number" min="1" required placeholder="Existing employee ID" />
                <span v-if="directoryWarning" class="pr-help">{{ directoryWarning }}</span>
              </label>
              <label class="pr-label">Monthly basic salary (KES)<input class="pr-input" v-model="profileForm.basic_salary" type="number" min="0" step="0.01" required /></label>
              <label class="pr-label">M-Pesa number (optional)<input class="pr-input" v-model.trim="profileForm.mpesa_number" placeholder="2547XXXXXXXX" /></label>
              <label class="pr-label full">Notes (optional)<textarea class="pr-textarea" v-model="profileForm.notes" rows="2"/></label>
            </div><div class="pr-note">Select a staff member already registered in QRSMS.</div></div>
            <footer class="pr-modal-foot"><button type="button" class="pr-btn" @click="closeModal">Cancel</button><button class="pr-btn pr-btn-primary" :disabled="busy" type="submit">{{busy?'Saving…':'Enroll staff'}}</button></footer>
          </form>

          <form v-else-if="modal==='profile'" @submit.prevent="saveProfile">
            <div class="pr-modal-body pr-stack"><div class="pr-note">Changes apply to future payrolls only.</div>
              <label class="pr-label">Basic monthly salary (KES)<input v-model="profileForm.basic_salary" class="pr-input" type="number" step="0.01" min="0" required /></label>
              <label class="pr-label">M-Pesa number (optional)<input v-model.trim="profileForm.mpesa_number" class="pr-input" /></label>
              <label class="pr-label">Notes<textarea class="pr-textarea" v-model="profileForm.notes" rows="2" /></label>
              <label class="pr-check"><input v-model="profileForm.is_active" type="checkbox"/> Included in future payroll runs</label>
            </div><footer class="pr-modal-foot"><button type="button" class="pr-btn" @click="closeModal">Cancel</button><button type="submit" class="pr-btn pr-btn-primary" :disabled="busy">Save changes</button></footer>
          </form>

          <div v-else-if="modal==='allowances'" class="pr-modal-body pr-stack">
            <div class="pr-note">Allowances repeat monthly. Add one-time earnings in the payroll run.</div>
            <div v-if="allowances.length"><div class="pr-item-row" v-for="item in allowances" :key="item.id"><div><strong>{{item.label}}</strong><div class="pr-small pr-muted">KES {{money(item.amount)}} per month · {{item.is_active?'Active':'Inactive'}}</div></div><button v-if="item.is_active" class="pr-btn pr-btn-small pr-btn-danger" :disabled="busy" @click="disableAllowance(item.id)">Disable</button></div></div>
            <form class="pr-stack" @submit.prevent="saveAllowance"><div class="pr-fields"><label class="pr-label">Allowance name<input class="pr-input" v-model.trim="allowanceForm.label" required placeholder="Responsibility allowance" /></label><label class="pr-label">Amount (KES)<input class="pr-input" v-model="allowanceForm.amount" type="number" step="0.01" min="0" required /></label></div><button class="pr-btn pr-btn-primary" type="submit" :disabled="busy">+ Add recurring allowance</button></form>
          </div>

          <form v-else-if="modal==='assisted'" @submit.prevent="assistedStep === 1 ? startAssisted() : completeAssisted()">
            <div class="pr-modal-body pr-stack">
              <template v-if="assistedStep===1"><div class="pr-note">An OTP is sent privately to the employee's registered phone. Do not proceed without the employee's informed consent.</div>
                <label class="pr-label">Non-teaching employee<select class="pr-select" v-model.number="assisted.profile" required><option value="" disabled>Select employee</option><option v-for="p in nonTeachingProfiles" :value="p.id" :key="p.id">{{p.employee_name}}</option></select></label>
                <div class="pr-fields"><label class="pr-label">Year<input type="number" class="pr-input" min="2000" max="2100" v-model.number="assisted.year" required /></label><label class="pr-label">Month<select class="pr-select" v-model.number="assisted.month"><option v-for="(m,i) in months" :value="i+1" :key="i">{{m}}</option></select></label></div>
                <label class="pr-label">Amount (KES)<input type="number" class="pr-input" v-model="assisted.amount" min="0.01" step="0.01" required /></label>
              </template>
              <template v-else><div class="pr-note">Verification sent to <strong>{{otpMaskedPhone}}</strong>. Ask the employee to provide the code only after confirming the amount and month.</div><label class="pr-label">Six-digit code<input class="pr-input" v-model.trim="assisted.code" inputmode="numeric" maxlength="6" pattern="[0-9]{6}" required /></label><label class="pr-label">Reason for advance<textarea class="pr-textarea" v-model.trim="assisted.reason" required rows="3" placeholder="Reason provided by employee" /></label></template>
            </div><footer class="pr-modal-foot"><button type="button" class="pr-btn" @click="closeModal">Cancel</button><button type="submit" class="pr-btn pr-btn-primary" :disabled="busy">{{assistedStep===1?'Send staff OTP':'Submit request'}}</button></footer>
          </form>

          <form v-else-if="modal==='decision'" @submit.prevent="submitDecision"><div class="pr-modal-body pr-stack"><p class="pr-muted">{{ decisionAction==='decline'?'Decline this advance request?':'Record this decision?' }}</p><label class="pr-label">Note (optional)<textarea class="pr-textarea" v-model="decisionNote" rows="3" /></label></div><footer class="pr-modal-foot"><button type="button" class="pr-btn" @click="closeModal">Cancel</button><button type="submit" class="pr-btn pr-btn-danger" :disabled="busy">Decline request</button></footer></form>

          <form v-else-if="modal==='disburse'" @submit.prevent="saveDisbursement"><div class="pr-modal-body pr-stack"><div class="pr-note warning">Only record this after money has actually been sent. This action does not transfer money.</div><div class="pr-summary-row"><strong>Approved advance</strong><strong>KES {{money(activeAdvance?.amount)}}</strong></div>
            <div class="pr-fields"><label class="pr-label">Paid via<select class="pr-select" v-model="cashForm.method"><option value="MANUAL_MPESA">M-Pesa (manual)</option><option value="BANK">Bank</option><option value="CASH">Cash</option></select></label><label class="pr-label">Debit account ID<input class="pr-input" v-model.trim="cashForm.account_ref" required placeholder="e.g. SCHOOL-MPESA-01" /></label><label class="pr-label">Payment reference<input class="pr-input" v-model.trim="cashForm.reference" required /></label><label class="pr-label">Actual date/time (Nairobi)<input class="pr-input" type="datetime-local" v-model="cashForm.paid_at" required /></label><label class="pr-label full">Evidence / notes (optional)<textarea class="pr-textarea" v-model="cashForm.evidence" rows="2" /></label></div>
          </div><footer class="pr-modal-foot"><button type="button" class="pr-btn" @click="closeModal">Cancel</button><button type="submit" class="pr-btn pr-btn-primary" :disabled="busy">Confirm already paid</button></footer></form>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'
import {
  asRows, money, payrollMonthName, kenyaMonth, kenyaDateTimeNow, nairobiISO, getErrorMessage,
  getPayrollRuns, createPayrollRun, getPayrollProfiles, createPayrollProfile,
  updatePayrollProfile, getPayrollAllowances, createPayrollAllowance, disablePayrollAllowance,
  getPayrollAdvances, recommendPayrollAdvance, declinePayrollAdvance,
  startAssistedAdvance, completeAssistedAdvance, getPayrollStaffDirectory,
  getAdvanceDisbursementAuthorization, recordAdvanceDisbursement,
} from '../../../api/payroll'
import '../../../styles/payroll.css'

const router = useRouter()
const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
const tabs = [{key:'overview',label:'Overview'},{key:'staff',label:'Staff salaries'},{key:'advances',label:'Advances'},{key:'history',label:'History'}]
const period = ref(kenyaMonth())
const tab = ref('overview')
const runs = ref([]), profiles = ref([]), advances = ref([])
const loading = ref(false), busy = ref(false), error = ref(''), notice = ref(''), modalError = ref('')
const staffQuery = ref(''), staffFilter = ref('all'), advanceQuery = ref(''), advanceFilter = ref('all')
const modal = ref(''), activeProfile = ref(null), activeAdvance = ref(null)
const profileForm = ref({basic_salary:'',mpesa_number:'',notes:'',is_active:true})
const employeeKind = ref('teacher'), employeeId = ref(''), directoryRows = ref([]), directoryWarning = ref('')
const allowances = ref([]), allowanceForm = ref({label:'',amount:''})
const assistedStep = ref(1), assisted = ref({}), otpChallenge = ref(null), otpMaskedPhone = ref('')
const decisionAction = ref(''), decisionNote = ref('')
const cashForm = ref({method:'MANUAL_MPESA',account_ref:'',reference:'',paid_at:kenyaDateTimeNow(),evidence:''})
const sortedRuns = computed(() => [...runs.value].sort((a,b) => (b.year-a.year)||(b.month-a.month)))
const validPeriod = computed(() => Number.isInteger(Number(period.value.year)) && period.value.year >= 2000 && period.value.year <=2100 && period.value.month>=1 && period.value.month<=12)
const existingPeriodRun = computed(() => runs.value.find(r=>r.year===period.value.year&&r.month===period.value.month))
const currentRun = computed(() => sortedRuns.value[0] || null)
const activeProfiles = computed(() => profiles.value.filter(p=>p.is_active))
const nonTeachingProfiles = computed(() => activeProfiles.value.filter(p=>p.employee_kind==='NON_TEACHING'))
const filteredProfiles = computed(() => profiles.value.filter(p => {
  const q=staffQuery.value.toLowerCase();return (staffFilter.value==='all'|| (staffFilter.value==='active')===Boolean(p.is_active)) &&
  `${p.employee_name} ${p.position} ${p.mpesa_number}`.toLowerCase().includes(q)
}))
const filteredAdvances = computed(() => advances.value.filter(a => {
  return (advanceFilter.value==='all'||a.status===advanceFilter.value) && a.employee_name.toLowerCase().includes(advanceQuery.value.toLowerCase())
}))
const modalTitle = computed(() => ({enroll:'Enroll existing staff',profile:activeProfile.value?.employee_name || 'Salary profile',allowances:'Recurring allowances',assisted:'Non-teaching staff advance',decision:'Review advance',disburse:'Record advance payment'}[modal.value] || 'Payroll'))
const modalSub = computed(() => ({enroll:'Link a registered employee to Payroll',profile:'Update their ongoing salary profile',allowances:activeProfile.value?.employee_name,assisted:'The employee must verify the request',disburse:activeAdvance.value?.employee_name}[modal.value] || ''))
const labelStatus = (s) => ({PAID:'Disbursed',RECOMMENDED:'Recommended',APPROVED:'Approved',SUBMITTED:'Submitted',DRAFT:'Draft',DECLINED:'Declined',REJECTED:'Rejected',CANCELLED:'Cancelled'}[s] || s)
const tone = (s) => ['APPROVED','PAID'].includes(s)?'success':['SUBMITTED','RECOMMENDED','DRAFT'].includes(s)?'warning':['DECLINED','REJECTED','CANCELLED'].includes(s)?'danger':'blue'
const personName = (person) => person.full_name || [person.first_name, person.last_name].filter(Boolean).join(' ') || person.name || `Employee #${person.id}`
function openRun(id){ router.push({name:'finance-payroll-run',params:{id}}) }
function closeModal(){ if(!busy.value){modal.value='';modalError.value=''} }
async function refresh(){ loading.value=true;error.value='';try{const [r,p,a] = await Promise.all([getPayrollRuns(),getPayrollProfiles(),getPayrollAdvances()]);runs.value=asRows(r);profiles.value=asRows(p);advances.value=asRows(a)}catch(e){error.value=getErrorMessage(e)}finally{loading.value=false} }
async function beginRun(){ error.value=''; if(existingPeriodRun.value){openRun(existingPeriodRun.value.id);return} if(!validPeriod.value)return
  busy.value=true;try{const run=await createPayrollRun(period.value.year,period.value.month);openRun(run.id)}catch(e){error.value=getErrorMessage(e);await refresh()}finally{busy.value=false}
}
function openEnroll(){modal.value='enroll';modalError.value='';employeeKind.value='teacher';employeeId.value='';profileForm.value={basic_salary:'',mpesa_number:'',notes:'',is_active:true};loadDirectory()}
async function loadDirectory(){directoryRows.value=[];directoryWarning.value='';employeeId.value='';try{directoryRows.value=asRows(await getPayrollStaffDirectory(employeeKind.value)).filter(p => p.is_active!==false)}catch{directoryWarning.value='Directory lookup unavailable. Enter the ID of an existing employee. Confirm the directory route in payroll.js.'}}
async function saveEnrollment(){busy.value=true;modalError.value='';try{const id=Number(employeeId.value);if(!Number.isInteger(id)||id<1)throw new Error('Choose a registered employee');await createPayrollProfile({teacher_id:employeeKind.value==='teacher'?id:null,non_teaching_staff_id:employeeKind.value==='non_teaching'?id:null,basic_salary:profileForm.value.basic_salary,mpesa_number:profileForm.value.mpesa_number,notes:profileForm.value.notes});modal.value='';notice.value='Employee enrolled in payroll.';await refresh();tab.value='staff'}catch(e){modalError.value=getErrorMessage(e)}finally{busy.value=false}}
function openProfile(profile){activeProfile.value=profile;profileForm.value={basic_salary:profile.basic_salary,mpesa_number:profile.mpesa_number||'',notes:profile.notes||'',is_active:profile.is_active};modalError.value='';modal.value='profile'}
async function saveProfile(){busy.value=true;modalError.value='';try{await updatePayrollProfile(activeProfile.value.id,profileForm.value);modal.value='';notice.value='Salary profile updated.';await refresh()}catch(e){modalError.value=getErrorMessage(e)}finally{busy.value=false}}
async function openAllowances(profile){activeProfile.value=profile;modal.value='allowances';modalError.value='';allowanceForm.value={label:'',amount:''};try{allowances.value=asRows(await getPayrollAllowances(profile.id))}catch(e){modalError.value=getErrorMessage(e)}}
async function saveAllowance(){busy.value=true;modalError.value='';try{await createPayrollAllowance(activeProfile.value.id,allowanceForm.value);allowances.value=asRows(await getPayrollAllowances(activeProfile.value.id));allowanceForm.value={label:'',amount:''};notice.value='Recurring allowance added.'}catch(e){modalError.value=getErrorMessage(e)}finally{busy.value=false}}
async function disableAllowance(id){busy.value=true;modalError.value='';try{await disablePayrollAllowance(id);allowances.value=asRows(await getPayrollAllowances(activeProfile.value.id))}catch(e){modalError.value=getErrorMessage(e)}finally{busy.value=false}}
function openAssisted(){assistedStep.value=1;assisted.value={profile:'',...kenyaMonth(),amount:'',code:'',reason:''};otpChallenge.value=null;otpMaskedPhone.value='';modalError.value='';modal.value='assisted'}
async function startAssisted(){busy.value=true;modalError.value='';try{const result=await startAssistedAdvance({profile:Number(assisted.value.profile),year:Number(assisted.value.year),month:Number(assisted.value.month),amount:assisted.value.amount});otpChallenge.value=result.challenge_id;otpMaskedPhone.value=result.masked_phone;assistedStep.value=2}catch(e){modalError.value=getErrorMessage(e)}finally{busy.value=false}}
async function completeAssisted(){busy.value=true;modalError.value='';try{await completeAssistedAdvance({challenge_id:otpChallenge.value,code:assisted.value.code,reason:assisted.value.reason});modal.value='';notice.value='Employee advance request submitted for review.';tab.value='advances';await refresh()}catch(e){modalError.value=getErrorMessage(e)}finally{busy.value=false}}
async function handleAdvance(action,advance){busy.value=true;error.value='';try{if(action==='recommend')await recommendPayrollAdvance(advance.id);notice.value='Advance recommended to principal.';await refresh()}catch(e){error.value=getErrorMessage(e)}finally{busy.value=false}}
function openDecision(action,advance){activeAdvance.value=advance;decisionAction.value=action;decisionNote.value='';modalError.value='';modal.value='decision'}
async function submitDecision(){busy.value=true;modalError.value='';try{if(decisionAction.value==='decline')await declinePayrollAdvance(activeAdvance.value.id,decisionNote.value);modal.value='';notice.value='Advance decision recorded.';await refresh()}catch(e){modalError.value=getErrorMessage(e)}finally{busy.value=false}}
async function openDisburse(advance){activeAdvance.value=advance;modalError.value='';try{await getAdvanceDisbursementAuthorization(advance.id);cashForm.value={method:'MANUAL_MPESA',account_ref:'',reference:'',paid_at:kenyaDateTimeNow(),evidence:''};modal.value='disburse'}catch(e){error.value=getErrorMessage(e)}}
async function saveDisbursement(){busy.value=true;modalError.value='';try{await recordAdvanceDisbursement(activeAdvance.value.id,{...cashForm.value,paid_at:nairobiISO(cashForm.value.paid_at),amount:activeAdvance.value.amount});modal.value='';notice.value='Advance payment recorded. No money was sent by QRSMS.';await refresh()}catch(e){modalError.value=getErrorMessage(e)}finally{busy.value=false}}
onMounted(refresh)
</script>

<style scoped src="../../../styles/portal-payroll.css"></style>

