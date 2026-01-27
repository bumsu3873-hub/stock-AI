import { useState, useEffect } from 'react'
import StockChart from './components/StockChart'
import OrderBook from './components/OrderBook'
import DailyLimitUp from './components/DailyLimitUp'

function App() {
  const [stockData, setStockData] = useState({
    name: '삼성전자',
    price: 71500,
    change: 0,
    changePercent: 0
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setStockData(prev => {
        const change = (Math.random() - 0.5) * 1000
        const newPrice = Math.max(70000, Math.min(73000, prev.price + change))
        return {
          ...prev,
          price: Math.round(newPrice),
          change: Math.round(newPrice - 71500),
          changePercent: ((newPrice - 71500) / 71500 * 100).toFixed(2)
        }
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="dashboard">
      <div className="header">
        <h1>📈 주식 대시보드 (데모)</h1>
        <p style={{marginTop: '10px', opacity: 0.9}}>실시간 Mock 데이터</p>
      </div>

      <div style={{marginBottom: '20px', padding: '20px', background: '#1a1f3a', borderRadius: '10px'}}>
        <h2>{stockData.name}</h2>
        <div style={{fontSize: '32px', fontWeight: 'bold', marginTop: '10px'}}>
          {stockData.price.toLocaleString()}원
        </div>
        <div className={stockData.change >= 0 ? 'price-up' : 'price-down'} style={{fontSize: '20px', marginTop: '5px'}}>
          {stockData.change >= 0 ? '▲' : '▼'} {Math.abs(stockData.change).toLocaleString()}원 
          ({stockData.change >= 0 ? '+' : ''}{stockData.changePercent}%)
        </div>
      </div>

      <div className="grid">
        <StockChart price={stockData.price} />
        <OrderBook currentPrice={stockData.price} />
        <DailyLimitUp />
      </div>
    </div>
  )
}

export default App;
