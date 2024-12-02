import CryptoJS from 'crypto-js'

export class GitHubDataService {
  constructor() {
    const storedKey = localStorage.getItem('aesKey')
    if (!storedKey) {
      throw new Error('AES_KEY_NOT_FOUND')
    }
    this.key = CryptoJS.enc.Base64.parse(storedKey)
    this.baseUrl = 'https://api.github.com/repos/AndrosEt/buf/contents'
  }

  async fetchFileContent(path) {
    try {
      const response = await fetch(`${this.baseUrl}/${path}`)
      const data = await response.json()
      // GitHub API 返回的内容是 base64 编码的
      const cleanContent = data.content.replace(/\n/g, '')
      return cleanContent
    } catch (error) {
      console.error(`Error fetching file from GitHub: ${error}`)
      throw error
    }
  }

  decryptData(encryptedData) {
    try {
      // 双重 base64 解码
      let decoded
      try {
        // 第一次解码
        const firstDecode = atob(encryptedData)
        // 第二次解码
        decoded = atob(firstDecode)
      } catch (e) {
        console.error('Base64 decoding error:', e)
        throw new Error('Invalid base64 encoding')
      }
      
      // 转换为 WordArray
      const rawData = CryptoJS.enc.Latin1.parse(decoded)
      
      // 提取 IV (前16字节)
      const iv = CryptoJS.lib.WordArray.create(rawData.words.slice(0, 4))
      
      // 提取加密数据 (剩余部分)
      const encryptedContent = CryptoJS.lib.WordArray.create(rawData.words.slice(4))

      // 解密
      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: encryptedContent },
        this.key,
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      )
      
      // 转换为字符串并解析 JSON
      const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8)
      return JSON.parse(decryptedStr)
    } catch (error) {
      console.error('Error decrypting data:', {
        error,
        errorType: error.constructor.name,
        errorMessage: error.message,
        stack: error.stack
      })
      throw error
    }
  }

  async getRecentFiles(directory, days) {
    try {
      // 获取目录内容
      const response = await fetch(`${this.baseUrl}/${directory}`)
      const files = await response.json()
      
      // 获取最近n天的文件
      const today = new Date()
      const recentFiles = files
        .filter(file => {
          const fileName = file.name
          // 假设文件名格式为 YYYY-MM-DD.json
          const fileDate = new Date(fileName.split('.')[0])
          const diffTime = Math.abs(today - fileDate)
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          return diffDays <= days
        })
        .sort((a, b) => b.name.localeCompare(a.name)) // 按日期降序排序
        .slice(0, days)

      // 获取并解密每个文件的内容
      const contents = await Promise.all(
        recentFiles.map(async file => {
          try {
            const content = await this.fetchFileContent(`${directory}/${file.name}`)
            return this.decryptData(content)
          } catch (error) {
            console.error(`Error processing file ${file.name}:`, error)
            throw error
          }
        })
      )

      return contents
    } catch (error) {
      console.error('Error getting recent files:', {
        error,
        errorType: error.constructor.name,
        errorMessage: error.message,
        stack: error.stack
      })
      throw error
    }
  }
} 