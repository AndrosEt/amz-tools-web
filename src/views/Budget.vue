<template>
  <div class="budget-page">
    <el-page-header @back="$router.push('/')" title="Budget Management" />
    
    <div class="content">
      <h2>Budget Remaining Chart</h2>
      
      <BudgetChart :chart-data="chartData" />
      
      <div class="control-buttons">
        <el-button-group>
          <el-button @click="addDay">+ Add Day</el-button>
          <el-button @click="removeDay" :disabled="days <= 1">- Remove Day</el-button>
          <el-button @click="resetDays">Reset to 1 Day</el-button>
        </el-button-group>
        <span class="days-display">
          Showing data for the last {{ days }} day{{ days > 1 ? 's' : '' }}
          <template v-if="totalSpend">
            | Total Spend: ${{ totalSpend.toFixed(2) }}
          </template>
        </span>
      </div>

      <div class="portfolio-groups">
        <el-card v-for="(portfolio, id) in portfolioData" 
                :key="id" 
                class="portfolio-group">
          <template #header>
            <h3>Portfolio Name: {{ portfolio.name }}</h3>
          </template>
          
          <el-table :data="portfolio.items" 
                    stripe 
                    border 
                    style="width: 100%">
            <el-table-column prop="budget" 
                           label="Budget ($)" 
                           :formatter="(row) => row.budget.toLocaleString()" />
            <el-table-column prop="startDate" 
                           label="Start Date" />
            <el-table-column prop="budgetUsagePercent" 
                           label="Budget Usage %" 
                           :formatter="(row) => row.budgetUsagePercent.toFixed(2) + '%'" />
            <el-table-column label="Real Spend ($)"
                           :formatter="(row) => '$' + (row.budget * (row.budgetUsagePercent / 100)).toFixed(2)" />
            <el-table-column prop="usageUpdatedTimestamp" 
                           label="Last Updated"
                           :formatter="(row) => new Date(row.usageUpdatedTimestamp).toLocaleString()" />
          </el-table>
        </el-card>
      </div>
    </div>

    <Loading :visible="loading" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import BudgetChart from '../components/charts/BudgetChart.vue'
import Loading from '../components/common/Loading.vue'
import { useBudgetStore } from '../stores/budget'

const store = useBudgetStore()
const days = ref(1)
const loading = ref(false)

const chartData = computed(() => store.chartData)
const portfolioData = computed(() => store.portfolioData)
const totalSpend = computed(() => store.totalSpend)

const fetchData = async () => {
  loading.value = true
  try {
    await store.fetchBudgetData(days.value)
  } finally {
    loading.value = false
  }
}

const addDay = () => {
  days.value++
  fetchData()
}

const removeDay = () => {
  if (days.value > 1) {
    days.value--
    fetchData()
  }
}

const resetDays = () => {
  days.value = 1
  fetchData()
}

fetchData()
</script>

<style scoped lang="scss">
.budget-page {
  padding: 1rem;

  .content {
    margin-top: 2rem;
  }

  .control-buttons {
    margin: 2rem 0;
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;

    .days-display {
      color: #666;
    }
  }

  .portfolio-groups {
    display: grid;
    gap: 2rem;
    
    @media (min-width: 1200px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .portfolio-group {
    h3 {
      margin: 0;
    }
  }

  @media (max-width: 768px) {
    .control-buttons {
      flex-direction: column;
      align-items: stretch;
      
      .el-button-group {
        display: flex;
        
        .el-button {
          flex: 1;
        }
      }
    }
  }
}
</style> 