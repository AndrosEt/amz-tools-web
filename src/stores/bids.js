import { defineStore } from 'pinia'
import { GitHubDataService } from '../utils/github-data'

export const useBidsStore = defineStore('bids', {
  state: () => ({
    bidData: {},
    chartData: {}
  }),

  actions: {
    async fetchBidData(days) {
      try {
        const githubService = new GitHubDataService()
        const data = await githubService.getRecentFiles('bid_recommendations', days)
        // 合并多天的数据
        const mergedData = data.flat()

        // Group data by keyword
        this.bidData = mergedData.reduce((acc, item) => {
          if (!acc[item.keyword]) {
            acc[item.keyword] = []
          }
          acc[item.keyword].push(item)
          return acc
        }, {})

        // Prepare chart data
        this.chartData = Object.entries(this.bidData).reduce((acc, [keyword, items]) => {
          acc[keyword] = {
            timestamps: items.map(item => item.updated_at),
            bids: items.map(item => item.suggested_bid)
          }
          return acc
        }, {})
      } catch (error) {
        console.error('Error fetching bid data:', error)
        throw error
      }
    }
  }
}) 