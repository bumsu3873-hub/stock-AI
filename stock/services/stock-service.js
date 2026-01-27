function searchStocks(keyword) {
  const stocks = [
    { code: '005930', name: '삼성전자' },
    { code: '000660', name: 'SK하이닉스' },
    { code: '035420', name: 'NAVER' },
    { code: '035720', name: '카카오' },
    { code: '005380', name: '현대차' }
  ];

  return stocks.filter(s => s.name.includes(keyword) || s.code.includes(keyword));
}

function getStockPrice(code) {
  const prices = {
    '005930': { code: '005930', name: '삼성전자', price: 72500, high: 73500, low: 71500 },
    '000660': { code: '000660', name: 'SK하이닉스', price: 134000, high: 135000, low: 133000 }
  };
  return prices[code] || null;
}

export { searchStocks, getStockPrice };
