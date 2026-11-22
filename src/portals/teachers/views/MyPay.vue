<template>
  <div class="min-h-screen bg-gray-50 p-4 md:p-6">
    <main class="qr-payroll pr-detail-page mx-auto max-w-7xl">
      <header class="pr-top">
        <h1>My pay</h1>
        <div class="pr-actions">
          <button class="pr-btn" type="button" :disabled="loading" @click="refresh">Refresh</button>
          <button class="pr-btn pr-btn-primary" type="button" @click="openRequest">Request advance</button>
        </div>
      </header>

      <div v-if="error" class="pr-error" role="alert">{{ error }}</div>
      <div v-if="notice" class="pr-success" role="status">{{ notice }}</div>
      <div v-if="loading && !pay.length" class="pr-panel pr-empty">Loading your pay information…</div>

      <template v-else>
        <div class="pr-stat-grid">
          <div class="pr-stat">
            <div class="pr-stat-label">Latest net pay</div><div class="pr-stat-value">{{ latest ? 'KES ' + money(latest.net) : '—' }}</div>
            <div class="pr-stat-note">{{ latest ? payrollMonthName(latest.year,latest.month) : 'No approved payroll yet' }}</div>
          </div>
          <div class="pr-stat"><div class="pr-stat-label">Gross earnings</div><div class="pr-stat-value">{{ latest ? 'KES ' + money(latest.gross) : '—' }}</div></div>
          <div class="pr-stat"><div class="pr-stat-label">Deductions</div><div class="pr-stat-value">{{ latest ? 'KES ' + money(latest.deductions_total) : '—' }}</div></div>
          <div class="pr-stat"><div class="pr-stat-label">Advance recoveries</div><div class="pr-stat-value">{{ latest ? 'KES ' + money(latest.advances_recovered) : '—' }}</div></div>
        </div>

        <div class="pr-tabs" role="tablist" aria-label="My pay tabs">
          <button class="pr-tab" type="button" role="tab" :aria-selected="tab==='payslips'" :class="{ active: tab==='payslips' }" @click="tab='payslips'">Payslips</button>
          <button class="pr-tab" type="button" role="tab" :aria-selected="tab==='advances'" :class="{ active: tab==='advances' }" @click="tab='advances'">Salary advances</button>
        </div>

        <section v-if="tab==='payslips'" class="pr-section" aria-labelledby="approved-payslips-heading">
          <div class="pr-section-head"><h2 id="approved-payslips-heading">Approved payslips</h2></div>
          <div v-if="!pay.length" class="pr-panel pr-empty">No approved payslips yet.</div>
          <template v-else>
            <div class="pr-panel pr-table-scroll pr-desktop-table">
              <table class="pr-table" aria-label="Approved payslips">
                <thead><tr><th>Month</th><th>Gross earnings</th><th>Deductions</th><th>Advance recoveries</th><th>Net pay</th><th>Payment</th><th class="right">Actions</th></tr></thead>
                <tbody>
                  <tr v-for="line in pay" :key="line.id">
                    <td class="pr-name">{{ payrollMonthName(line.year,line.month) }}</td><td>KES {{ money(line.gross) }}</td>
                    <td>KES {{ money(line.deductions_total) }}</td><td>KES {{ money(line.advances_recovered) }}</td><td class="pr-amount">KES {{ money(line.net) }}</td>
                    <td><span class="pr-badge" :class="tone(line.settlement_status)">{{ statusText(line.settlement_status) }}</span></td>
                    <td class="right"><div class="pr-inline-actions"><button class="pr-btn pr-btn-small" type="button" @click="openPayslip(line)">View</button><button class="pr-btn pr-btn-small" type="button" :disabled="downloading===line.id" @click="download(line)">PDF</button></div></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="pr-mobile-list">
              <article v-for="line in pay" :key="line.id" class="pr-mobile-card">
                <div class="pr-card-head pr-card-head-wrap"><h3>{{ payrollMonthName(line.year,line.month) }}</h3><span class="pr-badge" :class="tone(line.settlement_status)">{{ statusText(line.settlement_status) }}</span></div>
                <dl class="pr-card-details">
                  <div><dt>Gross earnings</dt><dd>KES {{ money(line.gross) }}</dd></div><div><dt>Deductions</dt><dd>KES {{ money(line.deductions_total) }}</dd></div>
                  <div><dt>Advance recoveries</dt><dd>KES {{ money(line.advances_recovered) }}</dd></div><div><dt>Net pay</dt><dd>KES {{ money(line.net) }}</dd></div>
                </dl>
                <div class="pr-card-actions">
                  <button class="pr-btn" type="button" @click="openPayslip(line)">View payslip</button>
                  <button class="pr-btn" type="button" :disabled="downloading===line.id" @click="download(line)">Download PDF</button>
                </div>
              </article>
            </div>
          </template>
        </section>

        <section v-else class="pr-section" aria-labelledby="my-advances-heading">
          <div class="pr-panel pr-panel-head"><h2 id="my-advances-heading">My advances</h2><button class="pr-btn pr-btn-primary" type="button" @click="openRequest">Request advance</button></div>
          <div v-if="!advances.length" class="pr-panel pr-empty">No advance requests yet.</div>
          <template v-else>
            <div class="pr-panel pr-table-scroll pr-desktop-table">
              <table class="pr-table" aria-label="My salary advances">
                <thead><tr><th>Requested</th><th>Payroll month</th><th>Amount</th><th>Reason</th><th>Status</th></tr></thead>
                <tbody>
                  <tr v-for="advance in advances" :key="advance.id">
                    <td>{{ date(advance.created_at) }}</td><td class="pr-name">{{ payrollMonthName(advance.year,advance.month) }}</td><td class="pr-amount">KES {{ money(advance.amount) }}</td><td>{{ advance.reason }}</td>
                    <td><span class="pr-badge" :class="tone(advance.status)">{{ statusText(advance.status) }}</span><div v-if="advance.decision_note" class="pr-description">{{ advance.decision_note }}</div></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="pr-mobile-list">
              <article v-for="advance in advances" :key="advance.id" class="pr-mobile-card">
                <div class="pr-card-head pr-card-head-wrap"><h3>{{ payrollMonthName(advance.year,advance.month) }}</h3><span class="pr-badge" :class="tone(advance.status)">{{ statusText(advance.status) }}</span></div>
                <dl class="pr-card-details">
                  <div><dt>Requested</dt><dd>{{ date(advance.created_at) }}</dd></div><div><dt>Amount</dt><dd>KES {{ money(advance.amount) }}</dd></div>
                  <div class="pr-card-full"><dt>Reason</dt><dd>{{ advance.reason }}</dd></div>
                  <div v-if="advance.decision_note" class="pr-card-full"><dt>Decision note</dt><dd>{{ advance.decision_note }}</dd></div>
                </dl>
              </article>
            </div>
          </template>

          <details class="pr-panel pr-guide">
            <summary><span>How salary advances work</span><ChevronDownIcon class="pr-guide-chevron" aria-hidden="true" /></summary>
            <ol class="pr-guide-steps pr-advance-guide">
              <li><strong>1. Request</strong><p>Request an amount for the current payroll month.</p></li>
              <li><strong>2. Review</strong><p>The bursar reviews your request; the principal approves it.</p></li>
              <li><strong>3. Payment</strong><p>Once disbursed, the advance is recovered from that month's salary.</p></li>
            </ol>
          </details>
        </section>
      </template>

      <div v-if="modal" class="pr-modal-scrim" @click.self="closeModal">
        <section class="pr-modal" role="dialog" aria-modal="true" :aria-label="modal==='request' ? 'Request salary advance' : 'Payslip details'">
          <header class="pr-modal-head">
            <div><h2>{{ modal==='request' ? 'Request salary advance' : 'Payslip details' }}</h2><p v-if="modal==='payslip'">{{ payrollMonthName(selected?.year,selected?.month) }}</p></div>
            <button class="pr-close" type="button" @click="closeModal" aria-label="Close dialog">×</button>
          </header>
          <div v-if="modalError" class="pr-error pr-dialog-error" role="alert">{{ modalError }}</div>

          <form v-if="modal==='request'" @submit.prevent="requestAdvance">
            <div class="pr-modal-body pr-stack">
              <div class="pr-note">The bursar reviews your request; the principal approves it. Approval does not confirm payment.</div>
              <div class="pr-fields">
                <label class="pr-label">Payroll month<input class="pr-input" :value="payrollMonthName(requestPeriod.year,requestPeriod.month)" disabled /></label>
                <label class="pr-label">Amount (KES)<input class="pr-input" type="number" min="0.01" step="0.01" v-model="requestForm.amount" required /></label>
              </div>
              <label class="pr-label">Reason for request<textarea class="pr-textarea" v-model.trim="requestForm.reason" rows="3" required placeholder="Explain your request" /></label>
            </div>
            <footer class="pr-modal-foot"><button type="button" class="pr-btn" @click="closeModal">Cancel</button><button class="pr-btn pr-btn-primary" type="submit" :disabled="busy">{{ busy ? 'Submitting…' : 'Submit request' }}</button></footer>
          </form>

          <div v-else class="pr-modal-body pr-stack">
            <div class="pr-summary-row"><strong>{{ selected?.snapshot_name }}</strong><span>{{ selected?.snapshot_position }}</span></div>
            <div class="pr-panel">
              <div class="pr-panel-head"><h3>Earnings</h3></div>
              <div class="pr-panel-body">
                <div class="pr-summary-row"><span>Basic salary</span><strong>KES {{ money(selected?.basic_salary) }}</strong></div>
                <div v-for="item in selected?.earnings || []" :key="item.id" class="pr-summary-row"><span>{{ item.label }}</span><strong>KES {{ money(item.amount) }}</strong></div>
                <hr class="pr-divider" />
                <div class="pr-summary-row"><strong>Gross earnings</strong><strong>KES {{ money(selected?.gross) }}</strong></div>
              </div>
            </div>
            <div class="pr-panel">
              <div class="pr-panel-head"><h3>Deductions and advances</h3></div>
              <div class="pr-panel-body">
                <div v-for="item in selected?.deductions || []" :key="item.id" class="pr-summary-row"><span>{{ item.label || item.code }}</span><strong>KES {{ money(item.amount) }}</strong></div>
                <div class="pr-summary-row"><span>Advance recoveries</span><strong>KES {{ money(selected?.advances_recovered) }}</strong></div>
                <hr class="pr-divider" />
                <div class="pr-summary-row"><strong>Net pay</strong><strong>KES {{ money(selected?.net) }}</strong></div>
              </div>
            </div>
            <div class="pr-panel pr-panel-body">
              <div class="pr-summary-row"><span>Payment status</span><span class="pr-badge pr-wrap-badge" :class="tone(selected?.settlement_status)">{{ statusText(selected?.settlement_status) }}</span></div>
              <p v-if="selected?.payment" class="pr-description pr-wrap-text">Reference: {{ selected.payment.reference }}</p>
            </div>
            <button class="pr-btn pr-btn-primary" type="button" :disabled="downloading===selected?.id" @click="download(selected)">Download payslip PDF</button>
          </div>
          <footer v-if="modal==='payslip'" class="pr-modal-foot"><button class="pr-btn" type="button" @click="closeModal">Close</button></footer>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import {computed,onMounted,ref} from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'
import {asRows,money,payrollMonthName,kenyaMonth,getErrorMessage,getMyPayroll,getPayrollAdvances,createTeacherAdvance,downloadPayslip,saveBlob} from '../../../api/payroll'
import '../../../styles/payroll.css'
const pay=ref([]),advances=ref([]),tab=ref('payslips'),loading=ref(false),busy=ref(false),downloading=ref(null)
const error=ref(''),notice=ref(''),modalError=ref(''),modal=ref(''),selected=ref(null)
const requestPeriod=ref(kenyaMonth()),requestForm=ref({amount:'',reason:''})
const latest=computed(()=>pay.value[0]||null)
const tone=(s)=>['PAID','NO_PAYMENT_DUE','APPROVED'].includes(s)?'success':['SUBMITTED','RECOMMENDED','UNPAID','PENDING'].includes(s)?'warning':['DECLINED','REJECTED','REVERSED','CANCELLED'].includes(s)?'danger':'blue'
const statusText=(s)=>({NO_PAYMENT_DUE:'No payment due',PAID:'Paid',UNPAID:'Awaiting payment',SUBMITTED:'With bursar',RECOMMENDED:'With principal',APPROVED:'Approved, awaiting disbursement',DECLINED:'Declined',REJECTED:'Rejected',CANCELLED:'Cancelled'}[s]||s||'Pending')
const date=(d)=>d?new Date(d).toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric'}):'—'
async function refresh(){loading.value=true;error.value='';try{const [p,a]=await Promise.all([getMyPayroll(),getPayrollAdvances()]);pay.value=asRows(p).sort((a,b)=>(b.year-a.year)||(b.month-a.month));advances.value=asRows(a).sort((a,b)=>b.id-a.id)}catch(e){error.value=getErrorMessage(e)}finally{loading.value=false}}
function openRequest(){requestPeriod.value=kenyaMonth();requestForm.value={amount:'',reason:''};modalError.value='';modal.value='request'}
function openPayslip(line){selected.value=line;modalError.value='';modal.value='payslip'}
function closeModal(){if(!busy.value)modal.value=''}
async function requestAdvance(){busy.value=true;modalError.value='';try{await createTeacherAdvance({...requestPeriod.value,amount:requestForm.value.amount,reason:requestForm.value.reason});modal.value='';tab.value='advances';notice.value='Advance request submitted to the bursar.';await refresh()}catch(e){modalError.value=getErrorMessage(e)}finally{busy.value=false}}
async function download(line){downloading.value=line.id;error.value='';try{const r=await downloadPayslip(line.id);saveBlob(r,`payslip-${line.year}-${String(line.month).padStart(2,'0')}.pdf`)}catch(e){error.value=getErrorMessage(e)}finally{downloading.value=null}}
onMounted(refresh)
</script>

<style scoped src="../../../styles/portal-payroll.css"></style>
