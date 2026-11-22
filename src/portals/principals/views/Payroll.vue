<template>
  <div class="min-h-screen bg-gray-50 p-4 md:p-6">
    <main class="qr-payroll pr-detail-page mx-auto max-w-7xl">
      <header class="pr-top">
        <h1>Payroll approvals</h1>
        <div class="pr-actions"><button class="pr-btn" type="button" @click="refresh" :disabled="loading">Refresh</button></div>
      </header>

      <div v-if="error" class="pr-error" role="alert">{{ error }}</div>
      <div v-if="notice" class="pr-success" role="status">{{ notice }}</div>

      <div class="pr-stat-grid">
        <div class="pr-stat"><div class="pr-stat-label">Payrolls to approve</div><div class="pr-stat-value">{{ awaitingRuns.length }}</div></div>
        <div class="pr-stat"><div class="pr-stat-label">Advances to approve</div><div class="pr-stat-value">{{ awaitingAdvances.length }}</div></div>
        <div class="pr-stat"><div class="pr-stat-label">Approved payrolls</div><div class="pr-stat-value">{{ approvedRuns.length }}</div></div>
        <div class="pr-stat"><div class="pr-stat-label">Enrolled employees</div><div class="pr-stat-value">{{ profiles.length }}</div></div>
      </div>

      <div class="pr-tabs" role="tablist" aria-label="Principal payroll tabs">
        <button v-for="item in tabs" :key="item.key" class="pr-tab" type="button" :class="{ active: tab===item.key }" role="tab" :aria-selected="tab===item.key" @click="tab=item.key">
          {{ item.label }} <span v-if="item.key==='runs' && awaitingRuns.length">({{ awaitingRuns.length }})</span><span v-if="item.key==='advances' && awaitingAdvances.length">({{ awaitingAdvances.length }})</span>
        </button>
      </div>

      <section v-if="tab==='runs'" class="pr-section-group">
        <section class="pr-section" aria-labelledby="awaiting-payroll-heading">
          <div class="pr-section-head"><h2 id="awaiting-payroll-heading">Payroll awaiting approval</h2></div>
          <div v-if="!awaitingRuns.length" class="pr-panel pr-empty">No payrolls awaiting approval.</div>
          <template v-else>
            <div class="pr-panel pr-table-scroll pr-desktop-table">
              <table class="pr-table" aria-label="Payroll awaiting approval">
                <thead><tr><th>Month</th><th>Employees</th><th>Gross earnings</th><th>Net pay</th><th>Rule version</th><th class="right">Action</th></tr></thead>
                <tbody>
                  <tr v-for="run in awaitingRuns" :key="run.id">
                    <td class="pr-name">{{ payrollMonthName(run.year,run.month) }}</td><td>{{ run.employee_count }}</td><td>KES {{ money(run.gross_total) }}</td><td class="pr-amount">KES {{ money(run.net_total) }}</td><td>{{ run.rule_version }}</td>
                    <td class="right"><button class="pr-btn pr-btn-primary" type="button" @click="openRun(run)">Review payroll</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="pr-mobile-list">
              <article v-for="run in awaitingRuns" :key="run.id" class="pr-mobile-card">
                <div class="pr-card-head"><h3>{{ payrollMonthName(run.year,run.month) }}</h3></div>
                <dl class="pr-card-details">
                  <div><dt>Employees</dt><dd>{{ run.employee_count }}</dd></div><div><dt>Rule version</dt><dd>{{ run.rule_version }}</dd></div>
                  <div><dt>Gross earnings</dt><dd>KES {{ money(run.gross_total) }}</dd></div><div><dt>Net pay</dt><dd>KES {{ money(run.net_total) }}</dd></div>
                </dl>
                <button class="pr-btn pr-btn-primary pr-card-action" type="button" @click="openRun(run)">Review payroll</button>
              </article>
            </div>
          </template>
        </section>

        <section class="pr-section" aria-labelledby="recent-approvals-heading">
          <div class="pr-section-head"><h2 id="recent-approvals-heading">Recently approved</h2></div>
          <div v-if="!approvedRuns.length" class="pr-panel pr-empty">No approved payrolls yet.</div>
          <template v-else>
            <div class="pr-panel pr-table-scroll pr-desktop-table">
              <table class="pr-table" aria-label="Recently approved payrolls">
                <thead><tr><th>Month</th><th>Employees</th><th>Net pay</th><th>Approved</th><th class="right">Action</th></tr></thead>
                <tbody>
                  <tr v-for="run in approvedRuns.slice(0,5)" :key="run.id">
                    <td class="pr-name">{{ payrollMonthName(run.year,run.month) }}</td><td>{{ run.employee_count }}</td><td>KES {{ money(run.net_total) }}</td><td>{{ formatDate(run.approved_at) }}</td>
                    <td class="right"><button class="pr-btn pr-btn-small" type="button" @click="openRun(run)">View</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="pr-mobile-list">
              <article v-for="run in approvedRuns.slice(0,5)" :key="run.id" class="pr-mobile-card">
                <div class="pr-card-head"><h3>{{ payrollMonthName(run.year,run.month) }}</h3><span class="pr-badge success">Approved</span></div>
                <dl class="pr-card-details">
                  <div><dt>Employees</dt><dd>{{ run.employee_count }}</dd></div><div><dt>Net pay</dt><dd>KES {{ money(run.net_total) }}</dd></div>
                  <div class="pr-card-full"><dt>Approved</dt><dd>{{ formatDate(run.approved_at) }}</dd></div>
                </dl>
                <button class="pr-btn pr-card-action" type="button" @click="openRun(run)">View payroll</button>
              </article>
            </div>
          </template>
        </section>
      </section>

      <section v-else-if="tab==='advances'" class="pr-section" aria-labelledby="advance-decisions-heading">
        <div class="pr-section-head"><h2 id="advance-decisions-heading">Salary advances</h2></div>
        <div v-if="!advances.length" class="pr-panel pr-empty">No salary advances recorded.</div>
        <template v-else>
          <div class="pr-panel pr-table-scroll pr-desktop-table">
            <table class="pr-table" aria-label="Salary advance decisions">
              <thead><tr><th>Employee</th><th>Payroll month</th><th>Amount</th><th>Reason</th><th>Status</th><th class="right">Actions</th></tr></thead>
              <tbody>
                <tr v-for="advance in sortedAdvances" :key="advance.id">
                  <td class="pr-name">{{ advance.employee_name }}</td><td>{{ payrollMonthName(advance.year,advance.month) }}</td><td class="pr-amount">KES {{ money(advance.amount) }}</td><td>{{ advance.reason }}</td>
                  <td><span class="pr-badge" :class="tone(advance.status)">{{ statusText(advance.status) }}</span></td>
                  <td class="right">
                    <div class="pr-inline-actions">
                      <button v-if="advance.status==='RECOMMENDED'" class="pr-btn pr-btn-primary" type="button" @click="openAdvanceDecision(advance,'approve')">Approve</button>
                      <button v-if="advance.status==='RECOMMENDED'" class="pr-btn pr-btn-small pr-btn-danger" type="button" @click="openAdvanceDecision(advance,'reject')">Reject</button>
                      <button v-if="advance.status==='APPROVED'" class="pr-btn pr-btn-small" type="button" @click="openAdvanceDecision(advance,'cancel')">Cancel approval</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="pr-mobile-list">
            <article v-for="advance in sortedAdvances" :key="advance.id" class="pr-mobile-card">
              <div class="pr-card-head pr-card-head-wrap"><h3>{{ advance.employee_name }}</h3><span class="pr-badge" :class="tone(advance.status)">{{ statusText(advance.status) }}</span></div>
              <dl class="pr-card-details">
                <div><dt>Payroll month</dt><dd>{{ payrollMonthName(advance.year,advance.month) }}</dd></div><div><dt>Amount</dt><dd>KES {{ money(advance.amount) }}</dd></div>
                <div class="pr-card-full"><dt>Reason</dt><dd>{{ advance.reason }}</dd></div>
              </dl>
              <div v-if="advance.status==='RECOMMENDED' || advance.status==='APPROVED'" class="pr-card-actions">
                <button v-if="advance.status==='RECOMMENDED'" class="pr-btn pr-btn-primary" type="button" @click="openAdvanceDecision(advance,'approve')">Approve</button>
                <button v-if="advance.status==='RECOMMENDED'" class="pr-btn pr-btn-danger" type="button" @click="openAdvanceDecision(advance,'reject')">Reject</button>
                <button v-if="advance.status==='APPROVED'" class="pr-btn" type="button" @click="openAdvanceDecision(advance,'cancel')">Cancel approval</button>
              </div>
            </article>
          </div>
        </template>
      </section>

      <section v-else class="pr-section-group">
        <section class="pr-section" aria-labelledby="payroll-records-heading">
          <div class="pr-section-head"><h2 id="payroll-records-heading">All payroll runs</h2></div>
          <div v-if="!runs.length" class="pr-panel pr-empty">No payroll runs yet.</div>
          <template v-else>
            <div class="pr-panel pr-table-scroll pr-desktop-table">
              <table class="pr-table" aria-label="Payroll history">
                <thead><tr><th>Month</th><th>Status</th><th>Gross earnings</th><th>Net pay</th><th class="right">Action</th></tr></thead>
                <tbody>
                  <tr v-for="run in sortedRuns" :key="run.id">
                    <td class="pr-name">{{ payrollMonthName(run.year,run.month) }}</td><td><span class="pr-badge" :class="tone(run.status)">{{ statusText(run.status) }}</span></td>
                    <td>KES {{ money(run.gross_total) }}</td><td class="pr-amount">KES {{ money(run.net_total) }}</td>
                    <td class="right"><button class="pr-btn pr-btn-small" type="button" @click="openRun(run)">Open</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="pr-mobile-list">
              <article v-for="run in sortedRuns" :key="run.id" class="pr-mobile-card">
                <div class="pr-card-head"><h3>{{ payrollMonthName(run.year,run.month) }}</h3><span class="pr-badge" :class="tone(run.status)">{{ statusText(run.status) }}</span></div>
                <dl class="pr-card-details"><div><dt>Gross earnings</dt><dd>KES {{ money(run.gross_total) }}</dd></div><div><dt>Net pay</dt><dd>KES {{ money(run.net_total) }}</dd></div></dl>
                <button class="pr-btn pr-card-action" type="button" @click="openRun(run)">Open payroll</button>
              </article>
            </div>
          </template>
        </section>

        <section v-if="reviewCash.length" class="pr-panel">
          <div class="pr-panel-head"><h2>Payment evidence to review</h2><span class="pr-badge warning">{{ reviewCash.length }}</span></div>
          <div class="pr-panel-body">
            <div v-for="event in reviewCash" :key="event.id" class="pr-item-row">
              <div><strong>{{ event.reference }} · KES {{ money(event.amount) }}</strong><div class="pr-small pr-muted">{{ event.review_reason || 'Unresolved receipt' }} · {{ event.method }}</div></div>
              <button class="pr-btn pr-btn-danger" type="button" @click="openDismiss(event)">Dismiss incorrect evidence</button>
            </div>
          </div>
        </section>

        <section class="pr-section" aria-labelledby="payroll-activity-heading">
          <div class="pr-section-head"><h2 id="payroll-activity-heading">Recent payroll activity</h2></div>
          <div v-if="!audit.length" class="pr-panel pr-empty">No payroll activity yet.</div>
          <template v-else>
            <div class="pr-panel pr-table-scroll pr-desktop-table">
              <table class="pr-table" aria-label="Payroll audit activity">
                <thead><tr><th>When</th><th>Event</th><th>Reason</th></tr></thead>
                <tbody><tr v-for="entry in audit" :key="entry.id"><td>{{ formatDate(entry.at) }}</td><td class="pr-name">{{ entry.action?.replaceAll('_',' ') }}</td><td>{{ entry.reason || '—' }}</td></tr></tbody>
              </table>
            </div>
            <div class="pr-mobile-list">
              <article v-for="entry in audit" :key="entry.id" class="pr-mobile-card">
                <h3 class="pr-name">{{ entry.action?.replaceAll('_',' ') }}</h3><p class="pr-description">{{ formatDate(entry.at) }}</p>
                <dl class="pr-card-details"><div class="pr-card-full"><dt>Reason</dt><dd>{{ entry.reason || '—' }}</dd></div></dl>
              </article>
            </div>
          </template>
        </section>
      </section>

      <div v-if="modal" class="pr-modal-scrim" @click.self="closeModal">
        <section class="pr-modal" :class="{ wide: modal==='run' }" role="dialog" aria-modal="true" :aria-label="modalTitle">
          <header class="pr-modal-head">
            <div>
              <h2>{{ modalTitle }}</h2>
              <p v-if="modal==='run' || (modal==='reason' && ['return','correction'].includes(reasonMode))">{{ payrollMonthName(selectedRun?.year,selectedRun?.month) }}</p>
              <p v-else-if="modal==='advance'">{{ selectedAdvance?.employee_name }}</p>
              <p v-else-if="reasonMode==='reverse'">{{ selectedPayment?.reference }}</p>
              <p v-else-if="reasonMode==='dismiss'">{{ selectedCash?.reference }}</p>
            </div>
            <button class="pr-close" type="button" @click="closeModal" aria-label="Close dialog">×</button>
          </header>
          <div v-if="modalError" class="pr-error pr-dialog-error" role="alert">{{ modalError }}</div>

          <div v-if="modal==='run'" class="pr-modal-body pr-stack">
            <div class="pr-breakdown-totals">
              <div class="pr-stat"><div class="pr-stat-label">Gross earnings</div><div class="pr-stat-value">KES {{ money(selectedRun?.gross_total) }}</div></div>
              <div class="pr-stat"><div class="pr-stat-label">Net pay</div><div class="pr-stat-value">KES {{ money(selectedRun?.net_total) }}</div></div>
            </div>
            <div v-if="selectedRun?.return_reason" class="pr-note warning">Returned for: {{ selectedRun.return_reason }}</div>

            <div v-if="review?.changes?.length" class="pr-panel">
              <div class="pr-panel-head"><h3>Changes to review</h3><span class="pr-badge warning">{{ review.changes.length }}</span></div>
              <div class="pr-panel-body">
                <div v-for="change in review.changes" :key="change.line_id" class="pr-item-row">
                  <div>
                    <strong>{{ change.employee }}</strong><div class="pr-small pr-muted">{{ changeFlags(change) }}</div>
                    <div v-for="item in change.statutory_overrides || []" :key="item.code" class="pr-small">{{ item.code }}: {{ money(item.calculated) }} → {{ money(item.effective) }} · {{ item.reason }}</div>
                  </div>
                </div>
              </div>
            </div>
            <div v-for="duplicate in review?.duplicate_mpesa_numbers || []" :key="duplicate.phone" class="pr-note warning">Shared payment phone {{ duplicate.phone }} · {{ duplicate.staff?.join(', ') }}</div>
            <div v-if="eligibilityIssues.length" class="pr-note warning" role="alert">
              <strong>Resolve before approval</strong>
              <ul class="pr-issue-list"><li v-for="(item,i) in eligibilityIssues" :key="i">{{ typeof item==='string' ? item : item.message || JSON.stringify(item) }}</li></ul>
            </div>

            <section class="pr-section" aria-labelledby="review-salaries-heading">
              <div class="pr-section-head"><h2 id="review-salaries-heading">Employee salaries <span class="pr-small pr-muted">(KES)</span></h2></div>
              <div class="pr-panel pr-table-scroll pr-desktop-table">
                <table class="pr-table" aria-label="Payroll salaries in KES">
                  <thead><tr><th>Employee</th><th>Gross earnings</th><th>Deductions</th><th>Advance recoveries</th><th>Net pay</th><th>Payment</th></tr></thead>
                  <tbody>
                    <tr v-for="line in selectedRun?.lines || []" :key="line.id">
                      <td><div class="pr-name">{{ line.snapshot_name }}</div><div class="pr-small pr-muted">{{ line.snapshot_position }}</div></td>
                      <td>{{ money(line.gross) }}</td><td>{{ money(line.deductions_total) }}</td><td>{{ money(line.advances_recovered) }}</td><td class="pr-amount">{{ money(line.net) }}</td>
                      <td>
                        <span class="pr-badge" :class="tone(line.settlement_status)">{{ line.settlement_status==='PAID' ? 'Paid' : line.settlement_status==='UNPAID' ? 'Awaiting payment' : statusText(line.settlement_status) }}</span>
                        <div v-if="line.payment" class="pr-small pr-muted">{{ line.payment.reference }}</div>
                        <button v-if="selectedRun.status==='APPROVED' && line.payment" class="pr-btn pr-btn-small" type="button" @click="openReverse(line.payment)">Correct payment record</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="pr-mobile-list">
                <article v-for="line in selectedRun?.lines || []" :key="line.id" class="pr-mobile-card">
                  <div class="pr-card-head pr-card-head-wrap">
                    <div><h3>{{ line.snapshot_name }}</h3><p class="pr-description">{{ line.snapshot_position }}</p></div>
                    <span class="pr-badge" :class="tone(line.settlement_status)">{{ line.settlement_status==='PAID' ? 'Paid' : line.settlement_status==='UNPAID' ? 'Awaiting payment' : statusText(line.settlement_status) }}</span>
                  </div>
                  <dl class="pr-card-details">
                    <div><dt>Gross earnings</dt><dd>KES {{ money(line.gross) }}</dd></div><div><dt>Deductions</dt><dd>KES {{ money(line.deductions_total) }}</dd></div>
                    <div><dt>Advance recoveries</dt><dd>KES {{ money(line.advances_recovered) }}</dd></div><div><dt>Net pay</dt><dd>KES {{ money(line.net) }}</dd></div>
                    <div v-if="line.payment" class="pr-card-full"><dt>Payment reference</dt><dd>{{ line.payment.reference }}</dd></div>
                  </dl>
                  <button v-if="selectedRun.status==='APPROVED' && line.payment" class="pr-btn pr-card-action" type="button" @click="openReverse(line.payment)">Correct payment record</button>
                </article>
              </div>
            </section>

            <div class="pr-note">{{ selectedRun?.status==='APPROVED' ? 'Approved figures are locked. Add a note to record a correction.' : 'Approval locks salary figures permanently.' }}</div>
            <div v-if="selectedRun?.status==='SUBMITTED'" class="pr-collapse pr-breakdown-actions">
              <button class="pr-btn pr-btn-primary" type="button" :disabled="busy||eligibilityIssues.length>0" @click="approveSelected">Approve payroll</button>
              <button class="pr-btn pr-btn-danger" type="button" @click="openReason('return')">Return for correction</button>
            </div>
            <button v-if="selectedRun?.status==='APPROVED'" class="pr-btn" type="button" @click="openReason('correction')">Add correction note</button>
          </div>

          <form v-else-if="modal==='reason'" @submit.prevent="saveReason">
            <div class="pr-modal-body pr-stack">
              <div class="pr-note">{{ reasonMode==='return' ? 'The bursar can correct and resubmit this payroll.' : reasonMode==='correction' ? 'Add a note. Approved amounts stay unchanged.' : reasonMode==='reverse' ? 'Correct the payment record only. This does not reverse a bank or M-Pesa transfer.' : 'Dismiss only evidence confirmed to be incorrect or duplicated.' }}</div>
              <label class="pr-label">Reason (minimum 8 characters)<textarea class="pr-textarea" minlength="8" v-model.trim="reason" rows="3" required /></label>
            </div>
            <footer class="pr-modal-foot"><button type="button" class="pr-btn" @click="closeModal">Cancel</button><button type="submit" class="pr-btn" :class="['reverse','dismiss','return'].includes(reasonMode) ? 'pr-btn-danger' : 'pr-btn-primary'" :disabled="busy">Confirm decision</button></footer>
          </form>

          <form v-else-if="modal==='advance'" @submit.prevent="saveAdvanceDecision">
            <div class="pr-modal-body pr-stack">
              <div class="pr-summary-row"><span>Advance amount</span><strong>KES {{ money(selectedAdvance?.amount) }}</strong></div>
              <div class="pr-summary-row"><span>Payroll month</span><strong>{{ payrollMonthName(selectedAdvance?.year,selectedAdvance?.month) }}</strong></div>
              <div v-if="selectedAdvance?.reason" class="pr-note">{{ selectedAdvance.reason }}</div>
              <label class="pr-label">{{ advanceAction==='cancel' ? 'Cancellation reason' : 'Decision note (optional)' }}<textarea class="pr-textarea" v-model.trim="advanceNote" rows="3" :required="advanceAction==='cancel'" :minlength="advanceAction==='cancel' ? 8 : undefined" /></label>
            </div>
            <footer class="pr-modal-foot"><button class="pr-btn" type="button" @click="closeModal">Cancel</button><button class="pr-btn" :class="advanceAction==='approve' ? 'pr-btn-primary' : 'pr-btn-danger'" type="submit" :disabled="busy">{{ advanceAction==='approve' ? 'Approve request' : advanceAction==='reject' ? 'Reject request' : 'Cancel approval' }}</button></footer>
          </form>
          <footer v-else class="pr-modal-foot"><button class="pr-btn" type="button" @click="closeModal">Close</button></footer>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import {computed,onMounted,ref} from 'vue'
import {
  asRows,money,payrollMonthName,getErrorMessage,getPayrollRuns,getPayrollRun,
  getPayrollReview,getPayrollEligibility,getPayrollAdvances,getPayrollProfiles,getPayrollCashEvents,getPayrollAudit,
  approvePayrollRun,returnPayrollRun,addPayrollCorrectionNote,
  approvePayrollAdvance,rejectPayrollAdvance,cancelPayrollAdvance,
  reversePayrollSalaryRecording,dismissPayrollCashEvent,
} from '../../../api/payroll'
import '../../../styles/payroll.css'
const tabs=[{key:'runs',label:'To approve'},{key:'advances',label:'Salary advances'},{key:'history',label:'History & records'}]
const tab=ref('runs'),runs=ref([]),advances=ref([]),profiles=ref([]),cashEvents=ref([]),audit=ref([])
const loading=ref(false),busy=ref(false),error=ref(''),notice=ref(''),modalError=ref('')
const modal=ref(''),selectedRun=ref(null),selectedAdvance=ref(null),selectedPayment=ref(null),selectedCash=ref(null)
const review=ref(null),eligibilityIssues=ref([]),reasonMode=ref(''),reason=ref(''),advanceAction=ref(''),advanceNote=ref('')
const sortedRuns=computed(()=>[...runs.value].sort((a,b)=>(b.year-a.year)||(b.month-a.month)))
const awaitingRuns=computed(()=>sortedRuns.value.filter(r=>r.status==='SUBMITTED'))
const approvedRuns=computed(()=>sortedRuns.value.filter(r=>r.status==='APPROVED'))
const sortedAdvances=computed(()=>[...advances.value].sort((a,b)=>Number(b.id)-Number(a.id)))
const awaitingAdvances=computed(()=>advances.value.filter(a=>a.status==='RECOMMENDED'))
const reviewCash=computed(()=>cashEvents.value.filter(c=>c.state==='REVIEW'))
const tone=(s)=>['APPROVED','PAID','NO_PAYMENT_DUE'].includes(s)?'success':['SUBMITTED','RECOMMENDED','DRAFT','UNPAID'].includes(s)?'warning':['REJECTED','DECLINED','REVIEW','REVERSED','CANCELLED'].includes(s)?'danger':'blue'
const statusText=(s)=>({PAID:'Disbursed',RECOMMENDED:'Recommended',NO_PAYMENT_DUE:'No payment due'}[s]||s)
const modalTitle=computed(()=>modal.value==='run'?'Review payroll':modal.value==='advance'?'Salary advance decision':({return:'Return payroll',correction:'Payroll correction note',reverse:'Correct recorded salary payment',dismiss:'Dismiss unverified evidence'})[reasonMode.value]||'Payroll decision')
const formatDate=(d)=>d?new Date(d).toLocaleDateString('en-KE',{year:'numeric',month:'short',day:'numeric'}):'—'
const changeFlags=(c)=>[c.new_staff&&'New employee',c.salary_changed&&'Salary changed',c.phone_changed&&'Phone changed',c.other_changes&&'Other structure changed',c.statutory_overrides?.length&&'Statutory override',Object.keys(c.tax_changes||{}).length&&'Tax settings changed'].filter(Boolean).join(' · ')||'Review changes'
function closeModal(){if(!busy.value){modal.value='';modalError.value=''}}
async function refresh(){loading.value=true;error.value='';try{const [r,a,p,c,au]=await Promise.all([getPayrollRuns(),getPayrollAdvances(),getPayrollProfiles(),getPayrollCashEvents(),getPayrollAudit({limit:20})]);runs.value=asRows(r);advances.value=asRows(a);profiles.value=asRows(p);cashEvents.value=asRows(c);audit.value=asRows(au)}catch(e){error.value=getErrorMessage(e)}finally{loading.value=false}}
async function openRun(run){modalError.value='';try{const [r,rv,eg]=await Promise.all([getPayrollRun(run.id),getPayrollReview(run.id),getPayrollEligibility(run.id)]);selectedRun.value=r;review.value=rv;eligibilityIssues.value=eg.issues||[];modal.value='run'}catch(e){error.value=getErrorMessage(e)}}
async function approveSelected(){if(!window.confirm('Approve and permanently lock this payroll? No salary amount can be edited afterward.'))return;busy.value=true;modalError.value='';try{await approvePayrollRun(selectedRun.value.id,selectedRun.value.fingerprint);modal.value='';notice.value='Payroll approved and locked.';await refresh()}catch(e){modalError.value=getErrorMessage(e)}finally{busy.value=false}}
function openReason(mode){reasonMode.value=mode;reason.value='';modalError.value='';modal.value='reason'}
function openReverse(payment){selectedPayment.value=payment;openReason('reverse')}
function openDismiss(cash){selectedCash.value=cash;openReason('dismiss')}
async function saveReason(){busy.value=true;modalError.value='';try{if(reasonMode.value==='return')await returnPayrollRun(selectedRun.value.id,reason.value);else if(reasonMode.value==='correction')await addPayrollCorrectionNote(selectedRun.value.id,reason.value);else if(reasonMode.value==='reverse')await reversePayrollSalaryRecording(selectedPayment.value.id,reason.value);else if(reasonMode.value==='dismiss')await dismissPayrollCashEvent(selectedCash.value.id,reason.value);modal.value='';notice.value='Decision recorded with an audit trail.';await refresh()}catch(e){modalError.value=getErrorMessage(e)}finally{busy.value=false}}
function openAdvanceDecision(advance,action){selectedAdvance.value=advance;advanceAction.value=action;advanceNote.value='';modalError.value='';modal.value='advance'}
async function saveAdvanceDecision(){busy.value=true;modalError.value='';try{if(advanceAction.value==='approve')await approvePayrollAdvance(selectedAdvance.value.id,advanceNote.value);else if(advanceAction.value==='reject')await rejectPayrollAdvance(selectedAdvance.value.id,advanceNote.value);else await cancelPayrollAdvance(selectedAdvance.value.id,advanceNote.value);modal.value='';notice.value='Advance decision recorded.';await refresh()}catch(e){modalError.value=getErrorMessage(e)}finally{busy.value=false}}
onMounted(refresh)
</script>

<style scoped src="../../../styles/portal-payroll.css"></style>
