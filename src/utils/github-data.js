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
      // Content from GitHub API is base64 encoded
      const cleanContent = data.content.replace(/\n/g, '')
      return cleanContent
    } catch (error) {
      console.error(`Error fetching file from GitHub: ${error}`)
      throw error
    }
  }

  decryptData(encryptedData) {
    try {
      // Double base64 decode
      let decoded
      try {
        // First decode
        const firstDecode = atob(encryptedData)
        // Second decode
        decoded = atob(firstDecode)
      } catch (e) {
        console.error('Base64 decoding error:', e)
        throw new Error('Invalid base64 encoding')
      }
      
      // Convert to WordArray
      const rawData = CryptoJS.enc.Latin1.parse(decoded)
      
      // Extract IV (first 16 bytes)
      const iv = CryptoJS.lib.WordArray.create(rawData.words.slice(0, 4))
      
      // Extract encrypted data (remaining part)
      const encryptedContent = CryptoJS.lib.WordArray.create(rawData.words.slice(4))

      // Decrypt
      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: encryptedContent },
        this.key,
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      )
      
      // Convert to string and parse JSON
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
      // Get directory contents
      const response = await fetch(`${this.baseUrl}/${directory}`)
      const files = await response.json()
      
      // First sort all files by date
      const sortedFiles = files.sort((a, b) => b.name.localeCompare(a.name)) // Descending order
      
      if (sortedFiles.length === 0) {
        return []
      }

      // Get the latest file date as reference point
      const latestFileName = sortedFiles[0].name
      const referenceDate = new Date(latestFileName.split('.')[0])

      // Filter files from last n days based on latest file date
      const recentFiles = sortedFiles.filter(file => {
        const fileName = file.name
        // Assume filename format is YYYY-MM-DD.json
        const fileDate = new Date(fileName.split('.')[0])
        const diffTime = Math.abs(referenceDate - fileDate)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays < days
      })
      .slice(0, days)

      // Get and decrypt the content of each file
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