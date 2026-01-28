class WebSocketClient {
  constructor(url = 'ws://localhost:3000/ws') {
    this.url = url;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.listeners = new Map();
    this.subscriptions = new Set();
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('[WS] 연결됨');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('[WS] 메시지 파싱 실패:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[WS] 에러:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[WS] 연결 종료');
          this.reconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[WS] ${this.reconnectAttempts}/${this.maxReconnectAttempts} 재연결 시도 (${this.reconnectDelay}ms 후)`);
      setTimeout(() => {
        this.connect().catch(() => {
          console.log('[WS] 재연결 실패');
        });
      }, this.reconnectDelay);
    } else {
      console.error('[WS] 최대 재연결 시도 횟수 초과');
    }
  }

  subscribe(codes) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('[WS] WebSocket이 연결되어 있지 않음');
      return;
    }

    codes.forEach(code => this.subscriptions.add(code));
    
    this.send({
      type: 'SUBSCRIBE',
      codes: codes
    });

    console.log(`[WS] Subscribed to: ${codes.join(', ')}`);
  }

  unsubscribe(codes) {
    codes.forEach(code => this.subscriptions.delete(code));
    
    this.send({
      type: 'UNSUBSCRIBE',
      codes
    });
  }

  send(message) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('[WS] WebSocket이 연결되어 있지 않음');
      return;
    }

    this.ws.send(JSON.stringify(message));
  }

  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
  }

  off(eventType, callback) {
    if (this.listeners.has(eventType)) {
      const callbacks = this.listeners.get(eventType);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  handleMessage(message) {
    const { type, data, message: msg } = message;

    if (this.listeners.has(type)) {
      this.listeners.get(type).forEach(callback => {
        callback(data, msg);
      });
    }

    if (type === 'PRICE_UPDATE' && data) {
      this.emit('priceUpdate', data);
    } else if (type === 'SUBSCRIBED') {
      this.emit('subscribed', data);
    } else if (type === 'UNSUBSCRIBED') {
      this.emit('unsubscribed');
    } else if (type === 'ERROR') {
      this.emit('error', msg);
    }
  }

  emit(eventType, data) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).forEach(callback => {
        callback(data);
      });
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

export default new WebSocketClient();
