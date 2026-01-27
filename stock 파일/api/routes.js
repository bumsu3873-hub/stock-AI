import express from 'express';
import { generateLimitUpStocks } from '../services/limit-up-service.js';
import { searchStocks, getStockPrice } from '../services/stock-service.js';

const router = express.Router();

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
