import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';

// 1. CONSTANTS
const API_KEY = 'd5doilpr01qur4itjvj0d5doilpr01qur4itjvjg'; // <--- PASTE YOUR KEY HERE
const WATCHLIST = ['BINANCE:BTCUSDT', 'BINANCE:ETHUSDT', 'BINANCE:DOGEUSDT', 'AAPL'];

const StockDashboard = () => {
  const [stockData, setStockData] = useState({});
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [chartData, setChartData] = useState([]);
  const ws = useRef(null);

  // 2. SETUP WEBSOCKET CONNECTION
  useEffect(() => {
    // We add a check to make sure the key exists
    if (!API_KEY || API_KEY.includes('YOUR_')) return;

    const socket = new WebSocket(`wss://ws.finnhub.io?token=${API_KEY}`);
    ws.current = socket;

    socket.onopen = () => {
      console.log("Connected to Market Data!");
      WATCHLIST.forEach((symbol) => {
        socket.send(JSON.stringify({ type: 'subscribe', symbol: symbol }));
      });
    };

    socket.onmessage = (event) => {
      const response = JSON.parse(event.data);
      if (response.type === 'trade') {
        const latestTrade = response.data[0];
        const symbol = latestTrade.s;
        const price = latestTrade.p;

        setStockData((prev) => ({
          ...prev,
          [symbol]: {
            price: price.toFixed(2),
            change: (Math.random() * 2 - 1).toFixed(2) 
          }
        }));

        if (symbol === selectedStock) {
          setChartData((prev) => {
            const newData = [...prev, { time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}), price }];
            return newData.slice(-20); // Keep last 20 ticks
          });
        }
      }
    };

    socket.onerror = (err) => console.error("WebSocket Error:", err);

    return () => socket.close();
  }, [selectedStock]);

  // 3. THE UI RENDER
  return (
    <div className="flex h-screen w-full overflow-hidden font-sans text-gray-700">
      
      {/* LEFT: WATCHLIST (Zerodha Style) */}
      <div className="w-1/4 border-r border-gray-300 bg-white flex flex-col">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center bg-gray-100 p-2 rounded text-sm">
            <Search size={16} className="mr-2 text-gray-500"/>
            <input placeholder="Search eg: INF" className="bg-transparent outline-none w-full"/>
          </div>
        </div>

        {/* Stock List */}
        <div className="flex-1 overflow-y-auto">
          {WATCHLIST.map((symbol) => {
            const data = stockData[symbol] || { price: '---', change: '0.00' };
            const isPositive = parseFloat(data.change) >= 0;

            return (
              <div 
                key={symbol}
                onClick={() => { setSelectedStock(symbol); setChartData([]); }}
                className={`p-4 flex justify-between items-center border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${selectedStock === symbol ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
              >
                <div>
                  <div className="font-semibold text-sm">{symbol}</div>
                  <div className="text-xs text-gray-400">NASDAQ</div>
                </div>
                <div className="text-right">
                  <div className={`font-mono text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {data.price}
                  </div>
                  <div className="text-xs flex items-center justify-end text-gray-500">
                    {data.change}% 
                    {isPositive ? <TrendingUp size={12} className="ml-1 text-green-600"/> : <TrendingDown size={12} className="ml-1 text-red-600"/>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: CHART & DETAILS */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Header */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6 justify-between shadow-sm">
          <div className="flex items-baseline">
            <h1 className="text-xl font-bold mr-4">{selectedStock}</h1>
            <span className="text-2xl font-mono text-gray-800">
              ${stockData[selectedStock]?.price || '0.00'}
            </span>
          </div>
          <div className="flex space-x-4 text-sm font-semibold">
            <button className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">BUY</button>
            <button className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600">SELL</button>
          </div>
        </div>

        {/* Chart Area */}
        <div className="flex-1 p-6">
          <div className="bg-white p-4 rounded shadow-sm h-full border border-gray-200">
            <div className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="time" hide={true} />
                  <YAxis domain={['auto', 'auto']} orientation="right" tick={{fontSize: 12}} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#2563eb" 
                    strokeWidth={2} 
                    dot={false} 
                    isAnimationActive={false} // Disable animation for smoother live updates
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDashboard;