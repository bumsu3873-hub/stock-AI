import { TrendingUp, TrendingDown, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'

function Header({ indices = [], lastUpdateTime = new Date() }) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const isMarketOpen = () => {
    const dayOfWeek = currentTime.getDay()
    const hours = currentTime.getHours()
    const minutes = currentTime.getMinutes()
    
    if (dayOfWeek === 0 || dayOfWeek === 6) return false
    
    const currentTimeNum = hours * 100 + minutes
    return currentTimeNum >= 900 && currentTimeNum <= 1530
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
  }

  const formatUpdateTime = (date) => {
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)
    
    if (diff < 60) return '방금 전'
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
    return formatTime(date)
  }

  if (!indices || indices.length === 0) {
    return (
      <div style={{
        padding: '20px 0',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: '800', 
            margin: 0,
            color: '#1a1f3a',
            letterSpacing: '-0.5px'
          }}>
            Stock AI
          </h1>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{ 
              fontSize: '13px', 
              color: '#666',
              background: '#fff',
              padding: '8px 14px',
              borderRadius: '20px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Clock size={14} />
              {formatTime(currentTime)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      padding: '20px 0',
      marginBottom: '10px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: '800', 
          margin: 0,
          color: '#1a1f3a',
          letterSpacing: '-0.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
           <span style={{ color: isMarketOpen() ? '#ff4757' : '#999', fontSize: '20px' }}>●</span> Stock AI
        </h1>
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{ 
            fontSize: '12px', 
            color: isMarketOpen() ? '#ff4757' : '#999',
            background: isMarketOpen() ? '#ffe8e8' : '#f0f0f0',
            padding: '6px 12px',
            borderRadius: '20px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            fontWeight: '600'
          }}>
            {isMarketOpen() ? '🔴 장중' : '🔵 장마감'}
          </div>
          <div style={{ 
            fontSize: '13px', 
            color: '#666',
            background: '#fff',
            padding: '8px 14px',
            borderRadius: '20px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Clock size={14} />
            {formatTime(currentTime)}
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '15px'
      }}>
        {indices.map(index => {
          const isUp = index.change >= 0
          return (
            <div key={index.code} style={{
              background: '#fff',
              padding: '20px',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              border: '1px solid #f0f0f0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'default'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.06)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)'
            }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#666' 
                }}>
                  {index.name}
                </span>
                {isUp ? 
                  <TrendingUp size={16} color="#ff4757" /> : 
                  <TrendingDown size={16} color="#1e90ff" />
                }
              </div>
              
              <div style={{ 
                fontSize: '24px', 
                fontWeight: '800', 
                color: '#1a1f3a',
                marginBottom: '5px'
              }}>
                {typeof index.price === 'number' 
                  ? index.price.toLocaleString('ko-KR', { maximumFractionDigits: 2 })
                  : '0'
                }
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: '600',
                color: isUp ? '#ff4757' : '#1e90ff'
              }}>
                <span>{isUp ? '▲' : '▼'} {Math.abs(index.change).toFixed(2)}</span>
                <span style={{ 
                  background: isUp ? 'rgba(255, 71, 87, 0.1)' : 'rgba(30, 144, 255, 0.1)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '11px'
                }}>
                  {parseFloat(index.changePercent) > 0 ? '+' : ''}{index.changePercent}%
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{
        fontSize: '12px',
        color: '#999',
        textAlign: 'right',
        paddingTop: '10px',
        borderTop: '1px solid #f0f0f0'
      }}>
        마지막 업데이트: {formatUpdateTime(lastUpdateTime)}
      </div>
    </div>
  )
}

export default Header
