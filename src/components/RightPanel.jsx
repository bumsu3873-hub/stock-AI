import { useState, useEffect } from 'react'

function RightPanel({ selectedStock, sectorStocks }) {
  const [relatedStocks, setRelatedStocks] = useState([])

  useEffect(() => {
    const selected = sectorStocks.find(s => s.code === selectedStock)
    if (selected) {
      setRelatedStocks(sectorStocks.filter(s => s.code !== selectedStock).slice(0, 5))
    }
  }, [selectedStock, sectorStocks])

  const mockNews = [
    { time: '09:30', title: '반도체 수출 호조에 관련주 일제히 상승세', source: '경제뉴스' },
    { time: '10:15', title: '외국인, 코스피 순매수 행진 지속', source: '마켓워치' },
    { time: '11:45', title: 'AI 칩 개발 가속화 발표', source: 'IT데일리' },
  ]

  return (
    <div style={{
      width: '340px',
      borderLeft: '1px solid #1e2330',
      background: '#0f1419',
      overflow: 'y',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h3 style={{ fontSize: '12px', opacity: 0.7, marginBottom: '20px', textTransform: 'uppercase' }}>
        📰 뉴스 피드
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
        {mockNews.map((news, idx) => (
          <div key={idx} style={{
            padding: '12px',
            background: '#14181f',
            borderRadius: '6px',
            borderLeft: '2px solid #1e90ff',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': { background: '#1a1f2e' }
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontSize: '11px', opacity: 0.7 }}>{news.time}</span>
              <span style={{ fontSize: '10px', opacity: 0.5 }}>{news.source}</span>
            </div>
            <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
              {news.title}
            </div>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: '12px', opacity: 0.7, marginBottom: '20px', textTransform: 'uppercase' }}>
        🔗 관련 종목
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        {relatedStocks.map(stock => (
          <div key={stock.code} style={{
            padding: '10px',
            background: '#14181f',
            borderRadius: '6px',
            border: '1px solid #1e2330'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{stock.name}</span>
              <span style={{ fontSize: '10px', opacity: 0.7 }}>{stock.code}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold' }}>
                {stock.price.toLocaleString()}원
              </span>
              <span style={{
                fontSize: '11px',
                color: stock.change >= 0 ? '#ff4757' : '#1e90ff',
                fontWeight: 'bold'
              }}>
                {stock.change >= 0 ? '▲' : '▼'} {Math.abs(stock.changePercent)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RightPanel
