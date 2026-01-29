import { ChevronRight } from 'lucide-react'

function LeftSidebar({ selectedSector, onSectorChange, sectorStocks, onStockSelect }) {
  const sectors = ['IT', '금융', '자동차', '화학', '전기', '건설', '의약']

  return (
    <div style={{
      width: '300px',
      background: '#fff',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
      border: '1px solid #f0f0f0',
      height: 'fit-content',
      maxHeight: 'calc(100vh - 40px)',
      overflowY: 'auto',
      position: 'sticky',
      top: '20px'
    }}>
      <h2 style={{ 
        fontSize: '16px', 
        fontWeight: '700', 
        color: '#1a1f3a', 
        marginBottom: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{ width: '4px', height: '16px', background: '#1e90ff', borderRadius: '2px' }}></span>
        섹터별 인기 종목
      </h2>

      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '8px', 
        marginBottom: '25px' 
      }}>
        {sectors.map(sector => (
          <button
            key={sector}
            onClick={() => onSectorChange(sector)}
            style={{
              padding: '8px 14px',
              background: selectedSector === sector ? '#1e90ff' : '#f5f7fa',
              border: 'none',
              color: selectedSector === sector ? '#fff' : '#666',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: selectedSector === sector ? '600' : '500',
              transition: 'all 0.2s ease',
              boxShadow: selectedSector === sector ? '0 4px 10px rgba(30, 144, 255, 0.3)' : 'none'
            }}
          >
            {sector}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sectorStocks.slice(0, 5).map((stock, idx) => {
          const isUp = stock.change >= 0
          return (
            <div
              key={stock.code}
              onClick={() => onStockSelect(stock.code)}
              style={{
                padding: '15px',
                background: '#fff',
                border: '1px solid #f0f0f0',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(5px)'
                e.currentTarget.style.borderColor = '#1e90ff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)'
                e.currentTarget.style.borderColor = '#f0f0f0'
              }}
            >
              <div style={{ 
                position: 'absolute', 
                left: 0, 
                top: 0, 
                bottom: 0, 
                width: '4px', 
                background: idx < 3 ? '#1e90ff' : 'transparent' 
              }}></div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', paddingLeft: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ 
                    fontSize: '12px', 
                    fontWeight: '700', 
                    color: idx < 3 ? '#1e90ff' : '#999',
                    width: '15px'
                  }}>
                    {idx + 1}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>{stock.name}</span>
                </div>
                <span style={{ fontSize: '11px', color: '#999' }}>{stock.code}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '8px' }}>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#1a1f3a' }}>
                  {stock.price.toLocaleString()}원
                </span>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  color: isUp ? '#ff4757' : '#1e90ff',
                  background: isUp ? 'rgba(255, 71, 87, 0.05)' : 'rgba(30, 144, 255, 0.05)',
                  padding: '4px 8px',
                  borderRadius: '6px'
                }}>
                  <span style={{ fontSize: '12px', fontWeight: '600' }}>
                    {isUp ? '▲' : '▼'} {Math.abs(parseFloat(stock.changePercent))}%
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      <div style={{ 
        marginTop: '20px', 
        textAlign: 'center', 
        padding: '10px', 
        color: '#1e90ff', 
        fontSize: '13px', 
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '5px'
      }}>
        더 보기 <ChevronRight size={14} />
      </div>
    </div>
  )
}

export default LeftSidebar
