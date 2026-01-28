import { useState, useEffect } from 'react'
import {
  LineChart, Line, AreaChart, Area, ComposedChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  calculateRSI, calculateMACD, calculateBollingerBands,
  calculateSMA, calculateEMA
} from '../utils/technicalIndicators'

export default function AdvancedChart({ stockCode, historicalData = [] }) {
  const [chartData, setChartData] = useState([])
  const [activeIndicators, setActiveIndicators] = useState({
    sma20: false,
    sma50: false,
    ema12: false,
    rsi: false,
    macd: false,
    bb: false
  })
  const [timeframe, setTimeframe] = useState('1d')

  useEffect(() => {
    if (!historicalData || historicalData.length === 0) return

    const prices = historicalData.map(d => d.price)
    let data = [...historicalData]

    if (activeIndicators.sma20) {
      const sma20 = calculateSMA(prices, 20)
      data = data.map((d, i) => ({
        ...d,
        sma20: sma20[i - Math.max(0, prices.length - sma20.length)]
      }))
    }

    if (activeIndicators.sma50) {
      const sma50 = calculateSMA(prices, 50)
      data = data.map((d, i) => ({
        ...d,
        sma50: sma50[i - Math.max(0, prices.length - sma50.length)]
      }))
    }

    if (activeIndicators.ema12) {
      const ema12 = calculateEMA(prices, 12)
      data = data.map((d, i) => ({
        ...d,
        ema12: ema12[i - Math.max(0, prices.length - ema12.length)]
      }))
    }

    if (activeIndicators.bb) {
      const bb = calculateBollingerBands(prices, 20, 2)
      data = data.map((d, i) => ({
        ...d,
        bbUpper: bb[i - Math.max(0, prices.length - bb.length)]?.upper,
        bbMiddle: bb[i - Math.max(0, prices.length - bb.length)]?.middle,
        bbLower: bb[i - Math.max(0, prices.length - bb.length)]?.lower
      }))
    }

    setChartData(data.slice(-100))
  }, [historicalData, activeIndicators])

  const toggleIndicator = (indicator) => {
    setActiveIndicators(prev => ({
      ...prev,
      [indicator]: !prev[indicator]
    }))
  }

  return (
    <div style={{ width: '100%', background: '#14181f', borderRadius: '8px', padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>📊 고급 차트 분석</h3>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
          {['1d', '1w', '1m'].map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              style={{
                padding: '6px 12px',
                background: timeframe === tf ? '#1e90ff' : '#2a2f4a',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {tf === '1d' ? '일' : tf === '1w' ? '주' : '월'}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {[
            { key: 'sma20', label: 'SMA(20)' },
            { key: 'sma50', label: 'SMA(50)' },
            { key: 'ema12', label: 'EMA(12)' },
            { key: 'rsi', label: 'RSI' },
            { key: 'macd', label: 'MACD' },
            { key: 'bb', label: '볼린저밴드' }
          ].map(indicator => (
            <button
              key={indicator.key}
              onClick={() => toggleIndicator(indicator.key)}
              style={{
                padding: '8px 12px',
                background: activeIndicators[indicator.key] ? '#1e90ff' : '#2a2f4a',
                color: '#fff',
                border: activeIndicators[indicator.key] ? '1px solid #1e90ff' : '1px solid #4a5568',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: activeIndicators[indicator.key] ? 'bold' : 'normal'
              }}
            >
              {indicator.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
          />
          <Legend wrapperStyle={{ color: '#888' }} />

          <Area
            type="monotone"
            dataKey="price"
            fill="#1e90ff"
            stroke="#1e90ff"
            strokeWidth={2}
            opacity={0.3}
            name="종가"
          />

          {activeIndicators.bb && (
            <>
              <Line
                type="monotone"
                dataKey="bbUpper"
                stroke="#ff9999"
                strokeWidth={1}
                dot={false}
                name="상단밴드"
              />
              <Line
                type="monotone"
                dataKey="bbLower"
                stroke="#99ccff"
                strokeWidth={1}
                dot={false}
                name="하단밴드"
              />
            </>
          )}

          {activeIndicators.sma20 && (
            <Line
              type="monotone"
              dataKey="sma20"
              stroke="#ffaa00"
              strokeWidth={1}
              dot={false}
              name="SMA(20)"
            />
          )}

          {activeIndicators.sma50 && (
            <Line
              type="monotone"
              dataKey="sma50"
              stroke="#ff5500"
              strokeWidth={1}
              dot={false}
              name="SMA(50)"
            />
          )}

          {activeIndicators.ema12 && (
            <Line
              type="monotone"
              dataKey="ema12"
              stroke="#00ff00"
              strokeWidth={1}
              dot={false}
              name="EMA(12)"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {activeIndicators.rsi && (
        <div style={{ marginTop: '30px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>RSI (14)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2f4a" />
              <XAxis
                dataKey="time"
                stroke="#888"
                style={{ fontSize: '12px' }}
                tick={{ fill: '#888' }}
              />
              <YAxis
                domain={[0, 100]}
                stroke="#888"
                style={{ fontSize: '12px' }}
                tick={{ fill: '#888' }}
              />
              <Tooltip
                contentStyle={{
                  background: '#1a1f2e',
                  border: '1px solid #1e90ff',
                  borderRadius: '4px'
                }}
              />
              <Line
                type="monotone"
                dataKey="rsi"
                stroke="#9999ff"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
