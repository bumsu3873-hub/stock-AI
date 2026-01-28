import { useState } from 'react'

function OrderModal({ stock, orderType, onClose, onSuccess }) {
  const [quantity, setQuantity] = useState(1)
  const [price, setPrice] = useState(stock.price)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const totalPrice = quantity * price

  const handleOrder = async () => {
    setLoading(true)
    setError(null)

    try {
      const endpoint = orderType === 'buy' 
        ? 'http://localhost:3000/api/order/buy'
        : 'http://localhost:3000/api/order/sell'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: stock.code,
          quantity,
          price
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '주문 실패')
      }

      alert(`${orderType === 'buy' ? '매수' : '매도'} 주문이 완료되었습니다!`)
      onSuccess()
    } catch (err) {
      setError(err.message)
      console.error('Order error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
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
        width: '90%',
        maxWidth: '400px',
        border: '1px solid #2a2f4a'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>
            {orderType === 'buy' ? '📈 매수 주문' : '📉 매도 주문'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '14px', opacity: 0.7 }}>종목</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '5px' }}>
            {stock.name} ({stock.code})
          </div>
          <div style={{ fontSize: '16px', marginTop: '5px', color: '#4a90e2' }}>
            현재가: {stock.price.toLocaleString()}원
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '14px', display: 'block', marginBottom: '5px' }}>
            수량 (주)
          </label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            style={{
              width: '100%',
              padding: '10px',
              background: '#2a2f4a',
              border: '1px solid #4a90e2',
              borderRadius: '5px',
              color: '#fff',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '14px', display: 'block', marginBottom: '5px' }}>
            주문가 (원)
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Math.max(0, parseInt(e.target.value) || 0))}
            style={{
              width: '100%',
              padding: '10px',
              background: '#2a2f4a',
              border: '1px solid #4a90e2',
              borderRadius: '5px',
              color: '#fff',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{
          padding: '15px',
          background: '#2a2f4a',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ opacity: 0.7 }}>예상 총액</span>
            <span style={{ fontWeight: 'bold' }}>
              {totalPrice.toLocaleString()}원
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ opacity: 0.7 }}>수수료</span>
            <span style={{ fontWeight: 'bold', color: '#ff6b6b' }}>
              {(totalPrice * 0.0015).toLocaleString()}원
            </span>
          </div>
        </div>

        {error && (
          <div style={{
            padding: '10px',
            background: '#8b0000',
            borderRadius: '5px',
            marginBottom: '20px',
            color: '#fff'
          }}>
            ❌ {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              background: '#2a2f4a',
              color: '#fff',
              border: '1px solid #4a90e2',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            취소
          </button>
          <button
            onClick={handleOrder}
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px',
              background: orderType === 'buy' ? '#ff6b6b' : '#4a90e2',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: loading ? 0.5 : 1
            }}
          >
            {loading ? '처리 중...' : (orderType === 'buy' ? '매수' : '매도')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderModal
