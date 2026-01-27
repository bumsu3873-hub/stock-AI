import { useState, useEffect } from 'react'

export default function StockChart({ price }) {
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    setChartData(prev => {
      const newData = [...prev, price].slice(-30)
      return newData
    })
  }, [price])

  const maxPrice = Math.max(...chartData, 72000)
  const minPrice = Math.min(...chartData, 70000)

  return (
    <div className="card">
      <h2>📊 실시간 차트</h2>
      <div className="stock-chart">
        {chartData.map((value, idx) => {
          const height = ((value - minPrice) / (maxPrice - minPrice)) * 100
          return (
            <div 
              key={idx} 
              className="bar" 
              style={{ height: `${height}%` }}
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
