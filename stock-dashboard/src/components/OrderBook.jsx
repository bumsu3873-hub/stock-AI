import { useState, useEffect } from 'react'

export default function OrderBook({ currentPrice }) {
  const [orders, setOrders] = useState({ sell: [], buy: [] })

  useEffect(() => {
    const updateOrders = () => {
      const sell = []
      const buy = []
      
      for (let i = 0; i < 10; i++) {
        sell.push({
          price: currentPrice + (i + 1) * 100,
          volume: Math.floor(Math.random() * 50000) + 10000
        })
        buy.push({
          price: currentPrice - (i + 1) * 100,
          volume: Math.floor(Math.random() * 50000) + 10000
        })
      }
      
      setOrders({ sell: sell.reverse(), buy })
    }
    
    updateOrders()
    const interval = setInterval(updateOrders, 3000)
    return () => clearInterval(interval)
  }, [currentPrice])

  return (
    <div className="card">
      <h2>📋 호가창</h2>
      <table>
        <thead>
          <tr>
            <th>매도잔량</th>
            <th>가격</th>
            <th>매수잔량</th>
          </tr>
        </thead>
        <tbody>
          {orders.sell.map((order, idx) => (
            <tr key={`sell-${idx}`}>
              <td className="price-up">{order.volume.toLocaleString()}</td>
              <td className="price-up">{order.price.toLocaleString()}</td>
              <td>-</td>
            </tr>
          ))}
          <tr style={{background: '#2d3548', fontWeight: 'bold'}}>
            <td colSpan="3" style={{textAlign: 'center'}}>현재가</td>
          </tr>
          {orders.buy.map((order, idx) => (
            <tr key={`buy-${idx}`}>
              <td>-</td>
              <td className="price-down">{order.price.toLocaleString()}</td>
              <td className="price-down">{order.volume.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
