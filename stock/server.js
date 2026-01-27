import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import http from 'http';
import apiRoutes from './api/routes.js';
import kiwoomService from './services/kiwoom-service.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Serve static files from dashboard dist
app.use(express.static(path.join(__dirname, '../stock-dashboard/dist')));

// SPA fallback - all non-API routes return index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../stock-dashboard/dist/index.html'));
});

// HTTP 서버 생성
const server = http.createServer(app);

// WebSocket 서버 설정
const wss = new WebSocketServer({ server });

const subscriptions = new Map();

wss.on('connection', (ws) => {
  console.log('[WebSocket] 클라이언트 연결됨');
  
  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'SUBSCRIBE') {
        const { codes } = data;
        if (!codes || codes.length === 0) {
          ws.send(JSON.stringify({ type: 'ERROR', message: '유효한 codes 필요' }));
          return;
        }

        const clientId = ws;
        subscriptions.set(clientId, codes);
        console.log(`[WebSocket] 클라이언트 구독: ${codes.join(',')}`);

        ws.send(JSON.stringify({
          type: 'SUBSCRIBED',
          codes,
          message: `${codes.length}개 종목 구독됨`
        }));

        await sendPriceUpdate(ws, codes);
      } else if (data.type === 'UNSUBSCRIBE') {
        subscriptions.delete(ws);
        console.log('[WebSocket] 클라이언트 구독 해제');
        ws.send(JSON.stringify({ type: 'UNSUBSCRIBED' }));
      }
    } catch (error) {
      console.error('[WebSocket] 메시지 처리 오류:', error.message);
      ws.send(JSON.stringify({ type: 'ERROR', message: error.message }));
    }
  });

  ws.on('close', () => {
    subscriptions.delete(ws);
    console.log('[WebSocket] 클라이언트 연결 종료');
  });

  ws.on('error', (error) => {
    console.error('[WebSocket] 에러:', error.message);
  });
});

// 주기적으로 가격 업데이트 전송 (2초마다)
setInterval(async () => {
  for (const [ws, codes] of subscriptions.entries()) {
    if (ws.readyState === 1) {
      await sendPriceUpdate(ws, codes);
    }
  }
}, 2000);

async function sendPriceUpdate(ws, codes) {
  try {
    const prices = await kiwoomService.getPrices(codes);
    ws.send(JSON.stringify({
      type: 'PRICE_UPDATE',
      data: prices,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    console.error('가격 업데이트 전송 실패:', error.message);
  }
}

// Heartbeat 체크 (30초마다 alive 클라이언트만 유지)
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) {
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

// 서버 시작
server.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
  console.log(`✅ WebSocket 준비됨: ws://localhost:${PORT}`);
});
