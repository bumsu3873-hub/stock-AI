function Header({ indices }) {
  return (
    <div style={{
      padding: '20px 30px',
      borderBottom: '1px solid #1e2330',
      background: '#0a0e14'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
          📈 StockDashboard
        </h1>
        <div style={{ fontSize: '12px', opacity: 0.7 }}>
          {new Date().toLocaleString('ko-KR')}
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '30px',
        overflow: 'x'
      }}>
        {indices.map(index => (
          <div key={index.code} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>{index.name}</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {index.price.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}
              </div>
            </div>
            <div style={{
              color: index.change >= 0 ? '#ff4757' : '#1e90ff',
              fontSize: '14px'
            }}>
              <div>{index.change >= 0 ? '▲' : '▼'} {Math.abs(index.change).toFixed(2)}</div>
              <div style={{ fontSize: '12px' }}>
                {index.changePercent > 0 ? '+' : ''}{index.changePercent}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Header
