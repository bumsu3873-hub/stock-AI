import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

const WatchList = ({ stocks }) => {
  return (
    <div className="w-full bg-panel rounded-lg border border-border flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <h2 className="text-lg font-bold text-slate-200">관심 종목</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 bg-slate-800/50 sticky top-0">
            <tr>
              <th className="px-4 py-2">종목명</th>
              <th className="px-4 py-2 text-right">현재가</th>
              <th className="px-4 py-2 text-right">등락률</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock) => {
              const isUp = stock.change > 0;
              const isDown = stock.change < 0;
              const colorClass = isUp ? 'text-up' : isDown ? 'text-down' : 'text-slate-400';
              
              return (
                <tr key={stock.id} className="border-b border-slate-800 hover:bg-slate-700/30 cursor-pointer transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-200">
                    {stock.name}
                    <span className="block text-xs text-slate-500">{stock.id}</span>
                  </td>
                  <td className={`px-4 py-3 text-right font-mono ${colorClass}`}>
                    {stock.price.toLocaleString()}
                  </td>
                  <td className={`px-4 py-3 text-right font-mono ${colorClass}`}>
                    <div className="flex items-center justify-end gap-1">
                      {isUp && <ArrowUp size={12} />}
                      {isDown && <ArrowDown size={12} />}
                      {!isUp && !isDown && <Minus size={12} />}
                      {stock.changeRate.toFixed(2)}%
                    </div>
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

export default WatchList;
