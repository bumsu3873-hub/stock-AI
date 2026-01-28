import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { predictPrice, getMarketSentiment } from '../utils/pricePredictor'

export default function PricePredictionPanel({ historicalData = [], currentPrice = 0 }) {
  const [predictions, setPredictions] = useState([])
  const [sentiment, setSentiment] = useState(null)
  const [method, setMethod] = useState('linear')

  useEffect(() => {
    if (historicalData.length < 20) return

    const prices = historicalData.map(d => d.price)

    const pred = predictPrice(prices, method)
    setPredictions(pred)

    const sent = getMarketSentiment(prices)
    setSentiment(sent)
  }, [historicalData, method])

  const chartData = [
    { day: 'Now', price: currentPrice },
    ...predictions.map(p => ({
      day: `+${p.day}d`,
      price: Math.round(p.predictedPrice),
      confidence: p.confidence
    }))
  ]

  return (
    <div style={{
      background: '#14181f',
      borderRadius: '8px',
      padding: '20px',
      marginTop: '20px'
    }}>
      <h3 style={{ margin: '0 0 20px 0', fontSize: '16px' }}>🔮 주가 예측</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
        <div>
          <label style={{ fontSize: '12px', opacity: 0.7 }}>예측 방법</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              background: '#2a2f4a',
              color: '#fff',
              border: '1px solid #4a5568',
              borderRadius: '4px',
              marginTop: '5px'
            }}
          >
            <option value="linear">선형 회귀</option>
            <option value="exponential">지수 평활</option>
            <option value="moving_average">이동평균</option>
          </select>
        </div>

        {sentiment && (
          <div>
            <label style={{ fontSize: '12px', opacity: 0.7 }}>시장 심리</label>
            <div
              style={{
                width: '100%',
                padding: '8px',
                background: sentiment.sentiment.color + '20',
                color: sentiment.sentiment.color,
                border: `1px solid ${sentiment.sentiment.color}`,
                borderRadius: '4px',
                marginTop: '5px',
                textAlign: 'center',
                fontWeight: 'bold'
              }}
            >
              {sentiment.sentiment.text}
            </div>
          </div>
        )}
      </div>

      {sentiment && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px',
          marginBottom: '20px'
        }}>
          <div style={{ background: '#2a2f4a', padding: '12px', borderRadius: '4px' }}>
            <div style={{ fontSize: '11px', opacity: 0.7 }}>모멘텀</div>
            <div style={{
              fontSize: '16px',
              fontWeight: 'bold',
              marginTop: '5px',
              color: sentiment.momentum >= 0 ? '#00ff00' : '#ff4757'
            }}>
              {sentiment.momentum >= 0 ? '+' : ''}{sentiment.momentum.toFixed(0)}원
            </div>
          </div>

          <div style={{ background: '#2a2f4a', padding: '12px', borderRadius: '4px' }}>
            <div style={{ fontSize: '11px', opacity: 0.7 }}>변동성</div>
            <div style={{
              fontSize: '16px',
              fontWeight: 'bold',
              marginTop: '5px',
              color: '#ffaa00'
            }}>
              {sentiment.volatility.toFixed(2)}%
            </div>
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2f4a" />
          <XAxis
            dataKey="day"
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
          />
          <Legend wrapperStyle={{ color: '#888' }} />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#1e90ff"
            strokeWidth={2}
            dot={{ fill: '#1e90ff', r: 4 }}
            name="예측 주가"
          />
        </LineChart>
      </ResponsiveContainer>

      <div style={{ marginTop: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>상세 예측</h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '10px'
        }}>
          {predictions.map((pred, idx) => (
            <div key={idx} style={{
              background: '#2a2f4a',
              padding: '12px',
              borderRadius: '4px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '11px', opacity: 0.7 }}>+{pred.day}일</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '5px' }}>
                {Math.round(pred.predictedPrice).toLocaleString()}원
              </div>
              <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '5px' }}>
                신뢰도: {pred.confidence.toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
