const stockPool = [
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

function generateLimitUpStocks(date) {
  const dateNum = new Date(date).getTime();
  
  const random = (index) => {
    const x = Math.sin(dateNum + index) * 10000;
    return x - Math.floor(x);
  };

  const count = Math.floor(random(0) * 5) + 3;
  const selected = [];
  const used = new Set();

  for (let i = 0; i < count; i++) {
    let idx;
    do {
      idx = Math.floor(random(i + 100) * stockPool.length);
    } while (used.has(idx));

    used.add(idx);
    const stock = stockPool[idx];
    const openPrice = Math.floor(random(i + 200) * 90000) + 10000;
    const currentPrice = Math.round(openPrice * 1.3);

    selected.push({
      code: stock.code,
      name: stock.name,
      openPrice,
      currentPrice,
      change: currentPrice - openPrice,
      changeRate: 30.0,
      volume: Math.floor(random(i + 300) * 5000000) + 1000000,
      limitTime: `${String(9 + Math.floor(random(i + 400) * 6)).padStart(2, '0')}:${String(Math.floor(random(i + 500) * 60)).padStart(2, '0')}`,
      date,
      isLimitUp: true
    });
  }

  return selected.sort((a, b) => b.volume - a.volume);
}

export { generateLimitUpStocks };
