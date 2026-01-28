export const calculateRSI = (prices, period = 14) => {
  if (prices.length < period + 1) return [];

  const deltas = [];
  for (let i = 1; i < prices.length; i++) {
    deltas.push(prices[i] - prices[i - 1]);
  }

  let gains = 0;
  let losses = 0;

  for (let i = 0; i < period; i++) {
    if (deltas[i] > 0) gains += deltas[i];
    else losses += Math.abs(deltas[i]);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  const rsi = [];
  
  for (let i = period; i < deltas.length; i++) {
    if (deltas[i] > 0) gains = deltas[i];
    else gains = 0;

    if (deltas[i] < 0) losses = Math.abs(deltas[i]);
    else losses = 0;

    avgGain = (avgGain * (period - 1) + gains) / period;
    avgLoss = (avgLoss * (period - 1) + losses) / period;

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi.push(100 - 100 / (1 + rs));
  }

  return rsi;
};

export const calculateEMA = (prices, period) => {
  if (prices.length < period) return [];

  const multiplier = 2 / (period + 1);
  const ema = [];

  let sum = prices.slice(0, period).reduce((a, b) => a + b, 0);
  ema.push(sum / period);

  for (let i = period; i < prices.length; i++) {
    ema.push(prices[i] * multiplier + ema[ema.length - 1] * (1 - multiplier));
  }

  return ema;
};

export const calculateMACD = (prices, fast = 12, slow = 26, signal = 9) => {
  const fastEMA = calculateEMA(prices, fast);
  const slowEMA = calculateEMA(prices, slow);

  const minLength = Math.min(fastEMA.length, slowEMA.length);
  const macd = [];

  for (let i = 0; i < minLength; i++) {
    macd.push(fastEMA[fastEMA.length - minLength + i] - slowEMA[slowEMA.length - minLength + i]);
  }

  const signalLine = calculateEMA(macd, signal);
  const histogram = [];

  for (let i = 0; i < signalLine.length; i++) {
    histogram.push(macd[macd.length - signalLine.length + i] - signalLine[i]);
  }

  return {
    macd: macd.slice(-signalLine.length),
    signal: signalLine,
    histogram
  };
};

export const calculateBollingerBands = (prices, period = 20, stdDev = 2) => {
  if (prices.length < period) return [];

  const bands = [];

  for (let i = period - 1; i < prices.length; i++) {
    const slice = prices.slice(i - period + 1, i + 1);
    const sma = slice.reduce((a, b) => a + b, 0) / period;

    const squareDiffs = slice.map(price => Math.pow(price - sma, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / period;
    const sd = Math.sqrt(avgSquareDiff);

    bands.push({
      upper: sma + sd * stdDev,
      middle: sma,
      lower: sma - sd * stdDev
    });
  }

  return bands;
};

export const calculateSMA = (prices, period) => {
  if (prices.length < period) return [];

  const sma = [];
  for (let i = period - 1; i < prices.length; i++) {
    const slice = prices.slice(i - period + 1, i + 1);
    const avg = slice.reduce((a, b) => a + b, 0) / period;
    sma.push(avg);
  }

  return sma;
};

export const calculateATR = (highs, lows, closes, period = 14) => {
  if (highs.length < period) return [];

  const tr = [];
  for (let i = 0; i < highs.length; i++) {
    let trValue;
    if (i === 0) {
      trValue = highs[i] - lows[i];
    } else {
      const tr1 = highs[i] - lows[i];
      const tr2 = Math.abs(highs[i] - closes[i - 1]);
      const tr3 = Math.abs(lows[i] - closes[i - 1]);
      trValue = Math.max(tr1, tr2, tr3);
    }
    tr.push(trValue);
  }

  const atr = [];
  let sum = tr.slice(0, period).reduce((a, b) => a + b, 0);
  atr.push(sum / period);

  for (let i = period; i < tr.length; i++) {
    atr.push((atr[atr.length - 1] * (period - 1) + tr[i]) / period);
  }

  return atr;
};

export const calculateStochastic = (highs, lows, closes, period = 14, smoothK = 3, smoothD = 3) => {
  if (highs.length < period) return [];

  const k = [];
  for (let i = period - 1; i < highs.length; i++) {
    const highSlice = highs.slice(i - period + 1, i + 1);
    const lowSlice = lows.slice(i - period + 1, i + 1);

    const highestHigh = Math.max(...highSlice);
    const lowestLow = Math.min(...lowSlice);

    const kValue = ((closes[i] - lowestLow) / (highestHigh - lowestLow)) * 100;
    k.push(kValue);
  }

  const smoothedK = calculateSMA(k, smoothK);
  const d = calculateSMA(smoothedK, smoothD);

  return {
    k: smoothedK,
    d: d
  };
};

export const calculateCCI = (highs, lows, closes, period = 20) => {
  if (highs.length < period) return [];

  const cci = [];

  for (let i = period - 1; i < closes.length; i++) {
    const typicalPrices = [];
    for (let j = i - period + 1; j <= i; j++) {
      typicalPrices.push((highs[j] + lows[j] + closes[j]) / 3);
    }

    const smaTP = typicalPrices.reduce((a, b) => a + b, 0) / period;
    const meanDeviation = typicalPrices.reduce((sum, tp) => sum + Math.abs(tp - smaTP), 0) / period;

    const currentTP = (highs[i] + lows[i] + closes[i]) / 3;
    const cciValue = meanDeviation !== 0 ? (currentTP - smaTP) / (0.015 * meanDeviation) : 0;

    cci.push(cciValue);
  }

  return cci;
};

export const calculateSharpeRatio = (returns, riskFreeRate = 0.02) => {
  if (returns.length === 0) return 0;

  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return 0;
  return (avgReturn - riskFreeRate / 252) / stdDev * Math.sqrt(252);
};

export const calculateMaxDrawdown = (prices) => {
  if (prices.length === 0) return 0;

  let maxPrice = prices[0];
  let maxDrawdown = 0;

  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > maxPrice) {
      maxPrice = prices[i];
    }
    const drawdown = (maxPrice - prices[i]) / maxPrice;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  return maxDrawdown;
};
