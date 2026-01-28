import { useState, useEffect } from 'react'

export default function AlertManager({ currentPrice = 0, stockName = '' }) {
  const [alerts, setAlerts] = useState([])
  const [newAlert, setNewAlert] = useState({
    type: 'price_above',
    value: currentPrice,
    enabled: true
  })

  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    alerts.forEach(alert => {
      if (!alert.enabled) return

      let triggered = false

      if (alert.type === 'price_above' && currentPrice > alert.value) {
        triggered = true
      } else if (alert.type === 'price_below' && currentPrice < alert.value) {
        triggered = true
      } else if (alert.type === 'price_change') {
        const change = ((currentPrice - alert.lastPrice) / alert.lastPrice) * 100
        if (Math.abs(change) >= alert.value) {
          triggered = true
        }
      }

      if (triggered) {
        showNotification(`${stockName}: ${alert.message}`)
        alert.enabled = false
      }
    })
  }, [currentPrice, alerts, stockName])

  const showNotification = (message) => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, message }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }

  const addAlert = () => {
    const alertWithMessage = {
      ...newAlert,
      id: Date.now(),
      lastPrice: currentPrice,
      message: getAlertMessage(newAlert.type, newAlert.value, stockName)
    }
    setAlerts(prev => [...prev, alertWithMessage])
    setNewAlert({ type: 'price_above', value: currentPrice, enabled: true })
  }

  const getAlertMessage = (type, value, name) => {
    switch (type) {
      case 'price_above':
        return `${value.toLocaleString()}원 이상 도달 알림`
      case 'price_below':
        return `${value.toLocaleString()}원 이하 도달 알림`
      case 'price_change':
        return `${value}% 변동 알림`
      default:
        return '가격 알림'
    }
  }

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div style={{
      background: '#14181f',
      borderRadius: '8px',
      padding: '20px',
      marginTop: '20px'
    }}>
      <h3 style={{ margin: '0 0 20px 0', fontSize: '16px' }}>🔔 가격 알림</h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr auto',
        gap: '10px',
        marginBottom: '20px'
      }}>
        <select
          value={newAlert.type}
          onChange={(e) => setNewAlert(prev => ({ ...prev, type: e.target.value }))}
          style={{
            padding: '8px',
            background: '#2a2f4a',
            color: '#fff',
            border: '1px solid #4a5568',
            borderRadius: '4px'
          }}
        >
          <option value="price_above">가격 이상</option>
          <option value="price_below">가격 이하</option>
          <option value="price_change">변동률 (%)</option>
        </select>

        <input
          type="number"
          value={newAlert.value}
          onChange={(e) => setNewAlert(prev => ({ ...prev, value: parseFloat(e.target.value) }))}
          placeholder="값 입력"
          style={{
            padding: '8px',
            background: '#2a2f4a',
            color: '#fff',
            border: '1px solid #4a5568',
            borderRadius: '4px',
            boxSizing: 'border-box'
          }}
        />

        <button
          onClick={addAlert}
          style={{
            padding: '8px 16px',
            background: '#1e90ff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          추가
        </button>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {alerts.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', opacity: 0.5 }}>
            설정된 알림이 없습니다
          </div>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              background: '#2a2f4a',
              borderRadius: '4px',
              borderLeft: `3px solid ${alert.enabled ? '#1e90ff' : '#888'}`
            }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 'bold' }}>
                  {alert.message}
                </div>
                <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '3px' }}>
                  상태: {alert.enabled ? '대기 중' : '발동됨'}
                </div>
              </div>
              <button
                onClick={() => removeAlert(alert.id)}
                style={{
                  padding: '4px 8px',
                  background: '#ff4757',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                삭제
              </button>
            </div>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 999
        }}>
          {notifications.map(notif => (
            <div key={notif.id} style={{
              background: '#1e90ff',
              color: '#fff',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '10px',
              boxShadow: '0 4px 12px rgba(30, 144, 255, 0.3)',
              animation: 'slideIn 0.3s ease-in'
            }}>
              {notif.message}
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
