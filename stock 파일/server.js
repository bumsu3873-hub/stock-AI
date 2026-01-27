import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './api/routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: 'API Server Running',
    status: 'ok',
    timestamp: new Date(),
    endpoints: {
      limitUp: 'GET /api/stocks/limit-up?date=YYYY-MM-DD',
      search: 'GET /api/stocks/search?name=종목명',
      price: 'GET /api/stocks/price/:code'
    }
  });
});

// API 라우트
app.use('/api', apiRoutes);

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.path });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`\n✅ API Server running on http://localhost:${PORT}\n`);
  console.log('Available endpoints:');
  console.log(`  GET /api/stocks/limit-up?date=2026-01-27`);
  console.log(`  GET /api/stocks/search?name=삼성`);
  console.log(`  GET /api/stocks/price/005930`);
  console.log('\n');
});
