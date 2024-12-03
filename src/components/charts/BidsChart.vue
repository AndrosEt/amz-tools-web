<template>
  <div class="chart-container">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import Chart from 'chart.js/auto'
import 'chartjs-adapter-date-fns'
import { getChartColors } from '../../utils/chart-colors'

const props = defineProps({
  chartData: {
    type: Object,
    required: true
  }
})

const chartRef = ref(null)
let chart = null

const getChartOptions = computed(() => {
  const keywordNames = Object.keys(props.chartData)
  const colorMap = getChartColors('bids', keywordNames)
  
  return {
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
          minRotation: 45,
          maxTicksLimit: window.innerWidth <= 768 ? 6 : 12,
          autoSkip: true
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
        labels: {
          boxWidth: window.innerWidth <= 768 ? 8 : 40,
          padding: window.innerWidth <= 768 ? 10 : 20
        }
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
    },
    series: keywordNames.map(name => ({
      name,
      type: 'line',
      data: props.chartData[name],
      itemStyle: {
        color: colorMap[name]
      }
    }))
  }
})

const createChart = (data) => {
  if (chart) {
    chart.destroy()
  }

  const ctx = chartRef.value.getContext('2d')
  const colorMap = getChartColors('bids', Object.keys(data));
  
  const datasets = Object.entries(data).map(([keyword, data]) => ({
    label: keyword,
    data: data.timestamps.map((timestamp, i) => ({
      x: new Date(timestamp),
      y: data.bids[i]
    })),
    backgroundColor: colorMap[keyword],
    borderColor: colorMap[keyword].replace('0.6', '1'),
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
            minRotation: 45,
            maxTicksLimit: window.innerWidth <= 768 ? 6 : 12,
            autoSkip: true
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
          labels: {
            boxWidth: window.innerWidth <= 768 ? 8 : 40,
            padding: window.innerWidth <= 768 ? 10 : 20
          }
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