import { useState } from 'react'

export default function StockSearch() {
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    
    if (!searchKeyword.trim()) {
      setSearchResults([])
      setHasSearched(false)
      return
    }

    setIsLoading(true)
    setHasSearched(true)

    try {
      const response = await fetch(
        `/api/stocks/search?name=${encodeURIComponent(searchKeyword)}`
      )
      const data = await response.json()
      setSearchResults(data.results || [])
    } catch (error) {
      console.error('검색 실패:', error)
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setSearchKeyword('')
    setSearchResults([])
    setHasSearched(false)
  }

  return (
    <div style={{ marginBottom: '30px', padding: '20px', background: '#1a1f3a', borderRadius: '10px' }}>
      <h2>📊 종목 검색</h2>
      
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
        <input
          type="text"
          placeholder="종목명 또는 코드로 검색 (예: 삼성전자, 005930)"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          style={{
            flex: 1,
            padding: '12px',
            background: '#2a2f4a',
            color: '#fff',
            border: '1px solid #4a90e2',
            borderRadius: '5px',
            fontSize: '14px'
          }}
        />
        <button
          type="submit"
          style={{
            padding: '12px 30px',
            background: '#4a90e2',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          🔍 검색
        </button>
        {searchKeyword && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              padding: '12px 20px',
              background: '#666',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            ✕ 초기화
          </button>
        )}
      </form>

      {isLoading && (
        <div style={{ marginTop: '20px', textAlign: 'center', color: '#4a90e2' }}>
          ⏳ 검색 중...
        </div>
      )}

      {hasSearched && !isLoading && searchResults.length === 0 && (
        <div style={{ marginTop: '20px', color: '#999' }}>
          "
          {searchKeyword}
          "에 해당하는 종목이 없습니다.
        </div>
      )}

      {searchResults.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>검색 결과 ({searchResults.length}개)</h3>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginTop: '15px'
            }}
          >
            <thead>
              <tr style={{ borderBottom: '2px solid #4a90e2' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#4a90e2' }}>
                  종목명
                </th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#4a90e2' }}>
                  코드
                </th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#4a90e2' }}>
                  현재가
                </th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#4a90e2' }}>
                  등락폭
                </th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#4a90e2' }}>
                  등락률
                </th>
              </tr>
            </thead>
            <tbody>
              {searchResults.map((stock) => {
                const isUp = stock.change >= 0
                const color = isUp ? '#4ade80' : '#ff6b6b'
                return (
                  <tr
                    key={stock.code}
                    style={{
                      borderBottom: '1px solid #2a2f4a',
                      background: 'rgba(74, 144, 226, 0.1)'
                    }}
                  >
                    <td style={{ padding: '12px' }}>
                      <strong>{stock.name}</strong>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#999' }}>
                      {stock.code}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                      {stock.price?.toLocaleString() || '-'}원
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', color }}>
                      {isUp ? '▲' : '▼'} {Math.abs(stock.change)?.toLocaleString() || '0'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', color }}>
                      {isUp ? '+' : ''}{stock.changePercent}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
