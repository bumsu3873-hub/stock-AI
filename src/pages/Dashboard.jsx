import { useState, useEffect } from 'react'
import Header from '../components/Header'
import LeftSidebar from '../components/LeftSidebar'
import MainContent from '../components/MainContent'
import RightPanel from '../components/RightPanel'
import Portfolio from '../components/Portfolio'
import PortfolioAnalysis from '../components/PortfolioAnalysis'
import AdvancedAnalysis from './AdvancedAnalysis'

function Dashboard() {
  const [selectedSector, setSelectedSector] = useState('IT')
  const [selectedStock, setSelectedStock] = useState('005930')
  const [indices, setIndices] = useState([])
  const [sectorStocks, setSectorStocks] = useState([])
  const [portfolio, setPortfolio] = useState([])
  const [showPortfolio, setShowPortfolio] = useState(false)
  const [showAdvancedAnalysis, setShowAdvancedAnalysis] = useState(false)

  useEffect(() => {
    const fetchIndices = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/indices')
        const data = await response.json()
        setIndices(data.indices || [])
      } catch (error) {
        console.error('Failed to fetch indices:', error)
      }
    }

    fetchIndices()
    const interval = setInterval(fetchIndices, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchSectorStocks = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/sectors/${selectedSector}`)
        const data = await response.json()
        setSectorStocks(data.stocks || [])
      } catch (error) {
        console.error('Failed to fetch sector stocks:', error)
      }
    }

    fetchSectorStocks()
  }, [selectedSector])

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/portfolio/balance')
        const data = await response.json()
        setPortfolio(data.output2 || [])
      } catch (error) {
        console.error('Failed to fetch portfolio:', error)
      }
    }

    const interval = setInterval(fetchPortfolio, 10000)
    fetchPortfolio()
    return () => clearInterval(interval)
  }, [])

  const isMobile = window.innerWidth < 768

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: '#0f1419',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
      overflow: 'hidden'
    }}>
      <Header indices={indices} />
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '10px 30px',
        background: '#0a0e14',
        borderBottom: '1px solid #1e2330'
      }}>
        <div></div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              setShowAdvancedAnalysis(!showAdvancedAnalysis)
              setShowPortfolio(false)
            }}
            style={{
              padding: '8px 16px',
              background: showAdvancedAnalysis ? '#1e90ff' : 'transparent',
              color: '#fff',
              border: showAdvancedAnalysis ? 'none' : '1px solid #1e2330',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
          >
            📊 고급 분석
          </button>
          <button
            onClick={() => {
              setShowPortfolio(!showPortfolio)
              setShowAdvancedAnalysis(false)
            }}
            style={{
              padding: '8px 16px',
              background: showPortfolio ? '#1e90ff' : 'transparent',
              color: '#fff',
              border: showPortfolio ? 'none' : '1px solid #1e2330',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
          >
            💼 포트폴리오
          </button>
        </div>
      </div>
      
      {showAdvancedAnalysis ? (
        <AdvancedAnalysis selectedStock={selectedStock} />
      ) : showPortfolio ? (
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '30px',
          background: '#0f1419'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div><Portfolio portfolio={portfolio} /></div>
              <div><PortfolioAnalysis portfolio={portfolio} /></div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          {!isMobile && (
            <LeftSidebar 
              selectedSector={selectedSector}
              onSectorChange={setSelectedSector}
              sectorStocks={sectorStocks}
              onStockSelect={setSelectedStock}
            />
          )}
          
          <MainContent 
            selectedStock={selectedStock}
            sectorStocks={sectorStocks}
          />
          
          {!isMobile && (
            <RightPanel 
              selectedStock={selectedStock}
              sectorStocks={sectorStocks}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default Dashboard
