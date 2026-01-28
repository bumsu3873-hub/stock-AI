import { useState, useEffect } from 'react'
import AdvancedChart from '../components/AdvancedChart'
import CandlestickChart from '../components/CandlestickChart'
import BacktestingPanel from '../components/BacktestingPanel'
import PricePredictionPanel from '../components/PricePredictionPanel'
import AlertManager from '../components/AlertManager'

function AdvancedAnalysis({ selectedStock = '005930' }) {
  const [historicalData, setHistoricalData] = useState([])
  const [currentPrice, setCurrentPrice] = useState(0)
  const [stockName, setStockName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`http://localhost:3000/api/stock/price/${selectedStock}`)
        const data = await response.json()
        const output = data.output || {}

        setCurrentPrice(parseInt(output.stck_prpr) || 0)
        setStockName(output.hts_kor_isnm || selectedStock)

        const mockHistorical = generateHistoricalData(parseInt(output.stck_prpr), 100)
        setHistoricalData(mockHistorical)
      } catch (error) {
        console.error('Failed to fetch stock data:', error)
      } finally {
        setLoading(false)
      }
    }

    const interval = setInterval(fetchHistoricalData, 5000)
    fetchHistoricalData()
    return () => clearInterval(interval)
  }, [selectedStock])

  const generateHistoricalData = (basePrice, days = 100) => {
    const data = []
    let price = basePrice

    for (let i = days; i > 0; i--) {
      const randomChange = (Math.random() - 0.5) * (basePrice * 0.02)
      price = Math.max(price + randomChange, basePrice * 0.8)

      data.push({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        time: i,
        price: Math.round(price),
        high: Math.round(price * 1.02),
        low: Math.round(price * 0.98),
        volume: Math.floor(Math.random() * 10000000)
      })
    }

    return data
  }

  if (loading) {
    return <div style={{ padding: '20px', color: '#888' }}>데이터 로딩 중...</div>
  }

  return (
    <div style={{
      padding: '30px',
      background: '#0f1419',
      color: '#fff',
      minHeight: '100vh'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px', margin: '0 0 5px 0' }}>
            📊 {stockName} - 고급 분석
          </h1>
          <p style={{ fontSize: '14px', opacity: 0.7, margin: 0 }}>
            현재가: {currentPrice.toLocaleString()}원
          </p>
        </div>

        <AdvancedChart
          stockCode={selectedStock}
          historicalData={historicalData}
        />

        <CandlestickChart historicalData={historicalData} />

        <PricePredictionPanel
          historicalData={historicalData}
          currentPrice={currentPrice}
        />

        <BacktestingPanel historicalData={historicalData} />

        <AlertManager
          currentPrice={currentPrice}
          stockName={stockName}
        />
      </div>
    </div>
  )
}

export default AdvancedAnalysis
