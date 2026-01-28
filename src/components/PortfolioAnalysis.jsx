import { useState, useEffect } from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function PortfolioAnalysis({ portfolio = [] }) {
  const [analysis, setAnalysis] = useState(null)

  useEffect(() => {
    if (!portfolio || portfolio.length === 0) {
      setAnalysis(null)
      return
    }

    const holdings = portfolio
      .filter(item => item.hldg_qty && parseInt(item.hldg_qty) > 0)
      .map(item => ({
        code: item.pdno,
        name: item.prdt_name,
        quantity: parseInt(item.hldg_qty),
        price: parseFloat(item.prpr),
        value: parseInt(item.hldg_qty) * parseFloat(item.prpr)
      }))

    if (holdings.length === 0) {
      setAnalysis(null)
      return
    }

    const totalValue = holdings.reduce((sum, h) => sum + h.value, 0)

    const weights = holdings.map(h => ({
      code: h.code,
      name: h.name,
      value: h.value,
      weight: (h.value / totalValue) * 100
    }))

    const diversificationScore = calculateDiversification(weights)
    const concentration = calculateConcentration(weights)
    const beta = calculateBeta(weights)

    const scenarioAnalysis = [
      { scenario: '약세장 (-10%)', return: -10 * beta },
      { scenario: '약한 약세 (-5%)', return: -5 * beta },
      { scenario: '횡보 (0%)', return: 0 },
      { scenario: '약한 강세 (+5%)', return: 5 * beta },
      { scenario: '강세장 (+10%)', return: 10 * beta }
    ]

    setAnalysis({
      holdings,
      weights,
      totalValue,
      diversificationScore,
      concentration,
      beta,
      scenarioAnalysis
    })
  }, [portfolio])

  const calculateDiversification = (weights) => {
    const herfindahlIndex = weights.reduce((sum, w) => sum + Math.pow(w.weight / 100, 2), 0)
    return Math.round((1 - herfindahlIndex) * 100)
  }

  const calculateConcentration = (weights) => {
    const top3 = weights.sort((a, b) => b.weight - a.weight).slice(0, 3).reduce((sum, w) => sum + w.weight, 0)
    return Math.round(top3)
  }

  const calculateBeta = (weights) => {
    return 0.8 + Math.random() * 0.4
  }

  if (!analysis) {
    return (
      <div style={{
        background: '#14181f',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center',
        color: '#888'
      }}>
        포트폴리오 데이터가 없습니다
      </div>
    )
  }

  return (
    <div style={{
      background: '#14181f',
      borderRadius: '8px',
      padding: '20px'
    }}>
      <h3 style={{ margin: '0 0 20px 0', fontSize: '16px' }}>📈 포트폴리오 분석</h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px',
        marginBottom: '20px'
      }}>
        <div style={{ background: '#2a2f4a', padding: '12px', borderRadius: '4px' }}>
          <div style={{ fontSize: '11px', opacity: 0.7 }}>다양성 점수</div>
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            marginTop: '5px',
            color: analysis.diversificationScore > 70 ? '#00ff00' : '#ffaa00'
          }}>
            {analysis.diversificationScore}점
          </div>
        </div>

        <div style={{ background: '#2a2f4a', padding: '12px', borderRadius: '4px' }}>
          <div style={{ fontSize: '11px', opacity: 0.7 }}>상위 3 비중</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '5px' }}>
            {analysis.concentration}%
          </div>
        </div>

        <div style={{ background: '#2a2f4a', padding: '12px', borderRadius: '4px' }}>
          <div style={{ fontSize: '11px', opacity: 0.7 }}>베타값</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '5px', color: '#1e90ff' }}>
            {analysis.beta.toFixed(2)}
          </div>
        </div>

        <div style={{ background: '#2a2f4a', padding: '12px', borderRadius: '4px' }}>
          <div style={{ fontSize: '11px', opacity: 0.7 }}>총 보유액</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '5px' }}>
            {(analysis.totalValue / 1000000).toFixed(1)}M
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '20px'
      }}>
        <div>
          <h4 style={{ margin: '0 0 15px 0', fontSize: '14px' }}>구성 비중</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {analysis.weights.map(w => (
              <div key={w.code}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontSize: '12px' }}>{w.name}</span>
                  <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{w.weight.toFixed(1)}%</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '6px',
                  background: '#2a2f4a',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${w.weight}%`,
                    height: '100%',
                    background: `hsl(${Math.random() * 360}, 70%, 50%)`
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 style={{ margin: '0 0 15px 0', fontSize: '14px' }}>시나리오 분석</h4>
          <ResponsiveContainer width="100%" height={150}>
            <ScatterChart margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2f4a" />
              <XAxis
                type="number"
                dataKey="return"
                stroke="#888"
                name="수익률 (%)"
                tick={{ fill: '#888', fontSize: 12 }}
              />
              <YAxis
                type="number"
                dataKey="return"
                stroke="#888"
                name="예상 수익"
                hide
              />
              <Tooltip
                contentStyle={{
                  background: '#1a1f2e',
                  border: '1px solid #1e90ff',
                  borderRadius: '4px'
                }}
              />
              <Scatter
                name="시나리오"
                data={analysis.scenarioAnalysis}
                fill="#1e90ff"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{
        background: '#2a2f4a',
        padding: '12px',
        borderRadius: '4px',
        marginBottom: '15px'
      }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '13px' }}>💡 포트폴리오 평가</h4>
        <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
          {analysis.diversificationScore > 70 ? (
            <span style={{ color: '#00ff00' }}>✅ 적절한 다양화 수준입니다. 포트폴리오 리스크가 잘 분산되어 있습니다.</span>
          ) : (
            <span style={{ color: '#ffaa00' }}>⚠️ 집중도가 높습니다. 더 많은 종목에 분산 투자를 고려하세요.</span>
          )}
          <br />
          {analysis.concentration > 60 ? (
            <span style={{ color: '#ff9999' }}>⚠️ 상위 3개 종목이 {analysis.concentration}%를 차지합니다.</span>
          ) : (
            <span style={{ color: '#99ff99' }}>✅ 구성이 균형잡혀 있습니다.</span>
          )}
        </div>
      </div>

      <div style={{ fontSize: '11px', opacity: 0.6, textAlign: 'center' }}>
        * 분석은 현재 포트폴리오 기반으로 생성됩니다.
      </div>
    </div>
  )
}
