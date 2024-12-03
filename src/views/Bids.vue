<template>
  <div class="bids-page">
    <el-page-header @back="$router.push('/')" title="Keyword Bid Data" />
    
    <div class="content">
      <h2>Bid Recommendations Chart</h2>
      
      <BidsChart :chart-data="chartData" />
      
      <div class="control-buttons">
        <el-button-group>
          <el-button @click="addDay">+ Add Day</el-button>
          <el-button @click="removeDay" :disabled="days <= 1">- Remove Day</el-button>
          <el-button @click="resetDays">Reset to 1 Day</el-button>
        </el-button-group>
        <span class="days-display">
          Showing data for the last {{ days }} day{{ days > 1 ? 's' : '' }}
        </span>
      </div>

      <div class="keyword-groups">
        <el-card v-for="(items, keyword) in bidData" 
                :key="keyword" 
                class="keyword-group">
          <template #header>
            <h3>Keyword: {{ keyword }}</h3>
          </template>
          
          <el-table :data="items" 
                    stripe 
                    border 
                    style="width: 100%"
                    class="data-table">
            <el-table-column prop="suggested_bid" 
                           label="Suggested Bid ($)"
                           :formatter="(row) => '$' + row.suggested_bid.toFixed(2)" />
            <el-table-column prop="updated_at" 
                           label="Last Updated"
                           :formatter="(row) => new Date(row.updated_at).toLocaleString()" />
          </el-table>
        </el-card>
      </div>
    </div>

    <Loading :visible="loading" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import BidsChart from '../components/charts/BidsChart.vue'
import Loading from '../components/common/Loading.vue'
import { useBidsStore } from '../stores/bids'

const store = useBidsStore()
const days = ref(1)
const loading = ref(false)

const chartData = computed(() => store.chartData)
const bidData = computed(() => store.bidData)

const fetchData = async () => {
  loading.value = true
  try {
    await store.fetchBidData(days.value)
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
.bids-page {
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

  .keyword-groups {
    display: grid;
    gap: 2rem;
    
    @media (min-width: 1200px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .keyword-group {
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
        &:nth-child(1) { min-width: 120px; }  // Suggested Bid
        &:nth-child(2) { min-width: 140px; }  // Last Updated
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
          &:nth-child(1) { width: 120px !important; }
          &:nth-child(2) { width: 140px !important; }
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
  }
}
</style> 