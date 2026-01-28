export class PricePredictor {
  constructor(prices) {
    this.prices = prices
    this.mean = this.calculateMean(prices)
    this.stdDev = this.calculateStdDev(prices)
  }

  calculateMean(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length
  }

  calculateStdDev(arr) {
    const mean = this.calculateMean(arr)
    const squareDiffs = arr.map(value => Math.pow(value - mean, 2))
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / arr.length
    return Math.sqrt(avgSquareDiff)
  }

  normalize(value) {
    return (value - this.mean) / this.stdDev
  }

  denormalize(value) {
    return value * this.stdDev + this.mean
  }

  linearRegression(lookback = 20) {
    const recent = this.prices.slice(-lookback)
    const n = recent.length

    const xValues = Array.from({ length: n }, (_, i) => i)
    const yValues = recent

    const sumX = xValues.reduce((a, b) => a + b, 0)
    const sumY = yValues.reduce((a, b) => a + b, 0)
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0)
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    const nextDays = Array.from({ length: 5 }, (_, i) => ({
      day: n + i + 1,
      predictedPrice: intercept + slope * (n + i + 1),
      confidence: this.calculateConfidence(recent, intercept, slope)
    }))

    return nextDays
  }

  exponentialSmoothing(alpha = 0.3, forecast = 5) {
    const result = [this.prices[this.prices.length - 1]]

    for (let i = 1; i < forecast; i++) {
      result.push(alpha * result[i - 1] + (1 - alpha) * this.prices[this.prices.length - 1])
    }

    return result.map((price, idx) => ({
      day: idx + 1,
      predictedPrice: price,
      confidence: 50 + (5 - idx) * 5
    }))
  }

  movingAverageMethod(lookback = 20, forecast = 5) {
    const recent = this.prices.slice(-lookback)
    const avgPrice = recent.reduce((a, b) => a + b, 0) / lookback

    const trend = (recent[lookback - 1] - recent[0]) / lookback

    return Array.from({ length: forecast }, (_, i) => ({
      day: i + 1,
      predictedPrice: avgPrice + trend * (i + 1),
      confidence: 45 + (5 - i) * 4
    }))
  }

  calculateConfidence(values, intercept, slope) {
    const residuals = values.map((v, i) => v - (intercept + slope * i))
    const mae = residuals.reduce((a, b) => a + Math.abs(b), 0) / values.length
    const mape = (mae / this.calculateMean(values)) * 100

    return Math.max(0, Math.min(100, 100 - mape))
  }

  predict(method = 'linear', lookback = 20, forecast = 5) {
    switch (method) {
      case 'linear':
        return this.linearRegression(lookback)
      case 'exponential':
        return this.exponentialSmoothing(0.3, forecast)
      case 'moving_average':
        return this.movingAverageMethod(lookback, forecast)
      default:
        return this.linearRegression(lookback)
    }
  }

  getMomentum(period = 10) {
    const recent = this.prices.slice(-period)
    return recent[recent.length - 1] - recent[0]
  }

  getVolatility(period = 20) {
    const recent = this.prices.slice(-period)
    const returns = []
    for (let i = 1; i < recent.length; i++) {
      returns.push((recent[i] - recent[i - 1]) / recent[i - 1])
    }
    return this.calculateStdDev(returns) * 100
  }

  getSentiment() {
    const recentChange = this.prices[this.prices.length - 1] - this.prices[Math.max(0, this.prices.length - 5)]
    const sentimentScore = recentChange / this.prices[this.prices.length - 5] * 100

    if (sentimentScore > 5) return { text: '강한 상승', value: 'bullish', color: '#00ff00' }
    if (sentimentScore > 0) return { text: '상승', value: 'mildly_bullish', color: '#99ff99' }
    if (sentimentScore > -5) return { text: '하락', value: 'mildly_bearish', color: '#ff9999' }
    return { text: '강한 하락', value: 'bearish', color: '#ff0000' }
  }
}

export const predictPrice = (prices, method = 'linear') => {
  const predictor = new PricePredictor(prices)
  return predictor.predict(method)
}

export const getMarketSentiment = (prices) => {
  const predictor = new PricePredictor(prices)
  return {
    sentiment: predictor.getSentiment(),
    momentum: predictor.getMomentum(),
    volatility: predictor.getVolatility()
  }
}
