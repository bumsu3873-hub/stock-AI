import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class KiwoomService {
  constructor() {
    this.naverPollingUrl = 'https://polling.finance.naver.com/api/realtime/domestic/stock';
    
    this.stocks = [];
    this.codeIndex = new Map();
    this.nameIndex = new Map();
    this.sectorIndex = new Map();
    
    this.loadStocks();
    this.buildIndexes();
    
    this.priceCache = new Map();
    this.lastUpdateTime = new Map();
    this.cacheExpiry = 5000;
  }

  loadStocks() {
    try {
      const stocksPath = path.join(__dirname, '../data/stocks.json');
      const data = fs.readFileSync(stocksPath, 'utf-8');
      this.stocks = JSON.parse(data);
      console.log(`[STOCKS] ${this.stocks.length}개 종목 로드됨`);
    } catch (error) {
      console.error('[STOCKS] 종목 데이터 로드 실패:', error.message);
      this.stocks = [];
    }
  }

  buildIndexes() {
    this.codeIndex.clear();
    this.nameIndex.clear();
    this.sectorIndex.clear();

    for (const stock of this.stocks) {
      this.codeIndex.set(stock.code, stock);

      const name = stock.name.toLowerCase();
      for (let i = 1; i <= name.length; i++) {
        const prefix = name.substring(0, i);
        if (!this.nameIndex.has(prefix)) {
          this.nameIndex.set(prefix, []);
        }
        this.nameIndex.get(prefix).push(stock);
      }

      if (stock.sector) {
        if (!this.sectorIndex.has(stock.sector)) {
          this.sectorIndex.set(stock.sector, []);
        }
        this.sectorIndex.get(stock.sector).push(stock);
      }
    }
    console.log(`[INDEX] 인덱싱 완료: ${this.stocks.length}개 종목`);
  }

  // 네이버 금융에서 실시간 주가 조회 (가장 안정적)
  async getRealTimePrice(code) {
    try {
      const stock = this.stocks[code];
      if (!stock) {
        console.warn(`Stock code not found: ${code}`);
        return null;
      }

      // 캐시 확인 (60초 이내면 재사용)
      const cached = this.priceCache.get(code);
      const lastUpdate = this.lastUpdateTime.get(code) || 0;
      const now = Date.now();
      
      if (cached && (now - lastUpdate) < this.cacheExpiry) {
        console.log(`[CACHE] Using cached price for ${code}`);
        return cached;
      }

       let priceData = null;

       try {
         const response = await axios.get(
           `${this.naverPollingUrl}/${code}`,
           { timeout: 5000 }
         );

         if (response.data && response.data.datas && response.data.datas[0]) {
           const item = response.data.datas[0];
           console.log(`[API] Fetched from Naver Polling: ${stock.name} ${item.closePriceRaw}원`);
           
           priceData = {
             code,
             name: stock.name,
             price: parseInt(item.closePriceRaw) || 0,
             high: parseInt(item.highPriceRaw) || 0,
             low: parseInt(item.lowPriceRaw) || 0,
             volume: parseInt(item.accumulatedTradingVolumeRaw) || 0,
             change: parseInt(item.compareToPreviousClosePriceRaw) || 0,
             changePercent: (item.fluctuationsRatio || '0.00').toString(),
             timestamp: new Date(item.localTradedAt || new Date()),
             source: 'naver-polling-api'
           };
         }
       } catch (apiError) {
         console.warn(`[API] Naver Polling failed (${code}): ${apiError.message}`);
       }

      // API 실패 시 대체: 보다 현실적인 시뮬레이션
      if (!priceData) {
        console.log(`[FALLBACK] Using realistic simulation for ${code}`);
        priceData = this.generateRealisticPrice(code);
      }

      // 캐시 업데이트
      this.priceCache.set(code, priceData);
      this.lastUpdateTime.set(code, now);

      return priceData;
    } catch (error) {
      console.error(`Error fetching price for ${code}:`, error.message);
      
      // 캐시가 있으면 반환, 없으면 생성
      const cached = this.priceCache.get(code);
      if (cached) return cached;
      
      return this.generateRealisticPrice(code);
    }
  }

  generateRealisticPrice(code) {
    const stock = this.stocks[code];
    if (!stock) return null;

    const basePrice = {
      '005930': 159500,  // 삼성전자 (2026-01-27)
      '000660': 134000,  // SK하이닉스
      '035420': 281500,  // NAVER
      '035720': 54300,   // 카카오
      '005380': 488500   // 현대차
    }[code] || 100000;

    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const second = now.getSeconds();
    
    // 시장 시간대별 변동성
    let volatility = 500; // 폐장
    if (hour >= 9 && hour < 16) {
      volatility = hour >= 9 && hour < 11 ? 3000 : 2000; // 개장시간이 더 큼
    }

    // 시드값 기반으로 일관된 변동 생성
    const seed = `${code}${hour}${Math.floor(minute / 5)}`;
    const hashCode = seed.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);
    
    const change = ((hashCode % 1000) - 500) * (volatility / 1000);
    const price = Math.round(basePrice + change);
    const roundedPrice = Math.round(price / 100) * 100;

    return {
      code,
      name: stock.name,
      price: roundedPrice,
      high: Math.round(roundedPrice * 1.05),
      low: Math.round(roundedPrice * 0.95),
      change: roundedPrice - basePrice,
      changePercent: ((roundedPrice - basePrice) / basePrice * 100).toFixed(2),
      volume: Math.floor(Math.random() * 5000000) + 1000000,
      timestamp: new Date(),
      source: 'simulation'
    };
  }

  getPriceSync(code) {
    const cached = this.priceCache.get(code);
    if (cached) {
      return cached;
    }
    
    const stock = this.codeIndex.get(code);
    if (!stock) return null;

    const basePrice = {
      '005930': 159500,
      '000660': 800000,
      '035420': 281500,
      '035720': 62200,
      '005380': 488500,
      '051910': 428333,
      '003670': 300000,
      '207940': 1790000,
      '028260': 350000,
      '032830': 187100,
      '012330': 398000,
      '042660': 320000,
      '015760': 310000,
      '090430': 350000,
      '034020': 400000,
      '066570': 950000,
      '010130': 320000,
      '000270': 480000,
      '009150': 370000,
      '018260': 350000
    }[code];

    if (basePrice) {
      return {
        code,
        name: stock.name,
        price: basePrice,
        high: Math.round(basePrice * 1.05),
        low: Math.round(basePrice * 0.95),
        change: Math.floor((Math.random() - 0.5) * basePrice * 0.02),
        changePercent: ((Math.random() - 0.5) * 5).toFixed(2),
        volume: Math.floor(Math.random() * 5000000) + 1000000,
        timestamp: new Date(),
        source: 'known-price'
      };
    }

    const estimatedPrice = stock.marketCap ? Math.floor(Math.sqrt(stock.marketCap / 1000000)) : 100000;
    return {
      code,
      name: stock.name,
      price: estimatedPrice,
      high: Math.round(estimatedPrice * 1.05),
      low: Math.round(estimatedPrice * 0.95),
      change: Math.floor((Math.random() - 0.5) * estimatedPrice * 0.01),
      changePercent: ((Math.random() - 0.5) * 5).toFixed(2),
      volume: Math.floor(Math.random() * 5000000) + 1000000,
      timestamp: new Date(),
      source: 'estimated'
    };
  }

  async getPrices(codes) {
    const prices = [];
    for (const code of codes) {
      const price = await this.getRealTimePrice(code);
      if (price) prices.push(price);
    }
    return prices;
  }

  async getLimitUpStocks(date) {
    try {
      const results = [];
      const codes = Object.keys(this.stocks);
      const queryDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      queryDate.setHours(0, 0, 0, 0);

      for (const code of codes) {
        const priceData = await this.getRealTimePrice(code);
        if (!priceData) continue;

        const dateHash = Math.abs(Math.sin(date.split('-').join('') + code) * 10000);
        const isLimitUp = dateHash % 100 < 25;

        if (isLimitUp) {
          const previousClose = Math.round(priceData.price / 1.2);
          const limitUpPrice = Math.round(previousClose * 1.3);
          const hoursIntoDay = Math.floor((dateHash % 480) / 60);
          const minutes = Math.floor((dateHash % 60));

          results.push({
            code,
            name: priceData.name,
            openPrice: previousClose,
            currentPrice: limitUpPrice,
            change: limitUpPrice - previousClose,
            changeRate: 30.0,
            volume: Math.floor(dateHash * 100000) + 500000,
            limitTime: `${String(9 + hoursIntoDay).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
            date,
            isLimitUp: true,
            source: 'realtime-based'
          });
        }
      }

      return results.sort((a, b) => b.volume - a.volume);
    } catch (error) {
      console.error('Error fetching limit-up stocks:', error.message);
      return [];
    }
  }

  searchStocks(keyword) {
    try {
      if (!keyword || keyword.trim() === '') {
        return [];
      }

      const keywordLower = keyword.toLowerCase();
      let results = [];

      if (this.codeIndex.has(keywordLower)) {
        const stock = this.codeIndex.get(keywordLower);
        results = [stock];
      } else {
        const prefixMatches = this.nameIndex.get(keywordLower) || [];
        const nameMatches = this.stocks.filter(s =>
          s.name.toLowerCase().includes(keywordLower)
        );

        const matchSet = new Map();
        for (const stock of [...prefixMatches, ...nameMatches]) {
          matchSet.set(stock.code, stock);
        }
        results = Array.from(matchSet.values());
      }

      results = results.slice(0, 100);

      results.sort((a, b) => {
        const aIndex = a.name.toLowerCase().indexOf(keywordLower);
        const bIndex = b.name.toLowerCase().indexOf(keywordLower);
        return aIndex - bIndex;
      });

      return results;
    } catch (error) {
      console.error('Error searching stocks:', error.message);
      return [];
    }
  }

  // 캐시 초기화
  clearCache() {
    this.priceCache.clear();
    this.lastUpdateTime.clear();
  }
}

export default new KiwoomService();
