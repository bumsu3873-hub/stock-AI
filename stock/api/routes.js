import express from 'express';
import kiwoomService from '../services/kiwoom-service.js';

const router = express.Router();

router.get('/stocks/limit-up', async (req, res) => {
  const date = req.query.date;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Invalid date format (YYYY-MM-DD)' });
  }
  try {
    const stocks = await kiwoomService.getLimitUpStocks(date);
    res.json({ date, stocks, count: stocks.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stocks/search', async (req, res) => {
  const name = req.query.name;
  if (!name) {
    return res.status(400).json({ error: 'name parameter required' });
  }
  try {
    const stocks = kiwoomService.searchStocks(name);
    
    const results = stocks.map((stock) => {
      const priceData = kiwoomService.getPriceSync(stock.code);
      return {
        code: stock.code,
        name: stock.name,
        market: stock.market,
        sector: stock.sector,
        price: priceData?.price || 0,
        change: priceData?.change || 0,
        changePercent: priceData?.changePercent || '0.00',
        source: priceData?.source || 'unknown'
      };
    });

    res.json({ name, results, count: results.length });
    
    // 백그라운드에서 가격 미리 업데이트
    stocks.slice(0, 10).forEach((stock) => {
      kiwoomService.getRealTimePrice(stock.code).catch(() => {});
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stocks/price/:code', async (req, res) => {
  const code = req.params.code;
  try {
    const price = await kiwoomService.getRealTimePrice(code);
    if (!price) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    res.json(price);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stocks/prices', async (req, res) => {
  const codes = req.query.codes?.split(',') || [];
  if (codes.length === 0) {
    return res.status(400).json({ error: 'codes parameter required (comma-separated)' });
  }
  try {
    const prices = await kiwoomService.getPrices(codes);
    res.json({ codes, prices, count: prices.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
