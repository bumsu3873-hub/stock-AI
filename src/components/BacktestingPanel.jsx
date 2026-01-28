import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { runBacktest } from '../utils/backtesting'

export default function BacktestingPanel({ historicalData = [] }) {
  const [backtestResult, setBacktestResult] = useState(null)
  const [selectedStrategy, setSelectedStrategy] = useState('sma_crossover')
  const [initialCapital, setInitialCapital] = useState(10000000)

  useEffect(() => {
    if (historicalData.length < 50) return

    const prices = historicalData.map(d => d.price)
    const dates = historicalData.map(d => d.date || d.time)

    const result = runBacktest(prices, dates, initialCapital, selectedStrategy)
    setBacktestResult(result)
  }, [historicalData, selectedStrategy, initialCapital])

  if (!backtestResult) {
    return <div style={{ padding: '20px', color: '#888' }}>데이터 로딩 중...</div>
  }

  const chartData = backtestResult.portfolioValue.map((value, idx) => ({
    time: idx,
    value: Math.round(value)
  }))

  return (
    <div style={{
      background: '#14181f',
      borderRadius: '8px',
      padding: '20px',
      marginTop: '20px'
    }}>
      <h3 style={{ margin: '0 0 20px 0', fontSize: '16px' }}>🔄 백테스팅</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '20px' }}>
        <div>
          <label style={{ fontSize: '12px', opacity: 0.7 }}>전략 선택</label>
          <select
            value={selectedStrategy}
            onChange={(e) => setSelectedStrategy(e.target.value)}
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
            <option value="sma_crossover">SMA 교차 (20/50)</option>
            <option value="rsi_overbought">RSI 역추적</option>
            <option value="bollinger_bands">볼린저 밴드</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '12px', opacity: 0.7 }}>초기 자본금 (원)</label>
          <input
            type="number"
            value={initialCapital}
            onChange={(e) => setInitialCapital(parseInt(e.target.value))}
            style={{
              width: '100%',
              padding: '8px',
              background: '#2a2f4a',
              color: '#fff',
              border: '1px solid #4a5568',
              borderRadius: '4px',
              marginTop: '5px',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px',
        marginBottom: '20px'
      }}>
        <div style={{ background: '#2a2f4a', padding: '12px', borderRadius: '4px' }}>
          <div style={{ fontSize: '11px', opacity: 0.7 }}>총 수익률</div>
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            marginTop: '5px',
            color: backtestResult.totalReturn >= 0 ? '#00ff00' : '#ff4757'
          }}>
            {backtestResult.totalReturn > 0 ? '+' : ''}{backtestResult.totalReturn}%
          </div>
        </div>

        <div style={{ background: '#2a2f4a', padding: '12px', borderRadius: '4px' }}>
          <div style={{ fontSize: '11px', opacity: 0.7 }}>총 거래수</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '5px' }}>
            {backtestResult.totalTrades}
          </div>
        </div>

        <div style={{ background: '#2a2f4a', padding: '12px', borderRadius: '4px' }}>
          <div style={{ fontSize: '11px', opacity: 0.7 }}>승률</div>
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            marginTop: '5px',
            color: backtestResult.winRate >= 50 ? '#00ff00' : '#ff4757'
          }}>
            {backtestResult.winRate}%
          </div>
        </div>

        <div style={{ background: '#2a2f4a', padding: '12px', borderRadius: '4px' }}>
          <div style={{ fontSize: '11px', opacity: 0.7 }}>Sharpe Ratio</div>
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            marginTop: '5px',
            color: backtestResult.sharpeRatio > 1 ? '#00ff00' : '#ffaa00'
          }}>
            {backtestResult.sharpeRatio}
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px',
        marginBottom: '20px'
      }}>
        <div style={{ background: '#2a2f4a', padding: '12px', borderRadius: '4px' }}>
          <div style={{ fontSize: '11px', opacity: 0.7 }}>최대 낙폭</div>
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            marginTop: '5px',
            color: '#ff4757'
          }}>
            -{backtestResult.maxDrawdown}%
          </div>
        </div>

        <div style={{ background: '#2a2f4a', padding: '12px', borderRadius: '4px' }}>
          <div style={{ fontSize: '11px', opacity: 0.7 }}>최종 자산</div>
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            marginTop: '5px',
            color: '#1e90ff'
          }}>
            {(backtestResult.endValue / 1000000).toFixed(1)}M
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
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
              borderRadius: '4px'
            }}
          />
          <Legend wrapperStyle={{ color: '#888' }} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#1e90ff"
            strokeWidth={2}
            dot={false}
            name="포트폴리오 가치"
          />
        </LineChart>
      </ResponsiveContainer>

      <div style={{ marginTop: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>거래 내역</h4>
        <div style={{
          maxHeight: '200px',
          overflowY: 'auto',
          background: '#1a1f2e',
          borderRadius: '4px',
          padding: '10px'
        }}>
          {backtestResult.transactions.slice(-10).map((trade, idx) => (
            <div key={idx} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px',
              borderBottom: '1px solid #2a2f4a',
              fontSize: '12px'
            }}>
              <span>{trade.date}</span>
              <span style={{
                color: trade.type === 'BUY' ? '#ff4757' : '#1e90ff'
              }}>
                {trade.type === 'BUY' ? '매수' : '매도'}
              </span>
              <span>{trade.price.toLocaleString()}원</span>
              <span>{trade.shares}주</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
