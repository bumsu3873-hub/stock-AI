import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORTFOLIO_FILE = path.join(__dirname, '../data/portfolio.json');

class PortfolioService {
  constructor() {
    this.portfolioData = null;
    this.loadPortfolio();
  }

  loadPortfolio() {
    try {
      if (fs.existsSync(PORTFOLIO_FILE)) {
        const data = fs.readFileSync(PORTFOLIO_FILE, 'utf-8');
        this.portfolioData = JSON.parse(data);
      } else {
        this.portfolioData = this.getDefaultPortfolio();
        this.savePortfolio();
      }
    } catch (error) {
      console.error('[Portfolio] 포트폴리오 로드 실패:', error.message);
      this.portfolioData = this.getDefaultPortfolio();
    }
  }

  getDefaultPortfolio() {
    return {
      userId: 'default',
      balance: 5000000, // 초기 자본금 500만원
      holdings: [
        { code: '005930', name: '삼성전자', quantity: 10, avgPrice: 71000, purchaseDate: '2026-01-01' },
        { code: '035420', name: 'NAVER', quantity: 5, avgPrice: 210000, purchaseDate: '2026-01-02' },
        { code: '000660', name: 'SK하이닉스', quantity: 8, avgPrice: 125000, purchaseDate: '2026-01-03' },
      ],
      orders: [],
      transactions: [],
      updatedAt: new Date().toISOString(),
    };
  }

  savePortfolio() {
    try {
      this.portfolioData.updatedAt = new Date().toISOString();
      fs.writeFileSync(PORTFOLIO_FILE, JSON.stringify(this.portfolioData, null, 2), 'utf-8');
      console.log('[Portfolio] 포트폴리오 저장 완료');
    } catch (error) {
      console.error('[Portfolio] 포트폴리오 저장 실패:', error.message);
    }
  }

  getPortfolio() {
    return JSON.parse(JSON.stringify(this.portfolioData));
  }

  getBalance() {
    return {
      userId: this.portfolioData.userId,
      balance: this.portfolioData.balance,
      updatedAt: this.portfolioData.updatedAt,
    };
  }

  getHoldings() {
    return this.portfolioData.holdings;
  }

  // 매수 주문 저장
  addOrder(order) {
    const { code, name, quantity, price, orderType, timestamp } = order;
    
    if (!code || !quantity || !price || !orderType) {
      throw new Error('필수 필드 누락');
    }

    const newOrder = {
      id: `ORD_${Date.now()}`,
      code,
      name,
      quantity,
      price,
      orderType, // 'BUY' 또는 'SELL'
      totalPrice: quantity * price,
      timestamp: timestamp || new Date().toISOString(),
      status: 'COMPLETED',
    };

    // 주문 히스토리 추가
    this.portfolioData.orders.push(newOrder);

    // 포트폴리오 업데이트
    if (orderType === 'BUY') {
      this.addHolding(code, name, quantity, price);
      this.portfolioData.balance -= newOrder.totalPrice;
    } else if (orderType === 'SELL') {
      this.removeHolding(code, quantity, price);
      this.portfolioData.balance += newOrder.totalPrice;
    }

    // 거래 기록 추가
    this.portfolioData.transactions.push({
      id: newOrder.id,
      ...newOrder,
    });

    this.savePortfolio();
    return newOrder;
  }

  addHolding(code, name, quantity, avgPrice) {
    const existing = this.portfolioData.holdings.find(h => h.code === code);

    if (existing) {
      // 평균가 재계산
      const totalCost = existing.quantity * existing.avgPrice + quantity * avgPrice;
      const totalQuantity = existing.quantity + quantity;
      existing.quantity = totalQuantity;
      existing.avgPrice = Math.round(totalCost / totalQuantity);
    } else {
      // 새로운 종목 추가
      this.portfolioData.holdings.push({
        code,
        name,
        quantity,
        avgPrice: Math.round(avgPrice),
        purchaseDate: new Date().toISOString(),
      });
    }
  }

  removeHolding(code, quantity, sellPrice) {
    const holding = this.portfolioData.holdings.find(h => h.code === code);

    if (!holding) {
      throw new Error('보유하지 않은 종목입니다');
    }

    if (holding.quantity < quantity) {
      throw new Error('보유 수량이 부족합니다');
    }

    holding.quantity -= quantity;

    if (holding.quantity <= 0) {
      this.portfolioData.holdings = this.portfolioData.holdings.filter(h => h.code !== code);
    }
  }

  updateBalance(amount) {
    this.portfolioData.balance += amount;
    this.savePortfolio();
  }

  getTransactionHistory() {
    return this.portfolioData.transactions;
  }
}

export default new PortfolioService();
