function LeftSidebar({ selectedSector, onSectorChange, sectorStocks, onStockSelect }) {
  const sectors = ['IT', '금융', '자동차', '화학', '전기', '건설', '의약']

  return (
    <div style={{
      width: '320px',
      borderRight: '1px solid #1e2330',
      background: '#0f1419',
      overflow: 'y',
      padding: '20px'
    }}>
      <h2 style={{ fontSize: '14px', textTransform: 'uppercase', opacity: 0.7, marginBottom: '20px' }}>
        📊 섹터
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
        {sectors.map(sector => (
          <button
            key={sector}
            onClick={() => onSectorChange(sector)}
            style={{
              padding: '12px 15px',
              background: selectedSector === sector ? '#1e90ff' : 'transparent',
              border: selectedSector === sector ? 'none' : '1px solid #1e2330',
              color: '#fff',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: selectedSector === sector ? 'bold' : 'normal',
              transition: 'all 0.2s'
            }}
          >
            {sector}
          </button>
        ))}
      </div>

      <h3 style={{ fontSize: '12px', opacity: 0.7, marginBottom: '15px', textTransform: 'uppercase' }}>
        🏆 상위 종목
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {sectorStocks.slice(0, 5).map((stock, idx) => (
          <div
            key={stock.code}
            onClick={() => onStockSelect(stock.code)}
            style={{
              padding: '12px',
              background: '#14181f',
              border: '1px solid #1e2330',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              borderLeft: idx === 0 ? '3px solid #1e90ff' : '3px solid transparent'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{idx + 1}. {stock.name}</span>
              <span style={{ fontSize: '11px', opacity: 0.7 }}>{stock.code}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                {stock.price.toLocaleString()}원
              </span>
              <span style={{
                fontSize: '11px',
                color: stock.change >= 0 ? '#ff4757' : '#1e90ff'
              }}>
                {stock.change >= 0 ? '▲' : '▼'} {Math.abs(parseFloat(stock.changePercent))}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LeftSidebar
