import { defineStore } from 'pinia'
import { GitHubDataService } from '../utils/github-data'

export const useBudgetStore = defineStore('budget', {
  state: () => ({
    portfolioData: {},
    chartData: {},
    totalSpend: 0
  }),

  actions: {
    async fetchBudgetData(days) {
      try {
        const githubService = new GitHubDataService()
        const data = await githubService.getRecentFiles('budget_usage', days)
        // 合并多天的数据
        const mergedData = data.flat()

        // Group data by portfolio ID
        this.portfolioData = mergedData.reduce((acc, item) => {
          if (!acc[item.id]) {
            acc[item.id] = {
              name: item.name,
              items: []
            }
          }
          acc[item.id].items.push(item)
          return acc
        }, {})

        // Prepare chart data
        this.chartData = Object.entries(this.portfolioData).reduce((acc, [id, portfolio]) => {
          acc[id] = {
            name: portfolio.name,
            timestamps: portfolio.items.map(item => item.usageUpdatedTimestamp),
            usage: portfolio.items.map(item => item.budgetUsagePercent)
          }
          return acc
        }, {})

        // Calculate total spend
        this.totalSpend = Object.values(this.portfolioData).reduce((sum, portfolio) => {
          return sum + portfolio.items.reduce((portfolioSum, item) => {
            return portfolioSum + (item.budget * (item.budgetUsagePercent / 100))
          }, 0)
        }, 0)
      } catch (error) {
        if (error.message === 'AES_KEY_NOT_FOUND') {
          // 这种情况会被 App.vue 处理，不需要额外处理
          return
        }
        console.error('Error fetching budget data:', error)
        throw error
      }
    }
  }
}) 