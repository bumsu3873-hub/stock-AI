import { useState, useEffect } from 'react'
import { Newspaper, Link } from 'lucide-react'

function RightPanel({ selectedStock, sectorStocks }) {
  const [relatedStocks, setRelatedStocks] = useState([])
  const [selectedStockName, setSelectedStockName] = useState('')
  const [news, setNews] = useState([])
  const [loadingNews, setLoadingNews] = useState(false)

  useEffect(() => {
    const selected = sectorStocks.find(s => s.code === selectedStock)
    if (selected) {
      setSelectedStockName(selected.name || selectedStock)
      setRelatedStocks(sectorStocks.filter(s => s.code !== selectedStock).slice(0, 5))
      fetchNews(selected.name || selectedStock)
    }
  }, [selectedStock, sectorStocks])

  const fetchNews = async (stockName) => {
    setLoadingNews(true)
    try {
      const response = await fetch(`http://localhost:3000/api/news/${encodeURIComponent(stockName)}`)
      const data = await response.json()
      setNews(data.articles || [])
    } catch (error) {
      console.error('Failed to fetch news:', error)
      setNews([])
    }
    setLoadingNews(false)
  }

  const displayNews = news.length > 0 ? news : []

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

         {loadingNews && <div style={{ fontSize: '12px', color: '#999', padding: '10px' }}>뉴스 로딩 중...</div>}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
           {displayNews.map((article, idx) => (
             <a 
               key={idx}
               href={article.url}
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
                 <span style={{ fontSize: '11px', color: '#1e90ff', fontWeight: '600' }}>
                   {new Date(article.publishedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                 </span>
                 <span style={{ fontSize: '11px', color: '#999' }}>{article.source}</span>
               </div>
               <div style={{ fontSize: '13px', lineHeight: '1.5', color: '#333', fontWeight: '500' }}>
                 {article.title}
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
