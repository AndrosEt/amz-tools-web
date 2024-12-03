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
                    style="width: 100%" 
                    class="data-table">
            <el-table-column prop="budget" 
                           label="Budget " 
                           :formatter="(row) => row.budget.toLocaleString()" />
            <el-table-column prop="startDate" 
                           label="Start" />
            <el-table-column prop="budgetUsagePercent" 
                           label="Usage %" 
                           :formatter="(row) => row.budgetUsagePercent.toFixed(2) + '%'" />
            <el-table-column label="Spend ($)"
                           :formatter="(row) => '$' + (row.budget * (row.budgetUsagePercent / 100)).toFixed(2)" />
            <el-table-column prop="usageUpdatedTimestamp" 
                           label="Updated"
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

  .data-table {
    width: 100%;
    overflow-x: auto;
    
    :deep(.el-table) {
      --el-table-header-padding: 8px 0;
      --el-table-padding: 6px 0;
      
      .el-table__header-wrapper,
      .el-table__body-wrapper {
        th.el-table__cell,
        td.el-table__cell {
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          padding-left: 8px;
          padding-right: 8px;
        }
      }

      .el-table__cell {
        &:nth-child(1) { min-width: 50px; }  // Budget
        &:nth-child(2) { min-width: 90px; }  // Start Date 
        &:nth-child(3) { min-width: 90px; }  // Budget Usage
        &:nth-child(4) { min-width: 80px; }  // Real Spend
        &:nth-child(5) { min-width: 140px; } // Last Updated
      }
    }

    :deep(.el-table__header-wrapper th.el-table__cell),
    :deep(.el-table__body-wrapper td.el-table__cell) {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  @media (max-width: 768px) {
    .data-table {
      :deep(.el-table__header-wrapper) {
        th.el-table__cell {
          .cell {
            font-size: 10px;
            color: black;
          }
        }
      }
      
      :deep(.el-table__header),
      :deep(.el-table__body) {
        width: 100% !important;
        table {
          width: 100% !important;
        }
      }

      :deep(colgroup) {
        col {
          &:nth-child(1) { width: 50px !important; }
          &:nth-child(2) { width: 90px !important; }
          &:nth-child(3) { width: 60px !important; }
          &:nth-child(4) { width: 60px !important; }
          &:nth-child(5) { width: 140px !important; }
        }
      }

      :deep(.el-table__header-wrapper th.el-table__cell),
      :deep(.el-table__body-wrapper td.el-table__cell) {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      :deep(.cell) {
        width: fit-content;
        text-wrap: inherit;
      }

    }
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