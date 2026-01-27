const stocks = [
  { code: '005930', name: '삼성전자' },
  { code: '000660', name: 'SK하이닉스' },
  { code: '035420', name: 'NAVER' },
  { code: '035720', name: '카카오' },
  { code: '005380', name: '현대차' },
  { code: '207940', name: 'SK디스플레이' },
  { code: '051910', name: 'LG화학' },
  { code: '090430', name: '아모레퍼시픽' },
  { code: '003550', name: 'LG' },
  { code: '068270', name: '셀트리온' }
];

function searchStocks(keyword) {
  return stocks.filter(s => s.name.includes(keyword) || s.code.includes(keyword));
}

function getStockPrice(code) {
  const basePrice = {
    '005930': 72500,
    '000660': 134000,
    '035420': 205000,
    '035720': 54300,
    '005380': 185000,
    '207940': 52800,
    '051910': 75600,
    '090430': 23700,
    '003550': 82500,
    '068270': 98200
  };

  const price = basePrice[code];
  if (!price) return null;

  const stockInfo = stocks.find(s => s.code === code);
  return {
    code,
    name: stockInfo?.name || 'Unknown',
    price,
    high: Math.round(price * 1.02),
    low: Math.round(price * 0.98),
    change: Math.round(Math.random() * 1000 - 500),
    changeRate: (Math.random() * 2 - 1).toFixed(2),
    volume: Math.floor(Math.random() * 5000000) + 1000000
  };
}

export { searchStocks, getStockPrice };
