import { useState, useEffect } from 'react'
import Header from '../components/Header'
import LeftSidebar from '../components/LeftSidebar'
import MainContent from '../components/MainContent'
import RightPanel from '../components/RightPanel'

function Dashboard() {
  const [selectedSector, setSelectedSector] = useState('IT')
  const [selectedStock, setSelectedStock] = useState('005930')
  const [indices, setIndices] = useState([])
  const [sectorStocks, setSectorStocks] = useState([])

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

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: '#0f1419',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto'
    }}>
      <Header indices={indices} />
      
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <LeftSidebar 
          selectedSector={selectedSector}
          onSectorChange={setSelectedSector}
          sectorStocks={sectorStocks}
          onStockSelect={setSelectedStock}
        />
        
        <MainContent 
          selectedStock={selectedStock}
          sectorStocks={sectorStocks}
        />
        
        <RightPanel 
          selectedStock={selectedStock}
          sectorStocks={sectorStocks}
        />
      </div>
    </div>
  )
}

export default Dashboard
