const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const app = express();
app.use(cors());
app.use(express.json());

const KIS_API_URL = 'https://openapivts.koreainvestment.com:29443';
const APP_KEY = process.env.VITE_API_KEY;
const APP_SECRET = process.env.VITE_API_SECRET;

let accessToken = null;
let tokenExpireTime = null;

console.log('🚀 Server starting...');
console.log('📝 APP_KEY:', APP_KEY ? 'Loaded ✓' : 'Missing ❌');
console.log('📝 APP_SECRET:', APP_SECRET ? 'Loaded ✓' : 'Missing ❌');

async function getAccessToken() {
  try {
    if (accessToken && tokenExpireTime && new Date() < tokenExpireTime) {
      console.log('♻️ Using cached token');
      return accessToken;
    }

    console.log('🔄 Requesting new access token...');
    const response = await axios.post(
      `${KIS_API_URL}/oauth2/tokenP`,
      {
        grant_type: 'client_credentials',
        appkey: APP_KEY,
        appsecret: APP_SECRET
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    accessToken = response.data.access_token;
    tokenExpireTime = new Date(Date.now() + 55 * 60 * 1000);
    console.log('✅ Access token issued successfully');
    return accessToken;
  } catch (error) {
    console.error('❌ Token issuance failed:', error.response?.data || error.message);
    if (accessToken) {
      console.log('⚠️ Using existing token due to rate limit');
      return accessToken;
    }
    throw error;
  }
}

app.get('/api/stock/price/:code', async (req, res) => {
  try {
    const token = await getAccessToken();
    const { code } = req.params;

    const response = await axios.get(
      `${KIS_API_URL}/uapi/domestic-stock/v1/quotations/inquire-price`,
      {
        params: {
          FID_COND_MRKT_DIV_CODE: 'J',
          FID_INPUT_ISCD: code
        },
        headers: {
          Authorization: `Bearer ${token}`,
          'appKey': APP_KEY,
          'appSecret': APP_SECRET,
          'tr_id': 'FHKST01010100'
        }
      }
    );

    console.log(`✅ Stock price fetched for ${code}`);
    res.json(response.data);
  } catch (error) {
    console.error(`❌ Error fetching stock price:`, error.message);
    res.status(500).json({
      error: error.message,
      details: error.response?.data
    });
  }
});

app.get('/api/stock/hoga/:code', async (req, res) => {
  try {
    const token = await getAccessToken();
    const { code } = req.params;

    const response = await axios.get(
      `${KIS_API_URL}/uapi/domestic-stock/v1/quotations/inquire-asking-price`,
      {
        params: {
          FID_COND_MRKT_DIV_CODE: 'J',
          FID_INPUT_ISCD: code
        },
        headers: {
          Authorization: `Bearer ${token}`,
          'appKey': APP_KEY,
          'appSecret': APP_SECRET,
          'tr_id': 'FHKST01010200'
        }
      }
    );

    console.log(`✅ Hoga (asking price) fetched for ${code}`);
    res.json(response.data);
  } catch (error) {
    console.error(`❌ Error fetching hoga:`, error.message);
    res.status(500).json({
      error: error.message,
      details: error.response?.data
    });
  }
});

app.post('/api/order/buy', async (req, res) => {
  try {
    const token = await getAccessToken();
    const { code, quantity, price } = req.body;

    const accountNo = process.env.ACCOUNT_NUMBER || '50161039';
    const accountType = process.env.ACCOUNT_TYPE || '01';

    console.log(`📝 Buy order request: ${code} x${quantity} @ ${price}원`);
    console.log(`📊 Account: ${accountNo}-${accountType}`);

    const response = await axios.post(
      `${KIS_API_URL}/uapi/domestic-stock/v1/trading/order-cash`,
      {
        CANO: accountNo,
        ACNT_PRDT_CD: accountType,
        PDNO: code,
        ORD_QTY: quantity.toString(),
        ORD_UNPR: price.toString(),
        ORD_DVSN: '00'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'appKey': APP_KEY,
          'appSecret': APP_SECRET,
          'tr_id': 'TTTC0802U'
        }
      }
    );

    console.log(`✅ Buy order placed for ${code}`);
    res.json(response.data);
  } catch (error) {
    console.error(`❌ Error placing buy order:`, error.message);
    console.error(`📋 Error details:`, error.response?.data);
    res.status(500).json({
      error: error.message,
      details: error.response?.data
    });
  }
});

app.post('/api/order/sell', async (req, res) => {
  try {
    const token = await getAccessToken();
    const { code, quantity, price } = req.body;

    const accountNo = process.env.ACCOUNT_NUMBER || '50161039';
    const accountType = process.env.ACCOUNT_TYPE || '01';

    console.log(`📝 Sell order request: ${code} x${quantity} @ ${price}원`);
    console.log(`📊 Account: ${accountNo}-${accountType}`);

    const response = await axios.post(
      `${KIS_API_URL}/uapi/domestic-stock/v1/trading/order-cash`,
      {
        CANO: accountNo,
        ACNT_PRDT_CD: accountType,
        PDNO: code,
        ORD_QTY: quantity.toString(),
        ORD_UNPR: price.toString(),
        ORD_DVSN: '01'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'appKey': APP_KEY,
          'appSecret': APP_SECRET,
          'tr_id': 'TTTC0801U'
        }
      }
    );

    console.log(`✅ Sell order placed for ${code}`);
    res.json(response.data);
  } catch (error) {
    console.error(`❌ Error placing sell order:`, error.message);
    console.error(`📋 Error details:`, error.response?.data);
    res.status(500).json({
      error: error.message,
      details: error.response?.data
    });
  }
});

app.get('/api/portfolio/balance', async (req, res) => {
  try {
    const token = await getAccessToken();

    const accountNo = process.env.ACCOUNT_NUMBER || '50161039';
    const accountType = process.env.ACCOUNT_TYPE || '01';

    const response = await axios.get(
      `${KIS_API_URL}/uapi/domestic-stock/v1/trading/inquire-balance`,
      {
        params: {
          CANO: accountNo,
          ACNT_PRDT_CD: accountType
        },
        headers: {
          Authorization: `Bearer ${token}`,
          'appKey': APP_KEY,
          'appSecret': APP_SECRET,
          'tr_id': 'TTTC8434R'
        }
      }
    );

    console.log(`✅ Portfolio balance fetched`);
    res.json(response.data);
  } catch (error) {
    console.error(`❌ Error fetching balance:`, error.message);
    res.status(500).json({
      error: error.message,
      details: error.response?.data
    });
  }
});

app.get('/api/orders/history', async (req, res) => {
  try {
    const token = await getAccessToken();

    const accountNo = process.env.ACCOUNT_NUMBER || '50161039';
    const accountType = process.env.ACCOUNT_TYPE || '01';

    const response = await axios.get(
      `${KIS_API_URL}/uapi/domestic-stock/v1/trading/inquire-daily-ccld`,
      {
        params: {
          CANO: accountNo,
          ACNT_PRDT_CD: accountType,
          INQR_STRT_DT: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0].replace(/-/g, ''),
          INQR_END_DT: new Date().toISOString().split('T')[0].replace(/-/g, '')
        },
        headers: {
          Authorization: `Bearer ${token}`,
          'appKey': APP_KEY,
          'appSecret': APP_SECRET,
          'tr_id': 'TTTC8001R'
        }
      }
    );

    console.log(`✅ Order history fetched`);
    res.json(response.data);
  } catch (error) {
    console.error(`❌ Error fetching order history:`, error.message);
    res.status(500).json({
      error: error.message,
      details: error.response?.data
    });
  }
});

app.post('/api/stock/info', async (req, res) => {
  try {
    const token = await getAccessToken();
    const { codes } = req.body;

    const promises = codes.map(code =>
      axios.get(
        `${KIS_API_URL}/uapi/domestic-stock/v1/quotations/inquire-price`,
        {
          params: {
            FID_COND_MRKT_DIV_CODE: 'J',
            FID_INPUT_ISCD: code
          },
          headers: {
            Authorization: `Bearer ${token}`,
            'appKey': APP_KEY,
            'appSecret': APP_SECRET,
            'tr_id': 'FHKST01010100'
          }
        }
      ).catch(err => ({
        error: true,
        code,
        message: err.message
      }))
    );

    const results = await Promise.all(promises);
    console.log(`✅ Stock info fetched for ${codes.length} stocks`);
    res.json({ stocks: results });
  } catch (error) {
    console.error('❌ Error fetching stock info:', error.message);
    res.status(500).json({ error: error.message });
  }
});

const POPULAR_STOCKS = [
  { code: '005930', name: '삼성전자' },
  { code: '000660', name: 'SK하이닉스' },
  { code: '035420', name: 'NAVER' },
  { code: '035720', name: '카카오' },
  { code: '005380', name: '현대차' },
  { code: '051910', name: 'LG화학' },
  { code: '096770', name: 'SK이노베이션' },
  { code: '207940', name: '삼성바이오로직스' }
];

const STOCK_NAMES = {
  '005930': '삼성전자',
  '000660': 'SK하이닉스',
  '035420': 'NAVER',
  '035720': '카카오',
  '005380': '현대차',
  '051910': 'LG화학',
  '096770': 'SK이노베이션',
  '207940': '삼성바이오로직스',
  '005940': 'NH투자증권',
  '055550': '신한금융',
  '086790': '하나금융',
  '161390': '한국타이어',
  '068270': '셀트리온',
  '011200': '현대중공업',
  '015760': '한국전력',
  '034730': '한국수자원공사',
  '069620': 'LG전자',
  '028050': '삼성엔지니어링',
  '047040': 'BC',
  '009150': '삼성생명',
  '006280': '녹십자'
};

const SECTORS = {
  'IT': ['035420', '005930', '000660'],
  '금융': ['005940', '055550', '086790'],
  '자동차': ['005380', '161390', '068270'],
  '화학': ['051910', '096770', '011200'],
  '전기': ['015760', '034730', '069620'],
  '건설': ['028050', '047040', '011200'],
  '의약': ['009150', '006280', '068270']
};

const MOCK_LIMIT_UP_DATA = {
  '2026-01-28': [
    { code: '005930', name: '삼성전자', limitTime: '09:30', currentPrice: 162400, change: 2900, changeRate: '1.82%', volume: 29456431 },
    { code: '051910', name: 'LG화학', limitTime: '10:15', currentPrice: 185000, change: 3100, changeRate: '1.70%', volume: 5234100 },
    { code: '207940', name: '삼성바이오로직스', limitTime: '10:45', currentPrice: 890000, change: 8900, changeRate: '1.01%', volume: 1230000 },
  ],
  '2026-01-27': [
    { code: '035420', name: 'NAVER', limitTime: '09:45', currentPrice: 210000, change: 2100, changeRate: '1.01%', volume: 892000 },
    { code: '096770', name: 'SK이노베이션', limitTime: '11:20', currentPrice: 285000, change: 2850, changeRate: '1.01%', volume: 3456000 },
  ],
  '2026-01-24': [
    { code: '000660', name: 'SK하이닉스', limitTime: '09:30', currentPrice: 137400, change: 1374, changeRate: '1.01%', volume: 12345000 },
    { code: '005380', name: '현대차', limitTime: '10:30', currentPrice: 187000, change: 1870, changeRate: '1.01%', volume: 8765000 },
    { code: '035720', name: '카카오', limitTime: '14:50', currentPrice: 54900, change: 549, changeRate: '1.01%', volume: 4567000 },
  ]
};

app.get('/api/indices', async (req, res) => {
  try {
    const token = await getAccessToken();

    const indicesRepresentativeStocks = {
      'KOSPI': ['005930', '000660', '005380'],
      'KOSDAQ': ['035420', '251270', '247540']
    };

    const results = await Promise.all(
      Object.entries(indicesRepresentativeStocks).map(async ([name, stocks]) => {
        try {
          const stockDataList = await Promise.all(
            stocks.map(code =>
              axios.get(
                `${KIS_API_URL}/uapi/domestic-stock/v1/quotations/inquire-price`,
                {
                  params: {
                    FID_COND_MRKT_DIV_CODE: 'J',
                    FID_INPUT_ISCD: code
                  },
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'appKey': APP_KEY,
                    'appSecret': APP_SECRET,
                    'tr_id': 'FHKST01010100'
                  }
                }
              ).catch(err => ({ data: { output: {} } }))
            )
          );

          const validStocks = stockDataList
            .map(r => r.data.output || {})
            .filter(o => o.stck_prpr);

          if (validStocks.length === 0) return null;

          const avgChange = validStocks.reduce((sum, o) => sum + (parseInt(o.prdy_vrss) || 0), 0) / validStocks.length;
          const avgChangePercent = validStocks.reduce((sum, o) => sum + (parseFloat(o.prdy_ctrt) || 0), 0) / validStocks.length;

          return {
            code: name === 'KOSPI' ? '0001' : '1001',
            name: name,
            price: validStocks.reduce((sum, o) => sum + (parseInt(o.stck_prpr) || 0), 0) / validStocks.length,
            change: Math.round(avgChange),
            changePercent: avgChangePercent.toFixed(2),
            volume: validStocks.reduce((sum, o) => sum + (parseInt(o.acml_vol) || 0), 0)
          };
        } catch (error) {
          console.error(`⚠️ Failed to calculate ${name}:`, error.message);
          return null;
        }
      })
    );

     const validIndices = results.filter(r => r !== null);
     console.log('✅ Indices fetched (calculated from representative stocks)');
     res.json({ indices: validIndices });
   } catch (error) {
     console.error('❌ Error fetching indices:', error.message);
     res.json({ indices: [] });
   }
});

app.get('/api/sectors/:sector', async (req, res) => {
  try {
    const token = await getAccessToken();
    const { sector } = req.params;

    const codes = SECTORS[sector] || [];
    
    if (codes.length === 0) {
      return res.json({ stocks: [] });
    }

    const results = await Promise.all(
      codes.map(async (code) => {
        try {
          const response = await axios.get(
            `${KIS_API_URL}/uapi/domestic-stock/v1/quotations/inquire-price`,
            {
              params: {
                FID_COND_MRKT_DIV_CODE: 'J',
                FID_INPUT_ISCD: code
              },
              headers: {
                Authorization: `Bearer ${token}`,
                'appKey': APP_KEY,
                'appSecret': APP_SECRET,
                'tr_id': 'FHKST01010100'
              }
            }
          );

          const output = response.data.output || {};
          const koreanName = STOCK_NAMES[code] || output.hts_kor_isnm || code;
          return {
            code: code,
            name: koreanName,
            price: parseInt(output.stck_prpr) || 0,
            change: parseInt(output.prdy_vrss) || 0,
            changePercent: (parseFloat(output.prdy_ctrt) || 0).toFixed(2),
            volume: parseInt(output.acml_vol) || 0
          };
         } catch (error) {
           console.error(`Failed to fetch stock ${code}:`, error.message);
           return null;
         }
      })
    );

     const validStocks = results.filter(r => r !== null);
     console.log(`✅ Sector ${sector} stocks fetched`);
     res.json({ stocks: validStocks });
   } catch (error) {
     console.error(`❌ Error fetching sector ${sector} stocks:`, error.message);
     res.json({ stocks: [] });
   }
});

app.get('/api/stocks/limit-up', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.json({ stocks: [] });
    }

    const dateKey = date;
    const limitUpStocks = MOCK_LIMIT_UP_DATA[dateKey] || [];

    console.log(`✅ Limit-up stocks for ${date}: ${limitUpStocks.length} stocks`);
    res.json({ stocks: limitUpStocks });
  } catch (error) {
    console.error('❌ Error fetching limit-up stocks:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stocks/search', async (req, res) => {
  try {
    const { name } = req.query;
    const token = await getAccessToken();
    
    if (!name) {
      return res.json({ results: [] });
    }

    const matchingStocks = POPULAR_STOCKS.filter(
      stock => stock.name.includes(name) || stock.code.includes(name)
    );

    const results = await Promise.all(
      matchingStocks.map(async (stock) => {
        try {
          const response = await axios.get(
            `${KIS_API_URL}/uapi/domestic-stock/v1/quotations/inquire-price`,
            {
              params: {
                FID_COND_MRKT_DIV_CODE: 'J',
                FID_INPUT_ISCD: stock.code
              },
              headers: {
                Authorization: `Bearer ${token}`,
                'appKey': APP_KEY,
                'appSecret': APP_SECRET,
                'tr_id': 'FHKST01010100'
              }
            }
          );

          const output = response.data.output || {};
          return {
            code: stock.code,
            name: stock.name,
            price: parseInt(output.stck_prpr) || 0,
            change: parseInt(output.prdy_vrss) || 0,
            changePercent: parseFloat(output.prdy_ctrt) || 0
          };
        } catch (error) {
          return {
            code: stock.code,
            name: stock.name,
            price: 0,
            change: 0,
            changePercent: 0
          };
        }
      })
    );

    console.log(`✅ Search results for "${name}": ${results.length} stocks`);
    res.json({ results });
  } catch (error) {
    console.error('❌ Search error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n✅ Proxy server running on http://localhost:${PORT}`);
  console.log(`✅ REST API endpoints:`);
  console.log(`   - GET  /api/indices`);
  console.log(`   - GET  /api/sectors/:sector`);
  console.log(`   - GET  /api/stock/price/:code`);
  console.log(`   - GET  /api/stock/hoga/:code`);
  console.log(`   - POST /api/order/buy`);
  console.log(`   - POST /api/order/sell`);
  console.log(`   - GET  /api/portfolio/balance`);
  console.log(`   - GET  /api/orders/history`);
  console.log(`   - GET  /api/stocks/search?name=...`);
  console.log(`   - GET  /api/stocks/limit-up?date=...`);
  console.log(`\n🎯 Ready to connect to KIS API!`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});
