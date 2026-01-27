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

// API Routes
app.use('/api', apiRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: 'API Server Running', status: 'ok', timestamp: new Date() });
});

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
