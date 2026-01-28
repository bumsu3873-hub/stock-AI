import React from 'react';

const Portfolio = ({ portfolio, currentPrices }) => {
  const totalValue = portfolio.reduce((acc, item) => {
    const currentPrice = currentPrices[item.id] || item.avgPrice;
    return acc + (currentPrice * item.amount);
  }, 0);

  const totalCost = portfolio.reduce((acc, item) => acc + (item.avgPrice * item.amount), 0);
  const totalProfit = totalValue - totalCost;
  const totalProfitRate = (totalProfit / totalCost) * 100;

  return (
    <div className="w-full bg-panel rounded-lg border border-border flex flex-col h-full">
      <div className="p-3 border-b border-border flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-200">내 계좌</h2>
        <div className="text-right">
          <div className="text-xs text-slate-400">총 평가금액</div>
          <div className="font-mono font-bold text-slate-100">{totalValue.toLocaleString()}원</div>
        </div>
      </div>
      
      <div className="p-3 bg-slate-800/30 border-b border-border flex justify-between items-center text-sm">
        <span className="text-slate-400">총 손익</span>
        <span className={`font-mono font-bold ${totalProfit > 0 ? 'text-up' : 'text-down'}`}>
          {totalProfit > 0 ? '+' : ''}{totalProfit.toLocaleString()} ({totalProfitRate.toFixed(2)}%)
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 bg-slate-800/50 sticky top-0">
            <tr>
              <th className="px-4 py-2">종목</th>
              <th className="px-4 py-2 text-right">보유수량</th>
              <th className="px-4 py-2 text-right">평가손익</th>
              <th className="px-4 py-2 text-right">수익률</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.map((item) => {
              const currentPrice = currentPrices[item.id] || item.avgPrice;
              const valuation = currentPrice * item.amount;
              const cost = item.avgPrice * item.amount;
              const profit = valuation - cost;
              const profitRate = (profit / cost) * 100;
              const isUp = profit > 0;

              return (
                <tr key={item.id} className="border-b border-slate-800 hover:bg-slate-700/30">
                  <td className="px-4 py-3 font-medium text-slate-200">
                    {item.name}
                    <span className="block text-xs text-slate-500">{item.avgPrice.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-300">
                    {item.amount}주
                  </td>
                  <td className={`px-4 py-3 text-right font-mono ${isUp ? 'text-up' : 'text-down'}`}>
                    {profit > 0 ? '+' : ''}{profit.toLocaleString()}
                  </td>
                  <td className={`px-4 py-3 text-right font-mono ${isUp ? 'text-up' : 'text-down'}`}>
                    {profitRate.toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Portfolio;
