import express from 'express';
import { generateLimitUpStocks } from '../services/limit-up-service.js';
import { searchStocks, getStockPrice } from '../services/stock-service.js';

const router = express.Router();

// KOSPI, KOSDAQ 지수 데이터
router.get('/indices', (req, res) => {
  const indices = [
    {
      name: 'KOSPI',
      value: 2528.50,
      change: -35.50,
      changeRate: -1.39,
      high: 2565.30,
      low: 2515.20
    },
    {
      name: 'KOSDAQ',
      value: 775.33,
      change: 9.10,
      changeRate: 1.19,
      high: 785.20,
      low: 768.50
    }
  ];
  res.json({ indices });
});

router.get('/stocks/limit-up', (req, res) => {
  const date = req.query.date;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ 
      error: 'Invalid date format',
      required: 'YYYY-MM-DD'
    });
  }
  
  try {
    const stocks = generateLimitUpStocks(date);
    res.json({ 
      date, 
      stocks, 
      count: stocks.length,
      status: 'success'
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

router.get('/stocks/search', (req, res) => {
  const name = req.query.name;
  if (!name) {
    return res.status(400).json({ error: 'name parameter required' });
  }
  
  try {
    const results = searchStocks(name);
    res.json({ 
      keyword: name, 
      results, 
      count: results.length,
      status: 'success'
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

router.get('/stocks/price/:code', (req, res) => {
  const code = req.params.code;
  
  try {
    const price = getStockPrice(code);
    if (!price) {
      return res.status(404).json({ error: 'Stock not found', code });
    }
    res.json(price);
  } catch (error) {
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

export default router;
