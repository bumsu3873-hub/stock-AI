// Initial Stock List
export const STOCK_LIST = [
  { id: '005930', name: '삼성전자', price: 72500, change: 0.0, changeRate: 0.0, volume: 12405000 },
  { id: '000660', name: 'SK하이닉스', price: 134000, change: 0.0, changeRate: 0.0, volume: 4502000 },
  { id: '035420', name: 'NAVER', price: 205000, change: 0.0, changeRate: 0.0, volume: 540000 },
  { id: '035720', name: '카카오', price: 54300, change: 0.0, changeRate: 0.0, volume: 1200000 },
  { id: '005380', name: '현대차', price: 185000, change: 0.0, changeRate: 0.0, volume: 890000 },
];

// Generate initial chart data (past 60 minutes)
export const generateChartData = (basePrice, count = 60) => {
  const data = [];
  let currentPrice = basePrice;
  const now = new Date();

  for (let i = count; i > 0; i--) {
    const time = new Date(now.getTime() - i * 60000);
    const volatility = basePrice * 0.002; // 0.2% volatility
    const change = (Math.random() - 0.5) * volatility;
    currentPrice += change;
    
    data.push({
      time: time.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      price: Math.floor(currentPrice),
      volume: Math.floor(Math.random() * 10000) + 1000,
    });
  }
  return data;
};

// Generate Order Book (Hoga)
export const generateOrderBook = (currentPrice) => {
  const asks = []; // Sell orders (Higher prices)
  const bids = []; // Buy orders (Lower prices)
  const tickSize = currentPrice >= 100000 ? 500 : 100; // Tick size rule

  // Generate 10 levels of asks (Sell) - Price increasing
  for (let i = 10; i > 0; i--) {
    asks.push({
      price: currentPrice + (i * tickSize),
      amount: Math.floor(Math.random() * 5000) + 100,
    });
  }

  // Generate 10 levels of bids (Buy) - Price decreasing
  for (let i = 0; i < 10; i++) {
    bids.push({
      price: currentPrice - ((i + 1) * tickSize),
      amount: Math.floor(Math.random() * 5000) + 100,
    });
  }

  return { asks, bids };
};

// Simulate next price tick
export const getNextPrice = (currentPrice) => {
  const volatility = currentPrice * 0.001; // 0.1% max change per tick
  const change = (Math.random() - 0.5) * volatility;
  const tickSize = currentPrice >= 100000 ? 500 : 100;
  
  let newPrice = currentPrice + change;
  // Round to nearest tick
  newPrice = Math.round(newPrice / tickSize) * tickSize;
  
  return Math.floor(newPrice);
};

// Mock News Data
export const MOCK_NEWS = [
  { id: 1, time: '14:30', title: '반도체 수출 호조에 관련주 일제히 상승세', source: '경제뉴스' },
  { id: 2, time: '14:15', title: '외국인, 코스피 3일 연속 순매수 행진', source: '마켓워치' },
  { id: 3, time: '13:45', title: '삼성전자, 차세대 AI 칩 개발 가속화 발표', source: 'IT데일리' },
  { id: 4, time: '13:20', title: '금리 인하 기대감에 성장주 매수세 유입', source: '금융포커스' },
  { id: 5, time: '12:50', title: '현대차, 전기차 판매량 전년비 20% 증가', source: '오토뉴스' },
  { id: 6, time: '11:30', title: '카카오, 신규 플랫폼 서비스 출시 예정', source: '테크인사이트' },
];

// Initial Portfolio
export const INITIAL_PORTFOLIO = [
  { id: '005930', name: '삼성전자', amount: 50, avgPrice: 71000 },
  { id: '035420', name: 'NAVER', amount: 10, avgPrice: 210000 },
  { id: '000660', name: 'SK하이닉스', amount: 20, avgPrice: 125000 },
];
