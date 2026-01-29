import { useState, useEffect } from 'react'
import Header from '../components/Header'
import LeftSidebar from '../components/LeftSidebar'
import MainContent from '../components/MainContent'
import RightPanel from '../components/RightPanel'
import AdvancedAnalysis from './AdvancedAnalysis'
import { BarChart } from 'lucide-react'

function Dashboard() {
  const [selectedSector, setSelectedSector] = useState('IT')
  const [selectedStock, setSelectedStock] = useState('005930')
  const [indices, setIndices] = useState([])
  const [sectorStocks, setSectorStocks] = useState([])
  const [showAdvancedAnalysis, setShowAdvancedAnalysis] = useState(false)
  const [isMarketOpen, setIsMarketOpen] = useState(true)
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date())

  const isKoreanMarketOpen = () => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    
    if (dayOfWeek === 0 || dayOfWeek === 6) return false
    
    const currentTime = hours * 100 + minutes
    return currentTime >= 900 && currentTime <= 1530
  }

  useEffect(() => {
    const marketStatus = isKoreanMarketOpen()
    setIsMarketOpen(marketStatus)
    
    const statusInterval = setInterval(() => {
      setIsMarketOpen(isKoreanMarketOpen())
    }, 60000)
    
    return () => clearInterval(statusInterval)
  }, [])

  useEffect(() => {
    const fetchIndices = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/indices')
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`)
        }
        const data = await response.json()
        const indices = data.indices || []
        setIndices(indices)
        setLastUpdateTime(new Date())
        console.log('✅ Indices loaded:', indices)
      } catch (error) {
        console.error('❌ Failed to fetch indices:', error)
        setIndices([])
      }
    }

    fetchIndices()
    // 30초마다 갱신
    const interval = setInterval(fetchIndices, 30000)
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



  const isMobile = window.innerWidth < 768

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: '#f5f7fa',
      color: '#333',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      overflow: 'hidden'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '0 20px' }}>
        <Header indices={indices} lastUpdateTime={lastUpdateTime} />
        
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '0 0 20px 0',
          gap: '10px'
        }}>
           <button
             onClick={() => {
               setShowAdvancedAnalysis(!showAdvancedAnalysis)
             }}
             style={{
               padding: '10px 20px',
               background: showAdvancedAnalysis ? '#1e90ff' : '#fff',
               color: showAdvancedAnalysis ? '#fff' : '#666',
               border: showAdvancedAnalysis ? 'none' : '1px solid #e1e4e8',
               borderRadius: '12px',
               cursor: 'pointer',
               fontSize: '14px',
               fontWeight: '600',
               transition: 'all 0.2s',
               display: 'flex',
               alignItems: 'center',
               gap: '8px',
               boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
             }}
           >
             <BarChart size={16} />
             고급 분석
           </button>
        </div>
        
         {showAdvancedAnalysis ? (
           <AdvancedAnalysis selectedStock={selectedStock} />
         ) : (
           <div style={{
             display: 'flex',
             flex: 1,
             overflow: 'hidden',
             flexDirection: isMobile ? 'column' : 'row',
             gap: '20px',
             paddingBottom: '20px'
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
    </div>
  )
}

export default Dashboard
