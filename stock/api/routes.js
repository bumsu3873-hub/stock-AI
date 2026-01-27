import express from 'express';
import { generateLimitUpStocks } from '../services/limit-up-service.js';
import { searchStocks, getStockPrice } from '../services/stock-service.js';

const router = express.Router();

router.get('/stocks/limit-up', (req, res) => {
  const date = req.query.date;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Invalid date format (YYYY-MM-DD)' });
  }
  const stocks = generateLimitUpStocks(date);
  res.json({ date, stocks, count: stocks.length });
});

router.get('/stocks/search', (req, res) => {
  const name = req.query.name;
  if (!name) {
    return res.status(400).json({ error: 'name parameter required' });
  }
  const results = searchStocks(name);
  res.json({ name, results, count: results.length });
});

router.get('/stocks/price/:code', (req, res) => {
  const code = req.params.code;
  const price = getStockPrice(code);
  if (!price) {
    return res.status(404).json({ error: 'Stock not found' });
  }
  res.json(price);
});

export default router;
