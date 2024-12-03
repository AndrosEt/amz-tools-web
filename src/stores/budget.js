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

        // Group data by portfolio ID and sort items within each portfolio
        this.portfolioData = mergedData.reduce((acc, item) => {
          if (!acc[item.id]) {
            acc[item.id] = {
              name: item.name,
              items: []
            }
          }
          acc[item.id].items.push(item)
          
          // Sort items after adding new item
          acc[item.id].items.sort((a, b) => {
            // First sort by startDate (descending)
            const dateCompare = b.startDate.localeCompare(a.startDate)
            if (dateCompare !== 0) return dateCompare
            
            // Then by usageUpdatedTimestamp (descending)
            // Convert to string for reliable comparison
            return String(b.usageUpdatedTimestamp).localeCompare(String(a.usageUpdatedTimestamp))
          })
          
      
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

        // When calculating totalSpend, log the grouped data
        this.totalSpend = Object.values(this.portfolioData).reduce((sum, portfolio) => {
          const groupedByStartDate = {}
          for (const item of portfolio.items) {
            if (!groupedByStartDate[item.startDate]) {
              groupedByStartDate[item.startDate] = item
            }
          }
          
          const portfolioSpend = Object.values(groupedByStartDate).reduce((total, latestUsage) => {
            return total + (latestUsage.budget * (latestUsage.budgetUsagePercent / 100))
          }, 0)

          return sum + portfolioSpend
        }, 0)

      } catch (error) {
        if (error.message === 'AES_KEY_NOT_FOUND') {
          return
        }
        console.error('Error fetching budget data:', error)
        throw error
      }
    }
  }
}) 