import WebSocket from 'ws';

const testWebSocket = async () => {
  console.log('🧪 WebSocket 실시간 테스트 시작...\n');

  return new Promise((resolve) => {
    const ws = new WebSocket('ws://localhost:8080');
    let messageCount = 0;
    const maxMessages = 5;

    ws.on('open', () => {
      console.log('✅ WebSocket 연결됨');
      console.log('📤 구독 요청: 005930 (삼성전자)\n');

      ws.send(JSON.stringify({
        type: 'SUBSCRIBE',
        codes: ['005930']
      }));
    });

    ws.on('message', (data) => {
      messageCount++;
      const message = JSON.parse(data);

      if (message.type === 'SUBSCRIBED') {
        console.log(`📌 구독 완료: ${message.message}`);
        console.log(`⏳ 실시간 가격 업데이트 대기중...\n`);
      } else if (message.type === 'PRICE_UPDATE') {
        const prices = message.data;
        console.log(`📊 [${messageCount}] 가격 업데이트 (${message.timestamp})`);
        prices.forEach(p => {
          const changeSymbol = p.change >= 0 ? '▲' : '▼';
          const color = p.change >= 0 ? '\x1b[32m' : '\x1b[31m';
          const reset = '\x1b[0m';
          console.log(
            `   ${p.name}: ${color}${p.price.toLocaleString()}원${reset} ` +
            `${changeSymbol}${Math.abs(p.change).toLocaleString()}원 (${p.changePercent}%)`
          );
        });
        console.log('');

        if (messageCount >= maxMessages) {
          console.log(`✅ ${maxMessages}개 메시지 수신 완료. 테스트 종료.`);
          ws.close();
          resolve();
        }
      }
    });

    ws.on('error', (error) => {
      console.error('❌ WebSocket 에러:', error.message);
      resolve();
    });

    ws.on('close', () => {
      console.log('\n✅ WebSocket 연결 종료');
    });

    setTimeout(() => {
      if (ws.readyState === WebSocket.OPEN) {
        console.log('⏱️  타임아웃. 테스트 종료.');
        ws.close();
      }
      resolve();
    }, 15000);
  });
};

testWebSocket().catch(console.error);
