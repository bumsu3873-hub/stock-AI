import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

export default function CandlestickChart({ historicalData = [] }) {
  if (!historicalData || historicalData.length === 0) {
    return <div style={{ padding: '20px', color: '#888' }}>데이터 없음</div>
  }

  const candleData = historicalData.map(d => {
    const open = d.price * (1 + (Math.random() - 0.5) * 0.02)
    const close = d.price
    const high = Math.max(open, close) * (1 + Math.random() * 0.01)
    const low = Math.min(open, close) * (1 - Math.random() * 0.01)

    return {
      time: d.time,
      open: Math.round(open),
      close: Math.round(close),
      high: Math.round(high),
      low: Math.round(low),
      color: close >= open ? '#ff4757' : '#1e90ff'
    }
  })

  return (
    <div style={{
      background: '#14181f',
      borderRadius: '8px',
      padding: '20px',
      marginTop: '20px'
    }}>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>🕯️ 캔들스틱 차트</h3>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={candleData}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2f4a" />
          <XAxis
            dataKey="time"
            stroke="#888"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#888' }}
          />
          <YAxis stroke="#888" style={{ fontSize: '12px' }} tick={{ fill: '#888' }} />
          <Tooltip
            contentStyle={{
              background: '#1a1f2e',
              border: '1px solid #1e90ff',
              borderRadius: '4px',
              color: '#fff'
            }}
            content={({ active, payload }) => {
              if (active && payload && payload[0]) {
                const data = payload[0].payload
                return (
                  <div style={{ padding: '8px', fontSize: '12px' }}>
                    <div>시가: {data.open.toLocaleString()}원</div>
                    <div>종가: {data.close.toLocaleString()}원</div>
                    <div>고가: {data.high.toLocaleString()}원</div>
                    <div>저가: {data.low.toLocaleString()}원</div>
                  </div>
                )
              }
              return null
            }}
          />
          <Bar
            dataKey="high"
            fill="none"
            shape={<CandleStick />}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px',
        marginTop: '15px'
      }}>
        <div style={{ background: '#2a2f4a', padding: '10px', borderRadius: '4px' }}>
          <div style={{ fontSize: '11px', opacity: 0.7 }}>상승 캔들</div>
          <div style={{ color: '#ff4757', fontSize: '14px', fontWeight: 'bold', marginTop: '5px' }}>●</div>
        </div>
        <div style={{ background: '#2a2f4a', padding: '10px', borderRadius: '4px' }}>
          <div style={{ fontSize: '11px', opacity: 0.7 }}>하강 캔들</div>
          <div style={{ color: '#1e90ff', fontSize: '14px', fontWeight: 'bold', marginTop: '5px' }}>●</div>
        </div>
      </div>
    </div>
  )
}

function CandleStick(props) {
  const { x, y, width, payload } = props

  if (!payload) return null

  const { open, close, high, low } = payload
  const yScale = props.yAxis?.scale

  if (!yScale) return null

  const yOpen = yScale(open)
  const yClose = yScale(close)
  const yHigh = yScale(high)
  const yLow = yScale(low)

  const color = close >= open ? '#ff4757' : '#1e90ff'
  const bodyTop = Math.min(yOpen, yClose)
  const bodyHeight = Math.abs(yOpen - yClose) || 1

  return (
    <g>
      <line x1={x + width / 2} y1={yHigh} x2={x + width / 2} y2={yLow} stroke={color} strokeWidth={1} />
      <rect
        x={x + width / 4}
        y={bodyTop}
        width={width / 2}
        height={bodyHeight}
        fill={color}
        stroke={color}
        opacity={0.7}
      />
    </g>
  )
}
