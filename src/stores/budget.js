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
        // Merge data from multiple days
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
          // Group items by startDate to handle multiple budget periods
          const groupedByStartDate = portfolio.items.reduce((acc, item) => {
            if (!acc[item.startDate]) {
              acc[item.startDate] = []
            }
            acc[item.startDate].push(item)
            return acc
          }, {})

          // Calculate and sum up the latest spend for each startDate
          const portfolioSpend = Object.values(groupedByStartDate).reduce((total, items) => {
            // Get the most recent usage data for this startDate
            const latestUsage = items.reduce((latest, item) => {
              return !latest || item.usageUpdatedTimestamp > latest.usageUpdatedTimestamp ? item : latest
            }, null)
            
            // Add spend for this budget period
            return total + (latestUsage.budget * (latestUsage.budgetUsagePercent / 100))
          }, 0)

          return sum + portfolioSpend
        }, 0)
      } catch (error) {
        if (error.message === 'AES_KEY_NOT_FOUND') {
          // This case will be handled by App.vue, no additional handling needed
          return
        }
        console.error('Error fetching budget data:', error)
        throw error
      }
    }
  }
}) 