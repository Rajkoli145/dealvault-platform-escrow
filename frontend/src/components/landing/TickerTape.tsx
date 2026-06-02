import React from 'react';

const TickerTape: React.FC = () => {
  const cryptoData = [
    { name: 'Bitcoin', symbol: 'BTC', price: '$38,619.91', change: '+1.59%', isUp: true },
    { name: 'Ethereum', symbol: 'ETH', price: '$2,695.01', change: '+2.15%', isUp: true },
    { name: 'Tether', symbol: 'USDT', price: '$1.00', change: '+0.02%', isUp: true },
    { name: 'Solana', symbol: 'SOL', price: '$98.42', change: '-0.50%', isUp: false },
    { name: 'Binance Coin', symbol: 'BNB', price: '$312.10', change: '+1.20%', isUp: true },
  ];

  return (
    <div className="w-full bg-[#111111] border-b border-[#262626] overflow-hidden whitespace-nowrap py-2 flex items-center text-sm font-medium">
      <div className="flex items-center px-4 text-gray-400 gap-2 shrink-0 border-r border-[#262626] mr-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        24 hours
      </div>
      
      {/* Scroll container (would animate normally, simplified here for layout) */}
      <div className="flex items-center gap-8 animate-float" style={{ animation: 'none' }}>
        {cryptoData.map((coin, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-700 flex items-center justify-center text-[10px]">
              {coin.symbol[0]}
            </div>
            <span className="text-gray-300">{coin.name} ({coin.symbol})</span>
            <span className="text-white">{coin.price}</span>
            <span className={`flex items-center gap-1 ${coin.isUp ? 'text-brand-400' : 'text-red-500'}`}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={!coin.isUp ? 'rotate-180' : ''}>
                <path d="M12 19V5M5 12l7-7 7 7"/>
              </svg>
              {coin.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TickerTape;
