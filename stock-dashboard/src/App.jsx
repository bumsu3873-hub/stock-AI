import { useState, useEffect } from 'react'
import StockChart from './components/StockChart'
import OrderBook from './components/OrderBook'
import DailyLimitUp from './components/DailyLimitUp'
import StockSearch from './components/StockSearch'
import Portfolio from './components/Portfolio'
import wsClient from './utils/websocketClient'
import storageService from './utils/storageService'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

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
  
  const [portfolio, setPortfolio] = useState([])
  const [balance, setBalance] = useState(0)
  const [currentPrices, setCurrentPrices] = useState({})
  const [loading, setLoading] = useState(true)

  const stocks = [
    { code: '005930', name: '삼성전자' },
    { code: '000660', name: 'SK하이닉스' },
    { code: '035420', name: 'NAVER' },
    { code: '035720', name: '카카오' },
    { code: '005380', name: '현대차' }
  ]

  useEffect(() => {
    loadPortfolioData()
  }, [])

  const loadPortfolioData = async () => {
    try {
      setLoading(true)
      const [portfolioRes, balanceRes] = await Promise.all([
        fetch(`${API_URL}/api/portfolio`),
        fetch(`${API_URL}/api/balance`)
      ])

      if (portfolioRes.ok && balanceRes.ok) {
        const portfolioData = await portfolioRes.json()
        const balanceData = await balanceRes.json()
        
        setPortfolio(portfolioData.holdings || [])
        setBalance(balanceData.balance)
        
        const pricesMap = {}
        portfolioData.holdings?.forEach(holding => {
          pricesMap[holding.code] = holding.avgPrice
        })
        setCurrentPrices(pricesMap)
        
        storageService.savePortfolio(portfolioData)
        storageService.saveBalance(balanceData)
      }
    } catch (error) {
      console.error('포트폴리오 로드 실패:', error)
      const backup = storageService.getPortfolio()
      if (backup) {
        setPortfolio(backup.holdings || [])
      }
    } finally {
      setLoading(false)
    }
  }

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

      const pricesMap = {}
      prices.forEach(p => {
        pricesMap[p.code] = p.price
      })
      setCurrentPrices(prev => ({ ...prev, ...pricesMap }))

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

  const handleOrderComplete = (order) => {
    loadPortfolioData()
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

      <div style={{ 
        marginBottom: '20px', 
        padding: '20px', 
        background: '#1a1f3a', 
        borderRadius: '10px',
        color: '#fff'
      }}>
        <h3>💰 계좌 현황</h3>
        <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '10px', color: '#4a90e2' }}>
          잔액: {balance.toLocaleString()}원
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>로딩 중...</div>
      ) : (
        <div style={{ marginBottom: '20px' }}>
          <Portfolio portfolio={portfolio} currentPrices={currentPrices} />
        </div>
      )}

      <StockSearch />

      <div className="grid">
        <StockChart price={stockData.price} />
        <OrderBook currentPrice={stockData.price} onOrderComplete={handleOrderComplete} />
        <DailyLimitUp />
      </div>
    </div>
  )
}

export default App;
