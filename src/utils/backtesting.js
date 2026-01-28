import { calculateRSI, calculateSMA, calculateMACD, calculateSharpeRatio, calculateMaxDrawdown } from './technicalIndicators'

export class BacktestingEngine {
  constructor(prices, dates, initialCapital = 10000000) {
    this.prices = prices
    this.dates = dates
    this.initialCapital = initialCapital
    this.trades = []
    this.portfolio = []
  }

  runStrategy(strategyName = 'sma_crossover') {
    switch (strategyName) {
      case 'sma_crossover':
        return this.smaCrossoverStrategy()
      case 'rsi_overbought':
        return this.rsiStrategy()
      case 'bollinger_bands':
        return this.bollingerBandsStrategy()
      default:
        return this.smaCrossoverStrategy()
    }
  }

  smaCrossoverStrategy() {
    const sma20 = this.calculateSMA(this.prices, 20)
    const sma50 = this.calculateSMA(this.prices, 50)

    let capital = this.initialCapital
    let position = 0
    const transactions = []
    const portfolioValue = [capital]

    for (let i = 50; i < this.prices.length; i++) {
      if (sma20[i - 30] !== undefined && sma50[i - 30] !== undefined) {
        if (sma20[i - 30] > sma50[i - 30] && position === 0) {
          const sharesBought = Math.floor(capital / this.prices[i])
          capital -= sharesBought * this.prices[i]
          position = sharesBought
          transactions.push({
            date: this.dates[i],
            type: 'BUY',
            price: this.prices[i],
            shares: sharesBought
          })
        }

        if (sma20[i - 30] < sma50[i - 30] && position > 0) {
          capital += position * this.prices[i]
          transactions.push({
            date: this.dates[i],
            type: 'SELL',
            price: this.prices[i],
            shares: position
          })
          position = 0
        }
      }

      const currentValue = capital + position * this.prices[i]
      portfolioValue.push(currentValue)
    }

    return this.calculateMetrics(transactions, portfolioValue)
  }

  rsiStrategy() {
    const rsi = this.calculateRSI(this.prices, 14)

    let capital = this.initialCapital
    let position = 0
    const transactions = []
    const portfolioValue = [capital]

    for (let i = 14; i < rsi.length; i++) {
      if (rsi[i] < 30 && position === 0) {
        const sharesBought = Math.floor(capital / this.prices[i + 14])
        capital -= sharesBought * this.prices[i + 14]
        position = sharesBought
        transactions.push({
          date: this.dates[i + 14],
          type: 'BUY',
          price: this.prices[i + 14],
          shares: sharesBought
        })
      }

      if (rsi[i] > 70 && position > 0) {
        capital += position * this.prices[i + 14]
        transactions.push({
          date: this.dates[i + 14],
          type: 'SELL',
          price: this.prices[i + 14],
          shares: position
        })
        position = 0
      }

      const currentValue = capital + position * this.prices[i + 14]
      portfolioValue.push(currentValue)
    }

    return this.calculateMetrics(transactions, portfolioValue)
  }

  bollingerBandsStrategy() {
    const sma = this.calculateSMA(this.prices, 20)
    const bands = this.calculateBollingerBands(this.prices, 20, 2)

    let capital = this.initialCapital
    let position = 0
    const transactions = []
    const portfolioValue = [capital]

    for (let i = 20; i < this.prices.length; i++) {
      const bandIndex = i - 20
      if (bands[bandIndex]) {
        if (this.prices[i] < bands[bandIndex].lower && position === 0) {
          const sharesBought = Math.floor(capital / this.prices[i])
          capital -= sharesBought * this.prices[i]
          position = sharesBought
          transactions.push({
            date: this.dates[i],
            type: 'BUY',
            price: this.prices[i],
            shares: sharesBought
          })
        }

        if (this.prices[i] > bands[bandIndex].upper && position > 0) {
          capital += position * this.prices[i]
          transactions.push({
            date: this.dates[i],
            type: 'SELL',
            price: this.prices[i],
            shares: position
          })
          position = 0
        }
      }

      const currentValue = capital + position * this.prices[i]
      portfolioValue.push(currentValue)
    }

    return this.calculateMetrics(transactions, portfolioValue)
  }

  calculateMetrics(transactions, portfolioValue) {
    const startValue = this.initialCapital
    const endValue = portfolioValue[portfolioValue.length - 1]
    const totalReturn = ((endValue - startValue) / startValue) * 100

    const dailyReturns = []
    for (let i = 1; i < portfolioValue.length; i++) {
      dailyReturns.push((portfolioValue[i] - portfolioValue[i - 1]) / portfolioValue[i - 1])
    }

    const winningTrades = transactions.filter((t, i) => {
      if (t.type === 'SELL') {
        const buyPrice = transactions[i - 1]?.price || 0
        return t.price > buyPrice
      }
      return false
    }).length

    const totalTrades = transactions.filter(t => t.type === 'SELL').length
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0

    const sharpeRatio = calculateSharpeRatio(dailyReturns)
    const maxDrawdown = calculateMaxDrawdown(portfolioValue)

    return {
      startValue,
      endValue,
      totalReturn: parseFloat(totalReturn.toFixed(2)),
      totalTrades,
      winRate: parseFloat(winRate.toFixed(2)),
      sharpeRatio: parseFloat(sharpeRatio.toFixed(2)),
      maxDrawdown: parseFloat((maxDrawdown * 100).toFixed(2)),
      transactions,
      portfolioValue
    }
  }

  calculateSMA(prices, period) {
    const sma = []
    for (let i = period - 1; i < prices.length; i++) {
      const slice = prices.slice(i - period + 1, i + 1)
      const avg = slice.reduce((a, b) => a + b, 0) / period
      sma.push(avg)
    }
    return sma
  }

  calculateRSI(prices, period) {
    const deltas = []
    for (let i = 1; i < prices.length; i++) {
      deltas.push(prices[i] - prices[i - 1])
    }

    let gains = 0
    let losses = 0

    for (let i = 0; i < period; i++) {
      if (deltas[i] > 0) gains += deltas[i]
      else losses += Math.abs(deltas[i])
    }

    let avgGain = gains / period
    let avgLoss = losses / period
    const rsi = []

    for (let i = period; i < deltas.length; i++) {
      if (deltas[i] > 0) gains = deltas[i]
      else gains = 0

      if (deltas[i] < 0) losses = Math.abs(deltas[i])
      else losses = 0

      avgGain = (avgGain * (period - 1) + gains) / period
      avgLoss = (avgLoss * (period - 1) + losses) / period

      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
      rsi.push(100 - 100 / (1 + rs))
    }

    return rsi
  }

  calculateBollingerBands(prices, period = 20, stdDev = 2) {
    const bands = []

    for (let i = period - 1; i < prices.length; i++) {
      const slice = prices.slice(i - period + 1, i + 1)
      const sma = slice.reduce((a, b) => a + b, 0) / period

      const squareDiffs = slice.map(price => Math.pow(price - sma, 2))
      const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / period
      const sd = Math.sqrt(avgSquareDiff)

      bands.push({
        upper: sma + sd * stdDev,
        middle: sma,
        lower: sma - sd * stdDev
      })
    }

    return bands
  }
}

export const runBacktest = (prices, dates, initialCapital = 10000000, strategy = 'sma_crossover') => {
  const engine = new BacktestingEngine(prices, dates, initialCapital)
  return engine.runStrategy(strategy)
}
