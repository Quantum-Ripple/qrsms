<template>
  <div class="min-h-screen bg-gray-50 p-4 md:p-6">
    <main class="qr-payroll pr-detail-page mx-auto max-w-7xl">
      <div class="pr-run-heading">
        <button class="pr-back" type="button" @click="back">← Payroll overview</button>
        <header class="pr-top">
          <div>
            <h1>{{ run ? payrollMonthName(run.year,run.month) : 'Payroll run' }}</h1>
            <div v-if="run" class="pr-run-meta">
              <span>{{ run.employee_count }} employees</span>
              <span class="pr-badge" :class="tone(run.status)">{{ run.status === 'DRAFT' ? 'Draft' : run.status === 'SUBMITTED' ? 'Awaiting approval' : run.status === 'APPROVED' ? 'Approved' : run.status }}</span>
            </div>
          </div>
          <div class="pr-actions pr-run-actions">
            <button class="pr-btn" type="button" @click="reload" :disabled="loading">Refresh</button>
            <button v-if="isDraft" class="pr-btn pr-btn-primary" type="button" :disabled="busy||hasIssues" @click="submitRun">Submit for approval</button>
            <button v-if="isApproved" class="pr-btn" type="button" :disabled="busy" @click="download('csv')">Export CSV</button>
            <button v-if="isApproved" class="pr-btn" type="button" :disabled="busy" @click="download('pdf')">Download report</button>
          </div>
        </header>
      </div>

      <div v-if="error" class="pr-error" role="alert">{{ error }}</div>
      <div v-if="notice" class="pr-success" role="status">{{ notice }}</div>
      <div v-if="loading && !run" class="pr-panel pr-empty">Loading payroll…</div>

      <template v-else-if="run">
        <div class="pr-stat-grid">
          <div class="pr-stat"><div class="pr-stat-label">Gross earnings</div><div class="pr-stat-value">KES {{ money(run.gross_total) }}</div></div>
          <div class="pr-stat"><div class="pr-stat-label">Employee deductions</div><div class="pr-stat-value">KES {{ money(run.deductions_total) }}</div></div>
          <div class="pr-stat">
            <div class="pr-stat-label">Net pay</div><div class="pr-stat-value">KES {{ money(run.net_total) }}</div>
            <div class="pr-stat-note">Advance recoveries: KES {{ money(run.advances_total) }}</div>
          </div>
          <div class="pr-stat"><div class="pr-stat-label">Total employer cost</div><div class="pr-stat-value">KES {{ money(run.employer_cost_total) }}</div></div>
        </div>

        <section v-if="isApproved" class="pr-panel">
          <div class="pr-panel-head">
            <h2>Payment progress</h2>
            <button class="pr-btn" type="button" @click="openRemit">Record statutory remittance</button>
          </div>
          <div class="pr-panel-body">
            <div class="pr-run-meta"><span class="pr-badge success">{{ paidCount }} settled</span><span class="pr-badge warning">{{ unpaidCount }} outstanding</span></div>
            <div class="pr-progress-track" role="progressbar" aria-label="Salary payment progress" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100">
              <div class="pr-progress-fill" :style="{ width: progress + '%' }"></div>
            </div>
          </div>
        </section>

        <div v-if="isDraft && issues.length" class="pr-note warning" role="alert">
          <strong>Resolve before submitting</strong>
          <ul class="pr-issue-list"><li v-for="(issue,i) in issues" :key="i">{{ issueText(issue) }}</li></ul>
        </div>
        <div v-if="run.status==='SUBMITTED'" class="pr-note">Awaiting principal approval. Salary figures are locked.</div>

        <section class="pr-section" aria-labelledby="employee-salaries-heading">
          <div class="pr-panel">
            <div class="pr-panel-head">
              <h2 id="employee-salaries-heading">Employee salaries <span class="pr-small pr-muted">(KES)</span></h2>
              <button v-if="isDraft" class="pr-btn pr-btn-primary" type="button" @click="openAddEmployee">Add employee</button>
            </div>
            <div class="pr-panel-body">
              <label class="pr-label">Search staff<input class="pr-input" v-model.trim="query" placeholder="Name or position" /></label>
            </div>
          </div>
          <div v-if="!filteredLines.length" class="pr-panel pr-empty">No employees found.</div>
          <template v-else>
            <div class="pr-panel pr-table-scroll pr-desktop-table">
              <table class="pr-table pr-salary-table" aria-label="Employee salaries in KES">
                <thead><tr><th>Employee</th><th class="right">Basic salary</th><th class="right">Other earnings</th><th class="right">Deductions</th><th class="right">Advance recoveries</th><th class="right">Net pay</th><th>Status</th><th class="right">Actions</th></tr></thead>
                <tbody>
                  <tr v-for="line in filteredLines" :key="line.id">
                    <td>
                      <div class="pr-name">{{ line.snapshot_name }}</div>
                      <div class="pr-description">{{ line.snapshot_position }}<span v-if="line.flag_new_staff"> · New</span><span v-if="line.flag_salary_changed"> · Salary changed</span></div>
                    </td>
                    <td class="right">{{ money(line.basic_salary) }}</td><td class="right">{{ money(Number(line.gross)-Number(line.basic_salary)) }}</td>
                    <td class="right">{{ money(line.deductions_total) }}</td><td class="right">{{ money(line.advances_recovered) }}</td><td class="right pr-amount">{{ money(line.net) }}</td>
                    <td><span class="pr-badge" :class="tone(line.settlement_status)">{{ settlementLabel(line) }}</span></td>
                    <td class="right">
                      <div class="pr-inline-actions">
                        <button class="pr-btn pr-btn-small" type="button" @click="openLine(line)">{{ isDraft ? 'Edit' : 'View' }}</button>
                        <button v-if="isApproved" class="pr-btn pr-btn-small" type="button" @click="downloadLinePayslip(line)">Payslip</button>
                        <button v-if="isApproved && Number(line.net)>0 && !isPaid(line)" class="pr-btn pr-btn-primary" type="button" @click="openPay(line)">Record payment</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="pr-mobile-list">
              <article v-for="line in filteredLines" :key="line.id" class="pr-mobile-card">
                <div class="pr-card-head">
                  <div><h3>{{ line.snapshot_name }}</h3><p class="pr-description">{{ line.snapshot_position }}<span v-if="line.flag_new_staff"> · New</span><span v-if="line.flag_salary_changed"> · Salary changed</span></p></div>
                  <span class="pr-badge" :class="tone(line.settlement_status)">{{ settlementLabel(line) }}</span>
                </div>
                <dl class="pr-card-details">
                  <div><dt>Basic salary</dt><dd>KES {{ money(line.basic_salary) }}</dd></div>
                  <div><dt>Other earnings</dt><dd>KES {{ money(Number(line.gross)-Number(line.basic_salary)) }}</dd></div>
                  <div><dt>Deductions</dt><dd>KES {{ money(line.deductions_total) }}</dd></div>
                  <div><dt>Advance recoveries</dt><dd>KES {{ money(line.advances_recovered) }}</dd></div>
                  <div class="pr-card-full pr-card-total"><dt>Net pay</dt><dd>KES {{ money(line.net) }}</dd></div>
                </dl>
                <div class="pr-card-actions">
                  <button class="pr-btn" type="button" @click="openLine(line)">{{ isDraft ? 'Edit salary' : 'View breakdown' }}</button>
                  <button v-if="isApproved" class="pr-btn" type="button" @click="downloadLinePayslip(line)">Payslip</button>
                  <button v-if="isApproved && Number(line.net)>0 && !isPaid(line)" class="pr-btn pr-btn-primary pr-payment-action" type="button" @click="openPay(line)">Record payment</button>
                </div>
              </article>
            </div>
          </template>
        </section>

        <section class="pr-run-secondary">
          <div class="pr-panel">
            <div class="pr-panel-head"><h2>Review notes</h2></div>
            <div v-if="!review?.changes?.length && !review?.duplicate_mpesa_numbers?.length" class="pr-empty">No flagged changes.</div>
            <div v-else class="pr-panel-body">
              <div v-for="change in review?.changes || []" :key="change.line_id" class="pr-item-row">
                <div><strong>{{ change.employee }}</strong><div class="pr-small pr-muted">{{ changeSummary(change) }}</div></div>
              </div>
              <div v-for="dupe in review?.duplicate_mpesa_numbers || []" :key="dupe.phone" class="pr-note warning">Shared phone {{ dupe.phone }} · {{ dupe.staff?.join(', ') }}</div>
            </div>
          </div>
          <details class="pr-panel pr-guide">
            <summary><span>Payroll details</span><ChevronDownIcon class="pr-guide-chevron" aria-hidden="true" /></summary>
            <dl class="pr-run-records">
              <div><dt>Rule version</dt><dd>{{ run.rule_version }}</dd></div>
              <div><dt>Calculation algorithm</dt><dd>{{ run.algorithm_version || '—' }}</dd></div>
              <div><dt>Approval</dt><dd>{{ run.approved_at ? 'Completed' : 'Not yet approved' }}</dd></div>
              <div><dt>Employees</dt><dd>{{ lines.length }}</dd></div>
            </dl>
          </details>
        </section>

        <section v-if="reviewEvents.length" class="pr-panel">
          <div class="pr-panel-head"><h2>Payment evidence to review</h2><span class="pr-badge warning">{{ reviewEvents.length }} unresolved</span></div>
          <div class="pr-panel-body">
            <div v-for="event in reviewEvents" :key="event.id" class="pr-item-row">
              <div><strong>{{ event.method }} · {{ event.reference }}</strong><div class="pr-small pr-muted">KES {{ money(event.amount) }} · {{ event.review_reason || 'Needs reconciliation' }}</div></div>
              <button class="pr-btn" type="button" :disabled="busy" @click="reconcile(event)">Recheck evidence</button>
            </div>
          </div>
        </section>
      </template>

      <div v-if="modal" class="pr-modal-scrim" @click.self="closeModal">
        <section class="pr-modal" :class="{ wide: modal==='line' }" role="dialog" aria-modal="true" :aria-label="modalTitle">
          <header class="pr-modal-head">
            <div>
              <h2>{{ modalTitle }}</h2>
              <p>{{ modal === 'add' || modal === 'remit' ? payrollMonthName(run.year,run.month) : selectedLine?.snapshot_name || payrollMonthName(run.year,run.month) }}</p>
            </div>
            <button class="pr-close" type="button" @click="closeModal" aria-label="Close dialog">×</button>
          </header>
          <div v-if="modalError" class="pr-error pr-dialog-error" role="alert">{{ modalError }}</div>

          <div v-if="modal==='line'" class="pr-modal-body pr-stack">
            <div class="pr-breakdown-totals">
              <div class="pr-stat"><div class="pr-stat-label">Gross earnings</div><div class="pr-stat-value">KES {{ money(selectedLine?.gross) }}</div></div>
              <div class="pr-stat"><div class="pr-stat-label">Net pay</div><div class="pr-stat-value">KES {{ money(selectedLine?.net) }}</div></div>
            </div>

            <div class="pr-panel">
              <div class="pr-panel-head">
                <h3>Earnings <span class="pr-small pr-muted">(KES)</span></h3>
                <button v-if="isDraft" class="pr-btn pr-btn-small" type="button" @click="openAction('earning')">Add one-time earning</button>
              </div>
              <div class="pr-panel-body">
                <div class="pr-item-row"><span>Basic salary</span><strong>{{ money(selectedLine?.basic_salary) }}</strong></div>
                <div v-for="item in selectedLine?.earnings || []" :key="item.id" class="pr-item-row">
                  <div><strong>{{ item.label }}</strong><div class="pr-small pr-muted">{{ item.kind==='ONE_OFF' ? 'This month only' : 'Recurring' }}</div></div>
                  <div class="pr-inline"><strong>{{ money(item.amount) }}</strong><button v-if="isDraft && item.kind==='ONE_OFF'" :disabled="busy" class="pr-btn pr-btn-small pr-btn-danger" type="button" @click="deleteEarning(item)">Remove</button></div>
                </div>
              </div>
            </div>

            <div class="pr-panel">
              <div class="pr-panel-head">
                <h3>Deductions <span class="pr-small pr-muted">(KES)</span></h3>
                <button v-if="isDraft" class="pr-btn pr-btn-small" type="button" @click="openAction('deduction')">Add other deduction</button>
              </div>
              <div class="pr-panel-body">
                <div v-for="item in selectedLine?.deductions || []" :key="item.id" class="pr-item-row">
                  <div><strong>{{ item.label || item.code }}</strong><div v-if="item.is_override" class="pr-small pr-muted">Adjusted from {{ money(item.calculated_amount) }} · {{ item.override_reason }}</div></div>
                  <div class="pr-inline">
                    <strong>{{ money(item.amount) }}</strong>
                    <button v-if="isDraft && item.code!=='OTHER'" class="pr-btn pr-btn-small" type="button" @click="openOverride(item)">Adjust</button>
                    <button v-if="isDraft && item.code==='OTHER'" class="pr-btn pr-btn-small pr-btn-danger" type="button" :disabled="busy" @click="deleteDeduction(item)">Remove</button>
                  </div>
                </div>
                <div v-if="!selectedLine?.deductions?.length" class="pr-muted pr-small">No deductions.</div>
                <div class="pr-item-row"><span>Advance recoveries</span><strong>{{ money(selectedLine?.advances_recovered) }}</strong></div>
              </div>
            </div>

            <div class="pr-panel">
              <div class="pr-panel-head"><h3>Employer contributions <span class="pr-small pr-muted">(KES)</span></h3></div>
              <div class="pr-panel-body">
                <div v-for="item in selectedLine?.employer_contributions || []" :key="item.id" class="pr-summary-row"><span>{{ item.label || item.code }}</span><strong>{{ money(item.amount) }}</strong></div>
                <div v-if="!selectedLine?.employer_contributions?.length" class="pr-muted pr-small">None recorded.</div>
              </div>
            </div>

            <div v-if="isDraft" class="pr-collapse pr-breakdown-actions">
              <button class="pr-btn" type="button" @click="openAction('edit')">Edit salary / phone</button>
              <button class="pr-btn" type="button" @click="openReason('refresh')">Refresh salary profile</button>
              <button class="pr-btn pr-btn-danger" type="button" @click="openReason('remove')">Remove from draft</button>
            </div>
            <div v-if="isApproved && selectedLine?.payment" class="pr-note">Payment recorded · {{ selectedLine.payment.reference }} · {{ selectedLine.payment.method }}</div>
            <div v-if="!isDraft" class="pr-note">Salary figures are locked. Payment records can still be updated after approval.</div>
          </div>

          <form v-else-if="modal==='edit'" @submit.prevent="saveLine">
            <div class="pr-modal-body pr-stack">
              <label class="pr-label">Basic salary for this month (KES)<input v-model="form.basic_salary" class="pr-input" type="number" min="0" step="0.01" required /></label>
              <label class="pr-label">Payment phone (optional)<input v-model.trim="form.mpesa_number" class="pr-input" placeholder="2547XXXXXXXX" /></label>
              <div class="pr-note">Changes apply to this draft only.</div>
            </div>
            <footer class="pr-modal-foot"><button type="button" class="pr-btn" @click="closeModal">Cancel</button><button type="submit" class="pr-btn pr-btn-primary" :disabled="busy">Save changes</button></footer>
          </form>

          <form v-else-if="modal==='earning'||modal==='deduction'" @submit.prevent="saveComponent">
            <div class="pr-modal-body pr-stack">
              <label class="pr-label">{{ modal==='earning' ? 'Earning' : 'Deduction' }} name<input class="pr-input" v-model.trim="form.label" required maxlength="100" :placeholder="modal==='earning' ? 'e.g. Overtime' : 'e.g. Staff loan'" /></label>
              <label class="pr-label">Amount (KES)<input class="pr-input" v-model="form.amount" required type="number" min="0" step="0.01" /></label>
            </div>
            <footer class="pr-modal-foot"><button type="button" class="pr-btn" @click="closeModal">Cancel</button><button class="pr-btn pr-btn-primary" type="submit" :disabled="busy">Add {{ modal==='earning' ? 'earning' : 'deduction' }}</button></footer>
          </form>

          <form v-else-if="modal==='override'" @submit.prevent="saveOverride">
            <div class="pr-modal-body pr-stack">
              <div class="pr-note">Calculated: KES {{ money(selectedDeduction?.calculated_amount) }}. Adjustments are audited and reviewed by the principal.</div>
              <label class="pr-label">Adjusted amount (KES)<input class="pr-input" type="number" min="0" step="0.01" v-model="form.amount" required /></label>
              <label class="pr-label">Reason for adjustment<textarea class="pr-textarea" v-model.trim="form.reason" minlength="8" rows="3" required /></label>
            </div>
            <footer class="pr-modal-foot"><button class="pr-btn" type="button" @click="closeModal">Cancel</button><button type="submit" class="pr-btn pr-btn-primary" :disabled="busy">Save adjustment</button></footer>
          </form>

          <form v-else-if="modal==='add'" @submit.prevent="saveAddEmployee">
            <div class="pr-modal-body pr-stack">
              <label class="pr-label">Enrolled employee<select class="pr-select" v-model.number="form.profile" required><option value="" disabled>Select employee</option><option v-for="profile in availableProfiles" :key="profile.id" :value="profile.id">{{ profile.employee_name }} · {{ profile.position }}</option></select></label>
              <div class="pr-note">Only active staff enrolled in payroll are listed.</div>
            </div>
            <footer class="pr-modal-foot"><button type="button" class="pr-btn" @click="closeModal">Cancel</button><button type="submit" class="pr-btn pr-btn-primary" :disabled="busy">Add employee</button></footer>
          </form>

          <form v-else-if="modal==='reason'" @submit.prevent="submitReason">
            <div class="pr-modal-body pr-stack">
              <div class="pr-note">{{ reasonMode==='remove' ? 'Remove this employee from this draft only.' : 'Use the current salary profile. One-time earnings and audited adjustments are kept.' }}</div>
              <label class="pr-label">Reason (minimum 8 characters)<textarea class="pr-textarea" v-model.trim="form.reason" rows="3" minlength="8" required /></label>
            </div>
            <footer class="pr-modal-foot"><button type="button" class="pr-btn" @click="closeModal">Cancel</button><button class="pr-btn" :class="reasonMode==='remove' ? 'pr-btn-danger' : 'pr-btn-primary'" type="submit" :disabled="busy">{{ reasonMode==='remove' ? 'Remove' : 'Refresh' }}</button></footer>
          </form>

          <form v-else-if="modal==='pay'||modal==='remit'" @submit.prevent="saveCash">
            <div class="pr-modal-body pr-stack">
              <div class="pr-note warning">Record a completed payment. This form does not send money.</div>
              <div v-if="modal==='pay'" class="pr-summary-row"><span>Salary payable</span><strong>KES {{ money(selectedLine?.net) }}</strong></div>
              <div v-else class="pr-fields">
                <label class="pr-label">Statutory item<select class="pr-select" v-model="form.code" @change="form.amount=remittanceTotal(form.code)"><option v-for="code in ['PAYE','NSSF','SHIF','AHL']" :key="code">{{ code }}</option></select></label>
                <label class="pr-label">Total remittance (KES)<input type="number" class="pr-input" v-model="form.amount" min="0.01" step="0.01" required /></label>
              </div>
              <div class="pr-fields">
                <label class="pr-label">Payment channel<select class="pr-select" v-model="form.method"><option value="MANUAL_MPESA">M-Pesa (manual)</option><option value="BANK">Bank</option><option value="CASH">Cash</option></select></label>
                <label class="pr-label">Debit account ID<input class="pr-input" v-model.trim="form.account_ref" required placeholder="SCHOOL-BANK-01" /></label>
                <label class="pr-label">Transaction reference<input class="pr-input" v-model.trim="form.reference" required /></label>
                <label class="pr-label">Actual date/time (Nairobi)<input class="pr-input" type="datetime-local" v-model="form.paid_at" required /></label>
                <label class="pr-label full">Evidence / notes (optional)<textarea class="pr-textarea" v-model="form.evidence" rows="2" /></label>
              </div>
            </div>
            <footer class="pr-modal-foot"><button type="button" class="pr-btn" @click="closeModal">Cancel</button><button type="submit" class="pr-btn pr-btn-primary" :disabled="busy">Confirm already paid</button></footer>
          </form>

          <footer v-else class="pr-modal-foot"><button class="pr-btn" type="button" @click="closeModal">Close</button></footer>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'
import {
  asRows, money, payrollMonthName, kenyaDateTimeNow, nairobiISO, getErrorMessage,
  getPayrollRun, getPayrollReview, getPayrollEligibility, getPayrollProfiles, getPayrollCashEvents,
  submitPayrollRun, updatePayrollLine, createPayrollEarning, createPayrollDeduction,
  removePayrollEarning, removePayrollDeduction, overridePayrollDeduction,
  addPayrollEmployee, refreshPayrollEmployee, removePayrollEmployee,
  recordPayrollSalaryPayment, recordPayrollRemittance, reconcilePayrollCashEvent,
  downloadPayrollPDF, downloadPayrollCSV, downloadPayslip, saveBlob,
} from '../../../api/payroll'
import '../../../styles/payroll.css'
const route=useRoute(),router=useRouter()
const run=ref(null),review=ref(null),profiles=ref([]),cashEvents=ref([]),issues=ref([])
const query=ref(''),loading=ref(true),busy=ref(false),error=ref(''),notice=ref(''),modalError=ref(''),modal=ref('')
const selectedLine=ref(null),selectedDeduction=ref(null),form=ref({}),reasonMode=ref('')
const lines=computed(()=>run.value?.lines||[])
const isDraft=computed(()=>run.value?.status==='DRAFT')
const isApproved=computed(()=>run.value?.status==='APPROVED')
const hasIssues=computed(()=>issues.value.length>0)
const filteredLines=computed(()=>lines.value.filter(l=>`${l.snapshot_name} ${l.snapshot_position}`.toLowerCase().includes(query.value.toLowerCase())))
const availableProfiles=computed(()=>profiles.value.filter(p=>p.is_active && !lines.value.some(l=>l.profile===p.id)))
const isPaid=(line)=>line.settlement_status==='PAID'
const paidCount=computed(()=>lines.value.filter(l=>isPaid(l)||Number(l.net)<=0).length)
const unpaidCount=computed(()=>lines.value.filter(l=>Number(l.net)>0 && !isPaid(l)).length)
const progress=computed(()=>lines.value.length ? Math.round((paidCount.value/lines.value.length)*100) : 100)
const tone=(s)=>['PAID','NO_PAYMENT_DUE','APPROVED'].includes(s)?'success':['UNPAID','SUBMITTED','DRAFT','PENDING'].includes(s)?'warning':['REVIEW','FAILED','REVERSED'].includes(s)?'danger':'blue'
const settlementLabel=(line)=>({NO_PAYMENT_DUE:'No payment due',PAID:'Paid',UNPAID:'Unpaid',REVERSED:'Reversed',REVIEW:'Needs review'}[line.settlement_status] || (Number(line.net)<=0?'No payment due':line.settlement_status||'Unpaid'))
const modalTitle=computed(()=>({line:'Salary breakdown',edit:'Edit monthly pay',earning:'Add one-time earning',deduction:'Add other deduction',override:'Adjust statutory deduction',add:'Add employee to draft',reason:reasonMode.value==='remove'?'Remove from draft':'Refresh salary details',pay:'Record salary payment',remit:'Record statutory remittance'})[modal.value]||'Payroll')
const reviewEvents=computed(()=>{const ids=new Set(lines.value.map(l=>l.id));return cashEvents.value.filter(e=>e.state==='REVIEW'&&(ids.has(e.salary_line)||e.statutory_run===run.value?.id))})
function issueText(issue){if(typeof issue==='string')return issue;return issue?.message||issue?.reason||JSON.stringify(issue)}
function changeSummary(c){const items=[];if(c.new_staff)items.push('New employee');if(c.salary_changed)items.push('Salary changed');if(c.phone_changed)items.push('Payment phone changed');if(c.other_changes)items.push('Salary structure changed');if(c.statutory_overrides?.length)items.push('Statutory override');if(Object.keys(c.tax_changes||{}).length)items.push('Tax settings changed');return items.join(' · ') || 'Review change'}
function back(){router.push({name:'finance-payroll'})}
async function reload(){loading.value=true;error.value='';try{const id=route.params.id;const [r,rv,eg] =await Promise.all([getPayrollRun(id),getPayrollReview(id),getPayrollEligibility(id)]);run.value=r;review.value=rv;issues.value=eg?.issues||[];const [p,c] =await Promise.allSettled([getPayrollProfiles(),getPayrollCashEvents()]);if(p.status==='fulfilled')profiles.value=asRows(p.value);if(c.status==='fulfilled')cashEvents.value=asRows(c.value);if(selectedLine.value)selectedLine.value=lines.value.find(l=>l.id===selectedLine.value.id)||null}catch(e){error.value=getErrorMessage(e)}finally{loading.value=false}}
async function afterChange(message){notice.value=message;modal.value='';await reload()}
function closeModal(){if(!busy.value){modal.value='';modalError.value=''}}
function openLine(line){selectedLine.value=line;modalError.value='';modal.value='line'}
function openAction(type){form.value=type==='edit'?{basic_salary:selectedLine.value.basic_salary,mpesa_number:selectedLine.value.snapshot_mpesa_number||''}:{label:'',amount:''};modalError.value='';modal.value=type}
function openOverride(deduction){selectedDeduction.value=deduction;form.value={amount:deduction.amount,reason:''};modalError.value='';modal.value='override'}
function openReason(mode){reasonMode.value=mode;form.value={reason:''};modalError.value='';modal.value='reason'}
function openAddEmployee(){form.value={profile:''};modalError.value='';modal.value='add'}
function openPay(line){selectedLine.value=line;form.value={method:'MANUAL_MPESA',reference:'',account_ref:'',paid_at:kenyaDateTimeNow(),evidence:''};modalError.value='';modal.value='pay'}
function openRemit(){form.value={code:'PAYE',amount:remittanceTotal('PAYE'),method:'BANK',reference:'',account_ref:'',paid_at:kenyaDateTimeNow(),evidence:''};modalError.value='';modal.value='remit'}
function remittanceTotal(code){return lines.value.reduce((s,l)=>s+[...(l.deductions||[]),...(l.employer_contributions||[])].filter(d=>d.code===code||d.code===`${code}_ER`).reduce((x,d)=>x+Number(d.amount||0),0),0).toFixed(2)}
async function task(fn, message){busy.value=true;modalError.value='';try{await fn();await afterChange(message)}catch(e){modalError.value=getErrorMessage(e)}finally{busy.value=false}}
async function saveLine(){await task(()=>updatePayrollLine(selectedLine.value.id,{basic_salary:form.value.basic_salary,mpesa_number:form.value.mpesa_number}),'Monthly pay updated.')}
async function saveComponent(){const type=modal.value;await task(()=>type==='earning'?createPayrollEarning(selectedLine.value.id,form.value.label,form.value.amount):createPayrollDeduction(selectedLine.value.id,form.value.label,form.value.amount),'Salary breakdown updated.')}
async function saveOverride(){await task(()=>overridePayrollDeduction(selectedDeduction.value.id,form.value.amount,form.value.reason),'Statutory adjustment recorded and audited.')}
async function saveAddEmployee(){await task(()=>addPayrollEmployee(run.value.id,Number(form.value.profile)),'Employee added to draft.')}
async function submitReason(){const id=selectedLine.value.id,reason=form.value.reason,mode=reasonMode.value;await task(()=>mode==='remove'?removePayrollEmployee(id,reason):refreshPayrollEmployee(id,reason),mode==='remove'?'Employee removed from draft.':'Salary details refreshed.')}
async function deleteEarning(item){if(!window.confirm(`Remove ${item.label} from this draft?`))return;await task(()=>removePayrollEarning(item.id),'One-time earning removed.')}
async function deleteDeduction(item){if(!window.confirm(`Remove ${item.label} from this draft?`))return;await task(()=>removePayrollDeduction(item.id),'Other deduction removed.')}
async function saveCash(){const type=modal.value;const payload={...form.value,paid_at:nairobiISO(form.value.paid_at)};if(type==='pay')payload.amount=selectedLine.value.net;await task(()=>type==='pay'?recordPayrollSalaryPayment(selectedLine.value.id,payload):recordPayrollRemittance(run.value.id,payload),type==='pay'?'Salary payment recorded. No money was transferred.':'Statutory remittance recorded.')}
async function submitRun(){if(!window.confirm('Submit this payroll to the principal? The figures will be locked for approval.'))return;busy.value=true;error.value='';try{await submitPayrollRun(run.value.id);notice.value='Payroll sent for principal approval.';await reload()}catch(e){error.value=getErrorMessage(e)}finally{busy.value=false}}
async function reconcile(event){busy.value=true;error.value='';try{await reconcilePayrollCashEvent(event.id);notice.value='Evidence rechecked. Review its updated status.';await reload()}catch(e){error.value=getErrorMessage(e)}finally{busy.value=false}}
async function downloadLinePayslip(line){busy.value=true;error.value='';try{const r=await downloadPayslip(line.id);saveBlob(r,`payslip-${run.value.year}-${String(run.value.month).padStart(2,'0')}-${line.id}.pdf`)}catch(e){error.value=getErrorMessage(e)}finally{busy.value=false}}
async function download(kind){busy.value=true;error.value='';try{const res=kind==='pdf'?await downloadPayrollPDF(run.value.id):await downloadPayrollCSV(run.value.id);saveBlob(res,`payroll-${run.value.year}-${String(run.value.month).padStart(2,'0')}.${kind}`)}catch(e){error.value=getErrorMessage(e)}finally{busy.value=false}}
watch(()=>route.params.id,reload)
onMounted(reload)
</script>

<style scoped src="../../../styles/portal-payroll.css"></style>
