import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export default function OrderBook({ currentPrice, onOrderComplete }) {
  const [orders, setOrders] = useState({ sell: [], buy: [] })
  const [orderModal, setOrderModal] = useState({
    isOpen: false,
    type: 'BUY',
    quantity: 1,
    price: currentPrice
  })
  const [selectedStock, setSelectedStock] = useState({
    code: '005930',
    name: '삼성전자'
  })

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

  const handleOrderClick = (type, price) => {
    setOrderModal({
      isOpen: true,
      type,
      quantity: 1,
      price: type === 'BUY' ? price : currentPrice
    })
  }

  const submitOrder = async () => {
    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: selectedStock.code,
          name: selectedStock.name,
          quantity: orderModal.quantity,
          price: orderModal.price,
          orderType: orderModal.type
        })
      })

      if (response.ok) {
        const order = await response.json()
        alert(`${order.orderType} 주문 완료: ${order.name} ${order.quantity}주 @ ${order.price.toLocaleString()}원`)
        setOrderModal({ ...orderModal, isOpen: false })
        if (onOrderComplete) {
          onOrderComplete(order)
        }
      } else {
        const error = await response.json()
        alert(`주문 실패: ${error.error}`)
      }
    } catch (error) {
      alert(`주문 오류: ${error.message}`)
    }
  }

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
            <tr 
              key={`sell-${idx}`}
              onClick={() => handleOrderClick('BUY', order.price)}
              style={{ cursor: 'pointer' }}
            >
              <td className="price-up">{order.volume.toLocaleString()}</td>
              <td className="price-up">{order.price.toLocaleString()}</td>
              <td>-</td>
            </tr>
          ))}
          <tr style={{background: '#2d3548', fontWeight: 'bold'}}>
            <td colSpan="3" style={{textAlign: 'center'}}>현재가: {currentPrice.toLocaleString()}원</td>
          </tr>
          {orders.buy.map((order, idx) => (
            <tr 
              key={`buy-${idx}`}
              onClick={() => handleOrderClick('SELL', order.price)}
              style={{ cursor: 'pointer' }}
            >
              <td>-</td>
              <td className="price-down">{order.price.toLocaleString()}</td>
              <td className="price-down">{order.volume.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {orderModal.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#1a1f3a',
            padding: '30px',
            borderRadius: '10px',
            minWidth: '400px',
            color: '#fff',
            border: '1px solid #4a90e2'
          }}>
            <h3>{orderModal.type === 'BUY' ? '📈 매수' : '📉 매도'} 주문</h3>
            
            <div style={{ marginTop: '20px' }}>
              <label>종목: {selectedStock.name}</label>
            </div>

            <div style={{ marginTop: '15px' }}>
              <label>수량</label>
              <input
                type="number"
                min="1"
                value={orderModal.quantity}
                onChange={(e) => setOrderModal({ ...orderModal, quantity: parseInt(e.target.value) || 1 })}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  background: '#2a2f4a',
                  border: '1px solid #4a90e2',
                  color: '#fff',
                  borderRadius: '5px'
                }}
              />
            </div>

            <div style={{ marginTop: '15px' }}>
              <label>가격</label>
              <input
                type="number"
                min="0"
                value={orderModal.price}
                onChange={(e) => setOrderModal({ ...orderModal, price: parseInt(e.target.value) || 0 })}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '5px',
                  background: '#2a2f4a',
                  border: '1px solid #4a90e2',
                  color: '#fff',
                  borderRadius: '5px'
                }}
              />
            </div>

            <div style={{ marginTop: '20px', fontSize: '18px', fontWeight: 'bold', color: '#4a90e2' }}>
              총액: {(orderModal.quantity * orderModal.price).toLocaleString()}원
            </div>

            <div style={{ marginTop: '25px', display: 'flex', gap: '10px' }}>
              <button
                onClick={submitOrder}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: orderModal.type === 'BUY' ? '#e74c3c' : '#27ae60',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                {orderModal.type} 주문
              </button>
              <button
                onClick={() => setOrderModal({ ...orderModal, isOpen: false })}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#555',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
