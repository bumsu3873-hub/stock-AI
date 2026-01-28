import { useState, useEffect } from 'react'
import StockChart from './StockChart'

function MainContent({ selectedStock, sectorStocks }) {
  const [stockData, setStockData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStockData = async () => {
      setLoading(true)
      try {
        const response = await fetch(`http://localhost:3000/api/stock/price/${selectedStock}`)
        const data = await response.json()
        const output = data.output || {}
        
        setStockData({
          code: selectedStock,
          name: output.hts_kor_isnm || '주식',
          price: parseInt(output.stck_prpr) || 0,
          change: parseInt(output.prdy_vrss) || 0,
          changePercent: (parseFloat(output.prdy_ctrt) || 0).toFixed(2),
          volume: parseInt(output.acml_vol) || 0,
          high: parseInt(output.stck_hgpr) || 0,
          low: parseInt(output.stck_lwpr) || 0,
          open: parseInt(output.stck_oprc) || 0,
          high52: parseInt(output.w52_hgpr) || 0,
          low52: parseInt(output.w52_lwpr) || 0
        })
      } catch (error) {
        console.error('Failed to fetch stock data:', error)
      }
      setLoading(false)
    }

    fetchStockData()
    const interval = setInterval(fetchStockData, 3000)
    return () => clearInterval(interval)
  }, [selectedStock])

  if (loading || !stockData) {
    return <div style={{ padding: '20px' }}>로딩 중...</div>
  }

  return (
    <div style={{
      flex: 1,
      overflow: 'y',
      padding: '30px',
      background: '#0f1419'
    }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', margin: '0 0 10px 0' }}>
          {stockData.name}
        </h1>
        <p style={{ margin: 0, opacity: 0.7, fontSize: '14px' }}>
          {stockData.code}
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '15px',
        marginBottom: '30px'
      }}>
        <div style={{
          padding: '20px',
          background: '#14181f',
          borderRadius: '8px',
          borderLeft: '3px solid #1e90ff'
        }}>
          <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '5px' }}>현재가</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {stockData.price.toLocaleString()}원
          </div>
        </div>

        <div style={{
          padding: '20px',
          background: '#14181f',
          borderRadius: '8px',
          borderLeft: `3px solid ${stockData.change >= 0 ? '#ff4757' : '#1e90ff'}`
        }}>
          <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '5px' }}>변동</div>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: stockData.change >= 0 ? '#ff4757' : '#1e90ff'
          }}>
            {stockData.change >= 0 ? '+' : ''}{stockData.change.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', marginTop: '5px' }}>
            {stockData.changePercent > 0 ? '+' : ''}{stockData.changePercent}%
          </div>
        </div>

        <div style={{
          padding: '20px',
          background: '#14181f',
          borderRadius: '8px',
          borderLeft: '3px solid #2ecc71'
        }}>
          <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '5px' }}>거래량</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {(stockData.volume / 1000000).toFixed(1)}M
          </div>
        </div>

        <div style={{
          padding: '20px',
          background: '#14181f',
          borderRadius: '8px',
          borderLeft: '3px solid #f39c12'
        }}>
          <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '5px' }}>오늘 범위</div>
          <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
            <div>{stockData.high.toLocaleString()} - {stockData.low.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div style={{
        padding: '20px',
        background: '#14181f',
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '14px' }}>📈 차트</h3>
        <StockChart stockCode={selectedStock} />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '15px'
      }}>
        <div style={{
          padding: '20px',
          background: '#14181f',
          borderRadius: '8px'
        }}>
          <h4 style={{ margin: '0 0 15px 0', fontSize: '13px', opacity: 0.7 }}>52주 범위</h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
            <div>
              <div style={{ opacity: 0.7, marginBottom: '5px' }}>고가</div>
              <div style={{ fontWeight: 'bold', color: '#ff4757' }}>
                {stockData.high52.toLocaleString()}원
              </div>
            </div>
            <div>
              <div style={{ opacity: 0.7, marginBottom: '5px' }}>저가</div>
              <div style={{ fontWeight: 'bold', color: '#1e90ff' }}>
                {stockData.low52.toLocaleString()}원
              </div>
            </div>
          </div>
        </div>

        <div style={{
          padding: '20px',
          background: '#14181f',
          borderRadius: '8px'
        }}>
          <h4 style={{ margin: '0 0 15px 0', fontSize: '13px', opacity: 0.7 }}>오늘 시가</h4>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
            {stockData.open.toLocaleString()}원
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainContent
