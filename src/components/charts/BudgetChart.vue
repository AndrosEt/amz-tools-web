<template>
  <div class="chart-container">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import Chart from 'chart.js/auto'
import 'chartjs-adapter-date-fns'
import { getChartColors } from '../../utils/chart-colors';

const props = defineProps({
  chartData: {
    type: Object,
    required: true
  }
})

const chartRef = ref(null)
let chart = null

const createChart = (data) => {
  if (chart) {
    chart.destroy()
  }

  const ctx = chartRef.value.getContext('2d')
  const colorMap = getChartColors('budget', Object.keys(data));
  
  const datasets = Object.entries(data).map(([portfolioId, data]) => ({
    label: data.name,
    data: data.timestamps.map((timestamp, i) => ({
      x: new Date(timestamp),
      y: 100 - data.usage[i]
    })),
    backgroundColor: colorMap[portfolioId],
    borderColor: colorMap[portfolioId].replace('0.6', '1'),
    fill: false,
    tension: 0.1
  }))

  chart = new Chart(ctx, {
    type: 'line',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'hour',
            displayFormats: {
              hour: 'yyyy-MM-dd HH:mm'
            }
          },
          title: {
            display: true,
            text: 'Last Updated'
          }
        },
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: 'Budget Remaining %'
          }
        }
      }
    }
  })
}

watch(() => props.chartData, (newData) => {
  createChart(newData)
}, { deep: true })

onMounted(() => {
  if (props.chartData) {
    createChart(props.chartData)
  }
})

const getChartOptions = computed(() => {
  const portfolioNames = Object.keys(props.chartData);
  const colorMap = getChartColors('budget', portfolioNames);
  
  return {
    // ... other options
    series: portfolioNames.map(name => ({
      name,
      type: 'line',
      data: props.chartData[name],
      itemStyle: {
        color: colorMap[name]
      }
    }))
    // ... rest of options
  };
});
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 60vh;
  width: 100%;
}

@media (max-width: 768px) {
  .chart-container {
    height: 70vh;
  }
}
</style> 