<template>
    <div class="dashboard-card">
      <div class="card-header">
        <h3 class="card-title">Fee Overview</h3>

        <select
          v-if="terms.length"
          v-model="selectedTerm"
          class="term-select"
        >
          <option
            v-for="term in terms"
            :key="term.id"
            :value="String(term.id)"
          >
            {{ term.name }}, {{ term.academic_year_name }}
          </option>
        </select>
      </div>

      
      <div v-if="loading" class="loading-placeholder">
        <p>Loading financial data...</p>
      </div>
  
      
      <div v-if="error" class="error-message">
        <p>{{ error }}</p>
      </div>
  
      
      <div v-if="data" class="card-content">

        <!-- TOTALS (unchanged from before — same numbers a parent already knows) -->
        <div class="info-item">
          <p class="label">Total Fees Billed</p>
          <p class="value text-blue">{{ formatAmount(data.total_billed) }}</p>
        </div>
        <div class="info-item">
          <p class="label">Total Paid</p>
          <p class="value text-green">{{ formatAmount(data.total_paid) }}</p>
        </div>
        <div class="info-item">
          <p class="label">Outstanding Balance</p>
          <p class="value text-red">{{ formatAmount(data.balance) }}</p>
        </div>
        <div v-if="overpayment > 0" class="info-item">
          <p class="label">Overpayment</p>
          <p class="value text-yellow">{{ formatAmount(overpayment) }}</p>
        </div>

        <!-- BREAKDOWN (secondary, smaller, clearly labeled — the "why" behind the totals above) -->
        <div class="breakdown">
          <div class="breakdown-group">
            <p class="breakdown-title">School Fees</p>
            <div class="breakdown-row">
              <span>Billed</span>
              <span>{{ formatAmount(data.school_fees_billed) }}</span>
            </div>
            <div class="breakdown-row">
              <span>Paid</span>
              <span>{{ formatAmount(data.school_fees_paid) }}</span>
            </div>
            <div class="breakdown-row">
              <span>Balance</span>
              <span>{{ formatAmount(data.school_fees_balance) }}</span>
            </div>
          </div>

          <div class="breakdown-group">
            <p class="breakdown-title">Transport</p>
            <div class="breakdown-row">
              <span>Billed</span>
              <span>{{ formatAmount(data.transport_billed) }}</span>
            </div>
            <div class="breakdown-row">
              <span>Paid</span>
              <span>{{ formatAmount(data.transport_paid) }}</span>
            </div>
            <div class="breakdown-row">
              <span>Balance</span>
              <span>{{ formatAmount(data.transport_balance) }}</span>
            </div>
          </div>
        </div>

        <div class="card-actions">
          <button class="pay-now-btn" @click="goToOnlinePayment">
            Pay With Mpesa Now
          </button>
        </div>

      </div>
       <div v-else-if="!loading && !error" class="no-data">
        <p>No financial data available for this student.</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch, toRefs, onMounted } from "vue";
  import { useRouter } from "vue-router";
  import { getStudentFinanceDetails } from "../../api/Finance";
  import { fetchTerms } from "../../api/terms.js";
  
  const router = useRouter();
  
  const props = defineProps({
    studentId: {
      type: String,
      required: true,
    },
  });
  
  const { studentId } = toRefs(props);
  
  
  const data = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const terms = ref([]);
  const selectedTerm = ref('');
  // Distinguishes "we set selectedTerm ourselves after learning the
  // backend's current term" from "the parent picked a term" — avoids a
  // redundant extra fetch right after the first one.
  let syncingTerm = false;

  const loadTerms = async () => {
    try {
      const response = await fetchTerms();
      terms.value = Array.isArray(response) ? response : response?.results || [];
    } catch (err) {
      console.error('Failed loading terms:', err);
    }
  };
  
  
  const fetchFinance = async (id) => {
    if (!id) {
        data.value = null;
        return
    };
    loading.value = true;
    error.value = null;
    try {
      const res = await getStudentFinanceDetails(id, selectedTerm.value || undefined);
      data.value = res.data;

      if (!selectedTerm.value && data.value?.term?.id) {
        syncingTerm = true;
        selectedTerm.value = String(data.value.term.id);
      }
    } catch (err) {
      console.error('Error fetching finance details:', err);
      error.value = "Failed to load financial data.";
    } finally {
      loading.value = false;
    }
  };
  
  
  watch(
    studentId,
    (newId) => {
      fetchFinance(newId);
    },
    { immediate: true } 
  );

  watch(selectedTerm, (newVal, oldVal) => {
    if (syncingTerm) {
      syncingTerm = false;
      return;
    }
    if (newVal && newVal !== oldVal) {
      fetchFinance(studentId.value);
    }
  });

  onMounted(() => {
    loadTerms();
  });
  
  
  const overpayment = computed(() => {
    if (!data.value || !data.value.balance) return 0;
    const bal = parseFloat(data.value.balance);
    return bal < 0 ? Math.abs(bal) : 0;
  });
  
  
  const formatAmount = (amount) => {
      if(amount === null || amount === undefined) return "Ksh 0.00";
      return `Ksh ${Number(amount).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  const goToOnlinePayment = () => {
    router.push({ name: 'ParentOnlinePayment' });
  };
  </script>
  
  <style scoped>
  .dashboard-card {
    background-color: #fff;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s ease-in-out;
  }
  
  .dashboard-card:hover {
    transform: translateY(-4px);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-bottom: 1.5rem;
  }
  
  .card-title {
    font-size: 1.25rem;
    font-weight: bold;
    margin-bottom: 0;
    color: #333;
  }

  .term-select {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 0.35rem 0.6rem;
    font-size: 0.85rem;
    color: #374151;
    background: #fff;
  }
  
  .card-content {
    display: grid;
    gap: 1rem;
  }
  
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .info-item:last-child {
      border-bottom: none;
  }
  
  .label {
    color: #666;
    font-size: 0.9rem;
  }
  
  .value {
    font-weight: bold;
    font-size: 1.1rem;
  }
  
  .text-blue { color: #3b82f6; }
  .text-green { color: #10b981; }
  .text-red { color: #ef4444; }
  .text-yellow { color: #f59e0b; }
  
  .loading-placeholder, .error-message, .no-data {
    text-align: center;
    padding: 2rem;
    color: #777;
  }

  .breakdown {
    margin-top: 0.5rem;
    padding-top: 1rem;
    border-top: 1px dashed #e5e7eb;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  @media (max-width: 420px) {
    .breakdown {
      grid-template-columns: 1fr;
    }
  }

  .breakdown-group {
    background: #fafafa;
    border-radius: 8px;
    padding: 0.75rem;
  }

  .breakdown-title {
    font-size: 0.8rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    margin-bottom: 0.5rem;
  }

  .breakdown-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    color: #4b5563;
    padding: 0.2rem 0;
  }

  .card-actions {
    margin-top: 1rem;
  }

  .pay-now-btn {
    width: 100%;
    background: linear-gradient(135deg, #1db954, #14a44d);
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 0.85rem 1rem;
    font-size: 0.98rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 6px 16px rgba(29, 185, 84, 0.25);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .pay-now-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(29, 185, 84, 0.35);
  }
  </style>
  
