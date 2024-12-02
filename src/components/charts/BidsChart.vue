<template>
  <div class="chart-container">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'
import 'chartjs-adapter-date-fns'

const props = defineProps({
  chartData: {
    type: Object,
    required: true
  }
})

const chartRef = ref(null)
let chart = null

const colors = [
  'rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)',
  'rgba(255, 206, 86, 0.6)', 'rgba(75, 192, 192, 0.6)',
  'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)',
  'rgba(199, 199, 199, 0.6)', 'rgba(83, 102, 255, 0.6)',
  'rgba(40, 159, 64, 0.6)', 'rgba(210, 199, 199, 0.6)'
]

const createChart = (data) => {
  if (chart) {
    chart.destroy()
  }

  const ctx = chartRef.value.getContext('2d')
  const datasets = Object.entries(data).map(([keyword, data], index) => ({
    label: keyword,
    data: data.timestamps.map((timestamp, i) => ({
      x: new Date(timestamp),
      y: data.bids[i]
    })),
    backgroundColor: colors[index % colors.length],
    borderColor: colors[index % colors.length].replace('0.6', '1'),
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
            text: 'Update Time'
          },
          ticks: {
            maxRotation: 45,
            minRotation: 45
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Suggested Bid ($)'
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += '$' + context.parsed.y.toFixed(2);
              }
              return label;
            }
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