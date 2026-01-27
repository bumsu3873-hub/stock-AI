import { useState, useEffect } from 'react'

export default function DailyLimitUp() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [limitUpStocks, setLimitUpStocks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getLimitUpStocks = async (date) => {
    setLoading(true)
    setError(null)
    try {
      const apiUrl = import.meta.env.VITE_API_URL
      const response = await fetch(`${apiUrl}/api/stocks/limit-up?date=${date}`)
      if (!response.ok) throw new Error('Failed to fetch limit-up stocks')
      const data = await response.json()
      setLimitUpStocks(data.stocks || [])
    } catch (err) {
      console.error('Error fetching limit-up stocks:', err)
      setError(err.message)
      setLimitUpStocks([])
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (e) => {
    const date = e.target.value
    setSelectedDate(date)
    getLimitUpStocks(date)
  }

  useEffect(() => {
    getLimitUpStocks(selectedDate)
  }, [])

  return (
    <div className="card">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
        <h2 style={{margin: 0}}>📈 상한가 종목</h2>
        <input 
          type="date" 
          value={selectedDate}
          onChange={handleDateChange}
          max={new Date().toISOString().split('T')[0]}
          style={{
            padding: '8px 12px',
            background: '#242b4a',
            border: '1px solid #667eea',
            borderRadius: '5px',
            color: '#fff',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        />
      </div>
      
      {loading && (
        <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '10px'}}>
          로딩 중...
        </div>
      )}
      
      {error && (
        <div style={{fontSize: '12px', color: '#f43f5e', marginBottom: '10px'}}>
          오류: {error}
        </div>
      )}
      
      {!loading && !error && (
        <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '10px'}}>
          {limitUpStocks.length}개 종목 상한가 달성
        </div>
      )}

      <div style={{maxHeight: '400px', overflowY: 'auto'}}>
        <table>
          <thead>
            <tr>
              <th style={{textAlign: 'left'}}>종목명</th>
              <th>상한가 도달</th>
              <th>현재가</th>
              <th>거래량</th>
            </tr>
          </thead>
          <tbody>
            {limitUpStocks.map((stock, idx) => (
              <tr key={idx} style={{borderBottom: '1px solid #242b4a'}}>
                <td style={{textAlign: 'left', fontWeight: 'bold'}}>{stock.name}</td>
                <td style={{color: '#f43f5e', fontSize: '13px'}}>{stock.limitTime}</td>
                <td className="price-up" style={{fontWeight: 'bold'}}>
                  {stock.currentPrice.toLocaleString()}원
                  <div style={{fontSize: '11px', marginTop: '2px'}}>
                    +{stock.change.toLocaleString()} (+{stock.changeRate}%)
                  </div>
                </td>
                <td style={{fontSize: '13px'}}>{(stock.volume / 10000).toFixed(0)}만</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
