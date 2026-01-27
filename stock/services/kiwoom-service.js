import axios from 'axios';

// Kiwoom API 모의 연결 (실제 Windows COM API 대신 REST 기반 데이터 사용)
// 실제 환경에서는 Windows에서 Kiwoom ActiveX 사용

class KiwoomService {
  constructor() {
    this.baseUrl = process.env.KIWOOM_API_URL || 'http://localhost:3001';
    this.stocks = {
      '005930': { name: '삼성전자', basePrice: 72500 },
      '000660': { name: 'SK하이닉스', basePrice: 134000 },
      '035420': { name: 'NAVER', basePrice: 205000 },
      '035720': { name: '카카오', basePrice: 54300 },
      '005380': { name: '현대차', basePrice: 185000 }
    };
    this.priceCache = new Map();
    this.initializePrices();
  }

  initializePrices() {
    // 초기 가격 설정
    Object.entries(this.stocks).forEach(([code, stock]) => {
      this.priceCache.set(code, {
        code,
        name: stock.name,
        price: stock.basePrice,
        high: Math.round(stock.basePrice * 1.03),
        low: Math.round(stock.basePrice * 0.97),
        volume: Math.floor(Math.random() * 5000000) + 1000000,
        timestamp: new Date()
      });
    });
  }

  // 현실적인 가격 변동 시뮬레이션 (실제 Kiwoom API 호출 대신)
  async getRealTimePrice(code) {
    try {
      // 실제 환경에서는 여기서 Kiwoom API 호출
      // const response = await this.callKiwoomAPI('OptMisc', { nRqId: 1 });
      
      const cached = this.priceCache.get(code);
      if (!cached) {
        return null;
      }

      // 현실적인 시간대 변동 생성
      const now = new Date();
      const hour = now.getHours();
      const volatility = this.calculateVolatility(hour);
      
      const change = (Math.random() - 0.5) * volatility;
      const newPrice = Math.max(cached.low, Math.min(cached.high, cached.price + change));
      const roundedPrice = Math.round(newPrice / 100) * 100;

      const priceData = {
        code,
        name: cached.name,
        price: roundedPrice,
        high: Math.max(cached.high, roundedPrice),
        low: Math.min(cached.low, roundedPrice),
        change: roundedPrice - this.stocks[code].basePrice,
        changePercent: ((roundedPrice - this.stocks[code].basePrice) / this.stocks[code].basePrice * 100).toFixed(2),
        volume: Math.floor(Math.random() * 5000000) + 1000000,
        timestamp: new Date()
      };

      this.priceCache.set(code, priceData);
      return priceData;
    } catch (error) {
      console.error(`Error fetching price for ${code}:`, error.message);
      return this.priceCache.get(code) || null;
    }
  }

  // 한국 주식 시장 시간대별 변동성 계산
  calculateVolatility(hour) {
    // 개장 (9:00 - 15:30)
    if (hour >= 9 && hour < 15) {
      return 2000; // 중간에 더 큰 변동
    }
    // 장 시작 (9:00 - 11:00) - 변동성 높음
    if (hour >= 9 && hour < 11) {
      return 3000;
    }
    // 장 마감 (14:00 - 15:30) - 변동성 높음
    if (hour >= 14 && hour < 16) {
      return 3000;
    }
    // 폐장 시간
    return 500;
  }

  // 여러 종목 가격 조회
  async getPrices(codes) {
    const prices = [];
    for (const code of codes) {
      const price = await this.getRealTimePrice(code);
      if (price) prices.push(price);
    }
    return prices;
  }

  // 상한가 종목 조회 (실제 Kiwoom API 기반)
  async getLimitUpStocks(date) {
    try {
      // 실제 환경에서는 Kiwoom OptStockHog 사용
      // const response = await this.queryKiwoomOptStockHog(date);
      
      // 시뮬레이션: 무작위로 상한가 종목 생성
      const dateNum = new Date(date).getTime();
      const random = (index) => {
        const x = Math.sin(dateNum + index) * 10000;
        return x - Math.floor(x);
      };

      const count = Math.floor(random(0) * 3) + 2;
      const codes = Object.keys(this.stocks);
      const selected = [];
      const used = new Set();

      for (let i = 0; i < count && i < codes.length; i++) {
        let idx;
        do {
          idx = Math.floor(random(i + 100) * codes.length);
        } while (used.has(idx));

        used.add(idx);
        const code = codes[idx];
        const stock = this.stocks[code];
        
        const priceData = await this.getRealTimePrice(code);
        const limitUpPrice = Math.round(priceData.price * 1.3);

        selected.push({
          code,
          name: stock.name,
          openPrice: Math.round(priceData.price * 0.98),
          currentPrice: limitUpPrice,
          change: limitUpPrice - Math.round(priceData.price * 0.98),
          changeRate: 30.0,
          volume: Math.floor(random(i + 300) * 5000000) + 1000000,
          limitTime: `${String(9 + Math.floor(random(i + 400) * 6)).padStart(2, '0')}:${String(Math.floor(random(i + 500) * 60)).padStart(2, '0')}`,
          date,
          isLimitUp: true
        });
      }

      return selected.sort((a, b) => b.volume - a.volume);
    } catch (error) {
      console.error('Error fetching limit-up stocks:', error.message);
      return [];
    }
  }

  // 주식 검색
  async searchStocks(keyword) {
    try {
      const results = [];
      for (const [code, stock] of Object.entries(this.stocks)) {
        if (stock.name.includes(keyword) || code.includes(keyword)) {
          const priceData = await this.getRealTimePrice(code);
          results.push({
            code,
            name: stock.name,
            price: priceData.price,
            change: priceData.change,
            changePercent: priceData.changePercent
          });
        }
      }
      return results;
    } catch (error) {
      console.error('Error searching stocks:', error.message);
      return [];
    }
  }

  // Kiwoom API 호출 (실제 Windows 환경에서 사용)
  // 이 메서드는 Windows에서만 작동합니다
  async callKiwoomAPI(methodName, params) {
    // 실제 구현: Windows COM 인터페이스 호출
    // 현재는 스텁으로 유지
    console.log(`[STUB] Calling Kiwoom API: ${methodName}`, params);
    return null;
  }
}

export default new KiwoomService();
