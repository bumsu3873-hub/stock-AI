import { useState, useEffect } from 'react'

export default function StockChart({ price }) {
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    if (price && price > 0) {
      setChartData(prev => {
        const newData = [...prev, price].slice(-30)
        return newData
      })
    }
  }, [price])

  if (!chartData || chartData.length === 0) {
    return (
      <div className="card">
        <h2>📊 실시간 차트</h2>
        <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
          데이터를 수집 중입니다...
        </div>
      </div>
    )
  }

  const maxPrice = Math.max(...chartData)
  const minPrice = Math.min(...chartData)
  const priceRange = maxPrice - minPrice === 0 ? 1 : maxPrice - minPrice

  return (
    <div className="card">
      <h2>📊 실시간 차트</h2>
      <div className="stock-chart">
        {chartData.map((value, idx) => {
          const height = ((value - minPrice) / priceRange) * 100
          return (
            <div 
              key={idx} 
              className="bar" 
              style={{ height: `${Math.max(height, 5)}%` }}
              title={`${value.toLocaleString()}원`}
            />
          )
        })}
      </div>
      <div style={{textAlign: 'center', marginTop: '10px', fontSize: '12px', opacity: 0.7}}>
        최근 30건 데이터
      </div>
    </div>
  )
}
