const PORTFOLIO_KEY = 'portfolio_backup'
const BALANCE_KEY = 'balance_backup'

export const storageService = {
  savePortfolio(data) {
    try {
      localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('localStorage 저장 실패:', error)
    }
  },

  getPortfolio() {
    try {
      const data = localStorage.getItem(PORTFOLIO_KEY)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('localStorage 로드 실패:', error)
      return null
    }
  },

  saveBalance(data) {
    try {
      localStorage.setItem(BALANCE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('localStorage 저장 실패:', error)
    }
  },

  getBalance() {
    try {
      const data = localStorage.getItem(BALANCE_KEY)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('localStorage 로드 실패:', error)
      return null
    }
  },

  clearAll() {
    try {
      localStorage.removeItem(PORTFOLIO_KEY)
      localStorage.removeItem(BALANCE_KEY)
    } catch (error) {
      console.error('localStorage 삭제 실패:', error)
    }
  }
}

export default storageService
