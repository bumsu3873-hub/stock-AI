function Portfolio({ portfolio }) {
  if (!portfolio || portfolio.length === 0) {
    return (
      <div style={{ padding: '20px', background: '#1a1f3a', borderRadius: '10px', marginTop: '20px' }}>
        <h2>📊 포트폴리오</h2>
        <div style={{ textAlign: 'center', opacity: 0.7, paddingTop: '20px' }}>
          보유 중인 주식이 없습니다.
        </div>
      </div>
    )
  }

  let totalInvestment = 0
  let totalCurrentValue = 0

  const holdings = portfolio
    .filter(item => item.hldg_qty && parseInt(item.hldg_qty) > 0)
    .map(item => {
      const avgPrice = parseFloat(item.pchs_avg_pric)
      const currentPrice = parseFloat(item.prpr)
      const quantity = parseInt(item.hldg_qty)
      const investmentValue = avgPrice * quantity
      const currentValue = currentPrice * quantity
      const gainLoss = currentValue - investmentValue
      const gainLossPercent = investmentValue > 0 ? (gainLoss / investmentValue * 100).toFixed(2) : 0

      totalInvestment += investmentValue
      totalCurrentValue += currentValue

      return {
        code: item.pdno,
        name: item.prdt_name,
        quantity,
        avgPrice,
        currentPrice,
        investmentValue,
        currentValue,
        gainLoss,
        gainLossPercent
      }
    })

  const totalGainLoss = totalCurrentValue - totalInvestment
  const totalGainLossPercent = totalInvestment > 0 ? (totalGainLoss / totalInvestment * 100).toFixed(2) : 0

  return (
    <div style={{ padding: '20px', background: '#1a1f3a', borderRadius: '10px', marginTop: '20px' }}>
      <h2>📊 포트폴리오</h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '15px',
        marginBottom: '20px'
      }}>
        <div style={{ padding: '15px', background: '#2a2f4a', borderRadius: '5px' }}>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>총 투자액</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '5px' }}>
            {totalInvestment.toLocaleString()}원
          </div>
        </div>
        <div style={{ padding: '15px', background: '#2a2f4a', borderRadius: '5px' }}>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>현재 평가액</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '5px' }}>
            {totalCurrentValue.toLocaleString()}원
          </div>
        </div>
        <div style={{
          padding: '15px',
          background: '#2a2f4a',
          borderRadius: '5px'
        }}>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>손익</div>
          <div style={{
            fontSize: '18px',
            fontWeight: 'bold',
            marginTop: '5px',
            color: totalGainLoss >= 0 ? '#ff6b6b' : '#4a90e2'
          }}>
            {totalGainLoss >= 0 ? '+' : ''}{totalGainLoss.toLocaleString()}원
          </div>
          <div style={{
            fontSize: '12px',
            marginTop: '5px',
            color: totalGainLoss >= 0 ? '#ff6b6b' : '#4a90e2'
          }}>
            {totalGainLossPercent >= 0 ? '+' : ''}{totalGainLossPercent}%
          </div>
        </div>
      </div>

      {holdings.length > 0 && (
        <div style={{
          overflowX: 'auto',
          marginTop: '20px'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '12px'
          }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2f4a' }}>
                <th style={{ padding: '10px', textAlign: 'left', opacity: 0.7 }}>종목</th>
                <th style={{ padding: '10px', textAlign: 'right', opacity: 0.7 }}>보유수량</th>
                <th style={{ padding: '10px', textAlign: 'right', opacity: 0.7 }}>평균가</th>
                <th style={{ padding: '10px', textAlign: 'right', opacity: 0.7 }}>현재가</th>
                <th style={{ padding: '10px', textAlign: 'right', opacity: 0.7 }}>평가액</th>
                <th style={{ padding: '10px', textAlign: 'right', opacity: 0.7 }}>손익</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map(holding => (
                <tr key={holding.code} style={{ borderBottom: '1px solid #2a2f4a' }}>
                  <td style={{ padding: '10px' }}>
                    <div style={{ fontWeight: 'bold' }}>{holding.name}</div>
                    <div style={{ opacity: 0.7, fontSize: '11px' }}>{holding.code}</div>
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>
                    {holding.quantity.toLocaleString()}주
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>
                    {holding.avgPrice.toLocaleString()}원
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right', color: '#4a90e2' }}>
                    {holding.currentPrice.toLocaleString()}원
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>
                    {holding.currentValue.toLocaleString()}원
                  </td>
                  <td style={{
                    padding: '10px',
                    textAlign: 'right',
                    color: holding.gainLoss >= 0 ? '#ff6b6b' : '#4a90e2',
                    fontWeight: 'bold'
                  }}>
                    <div>{holding.gainLoss >= 0 ? '+' : ''}{holding.gainLoss.toLocaleString()}원</div>
                    <div style={{ fontSize: '11px' }}>
                      {holding.gainLossPercent >= 0 ? '+' : ''}{holding.gainLossPercent}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Portfolio
