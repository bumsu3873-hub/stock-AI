import { useState, useEffect } from 'react'
import StockChart from './StockChart'
import { TrendingUp, TrendingDown, Activity, BarChart2 } from 'lucide-react'

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
  }, [selectedStock])

  if (loading || !stockData) {
    return (
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '100%' 
      }}>
        <div style={{ color: '#1e90ff', fontWeight: '600' }}>데이터를 불러오는 중...</div>
      </div>
    )
  }

  const isMobile = window.innerWidth < 768
  const isUp = stockData.change >= 0

  return (
    <div style={{
      flex: 1,
      overflow: 'auto',
      padding: isMobile ? '15px' : '0 20px',
      height: '100%'
    }}>
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ 
          fontSize: '14px', 
          fontWeight: '700', 
          color: '#666', 
          marginBottom: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          🔥 실시간 핫 종목
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: '15px' 
        }}>
          {sectorStocks.slice(0, 3).map(stock => (
            <div key={stock.code} style={{
              background: '#fff',
              padding: '15px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              border: '1px solid #f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>{stock.name}</div>
                <div style={{ fontSize: '12px', color: '#999' }}>{stock.code}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#1a1f3a' }}>
                  {stock.price.toLocaleString()}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: stock.change >= 0 ? '#ff4757' : '#1e90ff',
                  fontWeight: '600'
                }}>
                  {stock.change >= 0 ? '+' : ''}{stock.changePercent}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        background: '#fff',
        borderRadius: '20px',
        padding: '30px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        border: '1px solid #e1e4e8',
        marginBottom: '20px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800', margin: 0, color: '#1a1f3a' }}>
                {stockData.name}
              </h1>
              <span style={{ 
                background: '#f5f7fa', 
                padding: '4px 8px', 
                borderRadius: '6px', 
                fontSize: '13px', 
                color: '#666',
                fontWeight: '600'
              }}>
                {stockData.code}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '15px' }}>
              <span style={{ fontSize: '36px', fontWeight: '800', color: isUp ? '#ff4757' : '#1e90ff' }}>
                {stockData.price.toLocaleString()}
                <span style={{ fontSize: '20px', marginLeft: '2px' }}>원</span>
              </span>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '5px',
                fontSize: '16px', 
                fontWeight: '600',
                color: isUp ? '#ff4757' : '#1e90ff'
              }}>
                {isUp ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                <span>{isUp ? '▲' : '▼'} {Math.abs(stockData.change).toLocaleString()}</span>
                <span>({stockData.changePercent}%)</span>
              </div>
            </div>
          </div>


        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: '15px',
          marginBottom: '30px'
        }}>
          <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#666' }}>
              <Activity size={14} />
              <span style={{ fontSize: '12px', fontWeight: '600' }}>거래량</span>
            </div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#333' }}>
              {(stockData.volume / 1000000).toFixed(1)}M
            </div>
          </div>

          <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#666' }}>
              <BarChart2 size={14} />
              <span style={{ fontSize: '12px', fontWeight: '600' }}>시가</span>
            </div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#333' }}>
              {stockData.open.toLocaleString()}
            </div>
          </div>

          <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#666' }}>
              <TrendingUp size={14} />
              <span style={{ fontSize: '12px', fontWeight: '600' }}>고가</span>
            </div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#ff4757' }}>
              {stockData.high.toLocaleString()}
            </div>
          </div>

          <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#666' }}>
              <TrendingDown size={14} />
              <span style={{ fontSize: '12px', fontWeight: '600' }}>저가</span>
            </div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#1e90ff' }}>
              {stockData.low.toLocaleString()}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1f3a', margin: 0 }}>
              주가 차트
            </h3>
            <div style={{ display: 'flex', gap: '5px' }}>
              {['1일', '1주', '1달', '1년'].map(period => (
                <button key={period} style={{
                  padding: '4px 10px',
                  background: period === '1일' ? '#1e90ff' : 'transparent',
                  color: period === '1일' ? '#fff' : '#666',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div style={{ 
            height: '350px', 
            background: '#f8f9fa', 
            borderRadius: '12px', 
            padding: '20px',
            border: '1px solid #f0f0f0'
          }}>
            <StockChart price={stockData.price} />
          </div>
        </div>

        <div style={{ 
          background: '#f8f9fa', 
          borderRadius: '12px', 
          padding: '20px',
          border: '1px solid #f0f0f0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#666' }}>52주 최저</span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#666' }}>52주 최고</span>
          </div>
          <div style={{ 
            height: '6px', 
            background: '#e1e4e8', 
            borderRadius: '3px', 
            position: 'relative',
            marginBottom: '10px'
          }}>
            <div style={{
              position: 'absolute',
              left: '0%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, #1e90ff 0%, #ff4757 100%)',
              borderRadius: '3px',
              opacity: 0.3
            }}></div>
            <div style={{
              position: 'absolute',
              left: `${((stockData.price - stockData.low52) / (stockData.high52 - stockData.low52)) * 100}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '12px',
              height: '12px',
              background: '#fff',
              border: '3px solid #1a1f3a',
              borderRadius: '50%',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#1a1f3a' }}>{stockData.low52.toLocaleString()}</span>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#1a1f3a' }}>{stockData.high52.toLocaleString()}</span>
          </div>
        </div>
      </div>


    </div>
  )
}

export default MainContent
