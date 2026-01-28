import React from 'react';
import { Clock } from 'lucide-react';

const NewsFeed = ({ news }) => {
  return (
    <div className="w-full bg-panel rounded-lg border border-border flex flex-col h-full">
      <div className="p-3 border-b border-border flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-200">뉴스 속보</h2>
        <span className="text-xs text-slate-500 flex items-center gap-1">
          <Clock size={12} /> 실시간
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {news.map((item) => (
          <div key={item.id} className="p-3 bg-slate-800/50 rounded border border-slate-700/50 hover:bg-slate-700/50 transition-colors cursor-pointer">
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs text-blue-400 font-medium bg-blue-400/10 px-1.5 py-0.5 rounded">
                {item.source}
              </span>
              <span className="text-xs text-slate-500">{item.time}</span>
            </div>
            <h3 className="text-sm text-slate-200 leading-snug hover:text-blue-400 transition-colors">
              {item.title}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsFeed;
