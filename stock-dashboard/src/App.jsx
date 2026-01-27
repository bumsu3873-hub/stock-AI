import { useState, useEffect } from 'react'
import StockChart from './components/StockChart'
import OrderBook from './components/OrderBook'
import DailyLimitUp from './components/DailyLimitUp'
import wsClient from './utils/websocketClient'

function App() {
  const [stockData, setStockData] = useState({
    code: '005930',
    name: '삼성전자',
    price: 72500,
    change: 0,
    changePercent: '0.00'
  })
  const [wsStatus, setWsStatus] = useState('연결 중...')
  const [selectedStock, setSelectedStock] = useState('005930')

  const stocks = [
    { code: '005930', name: '삼성전자' },
    { code: '000660', name: 'SK하이닉스' },
    { code: '035420', name: 'NAVER' },
    { code: '035720', name: '카카오' },
    { code: '005380', name: '현대차' }
  ]

  useEffect(() => {
    const initializeWebSocket = async () => {
      try {
        await wsClient.connect()
        setWsStatus('✅ 연결됨')
        wsClient.subscribe(['005930'])
      } catch (error) {
        console.error('WebSocket 연결 실패:', error)
        setWsStatus('❌ 연결 실패 (Mock 데이터 사용)')
        useMockData()
      }
    }

    const handlePriceUpdate = (prices) => {
      if (!prices || prices.length === 0) return

      const selectedStockData = prices.find(p => p.code === selectedStock)
      if (selectedStockData) {
        setStockData({
          code: selectedStockData.code,
          name: selectedStockData.name,
          price: selectedStockData.price,
          change: selectedStockData.change,
          changePercent: selectedStockData.changePercent
        })
      }
    }

    initializeWebSocket()

    wsClient.on('priceUpdate', handlePriceUpdate)

    return () => {
      wsClient.off('priceUpdate', handlePriceUpdate)
    }
  }, [selectedStock])

  const useMockData = () => {
    const interval = setInterval(() => {
      setStockData(prev => {
        const basePrice = 72500
        const change = (Math.random() - 0.5) * 1000
        const newPrice = Math.max(70000, Math.min(75000, prev.price + change))
        return {
          ...prev,
          price: Math.round(newPrice),
          change: Math.round(newPrice - basePrice),
          changePercent: ((newPrice - basePrice) / basePrice * 100).toFixed(2)
        }
      })
    }, 2000)

    return () => clearInterval(interval)
  }

  const handleStockChange = (code) => {
    setSelectedStock(code)
    if (wsClient.isConnected()) {
      wsClient.subscribe([code])
    }
  }

  return (
    <div className="dashboard">
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>📈 주식 대시보드</h1>
            <p style={{ marginTop: '10px', opacity: 0.9 }}>실시간 주가 데이터</p>
          </div>
          <div style={{ fontSize: '14px', padding: '10px 20px', background: '#2a2f4a', borderRadius: '5px' }}>
            {wsStatus}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '20px', padding: '20px', background: '#1a1f3a', borderRadius: '10px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {stocks.map(stock => (
            <button
              key={stock.code}
              onClick={() => handleStockChange(stock.code)}
              style={{
                padding: '10px 15px',
                background: selectedStock === stock.code ? '#4a90e2' : '#2a2f4a',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {stock.name}
            </button>
          ))}
        </div>

        <h2>{stockData.name}</h2>
        <div style={{ fontSize: '32px', fontWeight: 'bold', marginTop: '10px' }}>
          {stockData.price.toLocaleString()}원
        </div>
        <div
          className={stockData.change >= 0 ? 'price-up' : 'price-down'}
          style={{ fontSize: '20px', marginTop: '5px' }}
        >
          {stockData.change >= 0 ? '▲' : '▼'} {Math.abs(stockData.change).toLocaleString()}원 ({stockData.change >= 0 ? '+' : ''}{stockData.changePercent}%)
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
