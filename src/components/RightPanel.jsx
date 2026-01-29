import { useState, useEffect } from 'react'
import { Newspaper, Link } from 'lucide-react'

function RightPanel({ selectedStock, sectorStocks }) {
  const [relatedStocks, setRelatedStocks] = useState([])
  const [selectedStockName, setSelectedStockName] = useState('')

  useEffect(() => {
    const selected = sectorStocks.find(s => s.code === selectedStock)
    if (selected) {
      setSelectedStockName(selected.name || selectedStock)
      setRelatedStocks(sectorStocks.filter(s => s.code !== selectedStock).slice(0, 5))
    }
  }, [selectedStock, sectorStocks])

  const mockNews = [
    { time: '09:30', title: `${selectedStockName} 반도체 수출 호조에 관련주 일제히 상승세`, source: '경제뉴스' },
    { time: '10:15', title: `${selectedStockName} 외국인, 코스피 순매수 행진 지속`, source: '마켓워치' },
    { time: '11:45', title: `${selectedStockName} AI 칩 개발 가속화 발표`, source: 'IT데일리' },
  ]

  return (
    <div style={{
      width: '320px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        border: '1px solid #f0f0f0'
      }}>
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: '700', 
          color: '#1a1f3a', 
          marginBottom: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Newspaper size={18} color="#1e90ff" />
          뉴스 피드
        </h3>

         <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
           {mockNews.map((news, idx) => (
             <a 
               key={idx}
               href={`https://search.naver.com/search.naver?query=${encodeURIComponent(news.title)}`}
               target="_blank"
               rel="noopener noreferrer"
               style={{
                 textDecoration: 'none',
                 padding: '12px',
                 background: '#f8f9fa',
                 borderRadius: '12px',
                 cursor: 'pointer',
                 transition: 'all 0.2s ease',
                 border: '1px solid transparent',
                 display: 'block'
               }}
               onMouseEnter={(e) => {
                 e.currentTarget.style.background = '#fff'
                 e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'
                 e.currentTarget.style.borderColor = '#e1e4e8'
               }}
               onMouseLeave={(e) => {
                 e.currentTarget.style.background = '#f8f9fa'
                 e.currentTarget.style.boxShadow = 'none'
                 e.currentTarget.style.borderColor = 'transparent'
               }}
             >
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                 <span style={{ fontSize: '11px', color: '#1e90ff', fontWeight: '600' }}>{news.time}</span>
                 <span style={{ fontSize: '11px', color: '#999' }}>{news.source}</span>
               </div>
               <div style={{ fontSize: '13px', lineHeight: '1.5', color: '#333', fontWeight: '500' }}>
                 {news.title}
               </div>
             </a>
           ))}
        </div>
      </div>

      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        border: '1px solid #f0f0f0',
        flex: 1
      }}>
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: '700', 
          color: '#1a1f3a', 
          marginBottom: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Link size={18} color="#1e90ff" />
          관련 종목
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {relatedStocks.map(stock => (
            <div key={stock.code} style={{
              padding: '12px',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '2px' }}>{stock.name}</div>
                <div style={{ fontSize: '11px', color: '#999' }}>{stock.code}</div>
              </div>
               <div style={{ textAlign: 'right' }}>
                  {stock.price ? (
                    <>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#1a1f3a' }}>
                        {stock.price.toLocaleString()}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: stock.change >= 0 ? '#ff4757' : '#1e90ff',
                        fontWeight: '600'
                      }}>
                        {stock.change >= 0 ? '▲' : '▼'} {Math.abs(parseFloat(stock.changePercent))}%
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#999' }}>클릭하여 보기</div>
                  )}
                </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RightPanel
