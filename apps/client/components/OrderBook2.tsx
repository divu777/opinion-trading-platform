"use client"
import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, BarChart3, Activity } from 'lucide-react';
import { useSocket } from '@/lib/socket/useSocket';
import { orderRequest } from '@/lib/utils';

interface Order {
  price: string;
  totalQty: number;
}

interface MarketData {
  Yes: Order[];
  No: Order[];
}

enum SIDE {
  BUY="BUY",
  SELL="SELL",
}



 const OpinionOrderBook = ({
  market,
  marketId,
}: {
  market: MarketData;
  marketId: string;
}) => {
  const [marketData,setMarket] = useState(market);

  const yesOrders = marketData.Yes;
  const noOrders = marketData.No;
  const topYesPrice = parseFloat(yesOrders[0]?.price || "0");
  const topNoPrice = parseFloat(noOrders[0]?.price || "0");
  const [activeSide, setActiveSide] = useState<SIDE>(SIDE.BUY);
  const [yesSelected, setYesSelected] = useState(true);
  const [price, setPrice] = useState(topYesPrice);
  const [shares, setShares] = useState(0);


  const maxYesTotal = Math.max(...yesOrders.map((o) => o.totalQty), 1);
  const maxNoTotal = Math.max(...noOrders.map((o) => o.totalQty), 1);


  const probability = topYesPrice + topNoPrice > 0 
    ? (topYesPrice / (topYesPrice + topNoPrice)) * 100 
    : 0;

  const handleIncrement = (amount: number, fn: React.Dispatch<React.SetStateAction<number>>) => {
    fn((prev) => Math.max(0, prev + amount));
  };

  const handleTrade = async() => {

    const response = await orderRequest({userId:'divu',ticket_type:yesSelected?"YES":"NO",order_type:SIDE[activeSide],quantity:shares,price,marketId})

    console.log({
      side: SIDE[activeSide],
      position: yesSelected ? "Yes" : "No",
      price,
      shares,
      total: (shares * (price)),
      toWin: (shares * (10-price+price))
    });
  };


  const totalQty = yesOrders.reduce((sum,order)=>order.totalQty+sum,0) +noOrders.reduce((sum,order)=>order.totalQty+sum,0)

    const socket = useSocket();
  useEffect(() => {
      if (socket) {
        socket.send(
          JSON.stringify({
            type: "SUBSCRIBE_MARKET",
            payload: { marketId: marketId },
          })
        );
        socket.onmessage = (event) => {
          setMarket(JSON.parse(event.data));
          console.log(event.data);
        };
      }
  
      return () => {
        if (socket) {
          socket.send(
            JSON.stringify({
              type: "UNSUBSCIBE_MARKET",
              payload: {
                marketId: marketId,
              },
            })
          );
        }
      };
    }, [market, socket]);

  return (
    <div className="bg-white min-h-screen text-black">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
             
              <div className="hidden lg:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-600">Market ID: {marketId}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-600">Volume: {totalQty}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 bg-gray-100 px-2 sm:px-4 py-1 sm:py-2 rounded-full border">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm text-gray-700">Live</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-3 sm:p-6 flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Order Book Section */}
        <div className="flex-1 space-y-4 lg:space-y-6">
          {/* Probability Display */}
          <div className="bg-white border-2 border-black rounded-lg p-4 sm:p-6">
            <div className="text-center">
              <h2 className="text-2xl sm:text-4xl font-bold mb-2 text-black">
                {probability.toFixed(1)}%
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 font-medium">Implied Probability</p>
              <div className="w-full bg-gray-200 rounded-full h-3 border">
                <div 
                  className="bg-black h-3 rounded-full transition-all duration-500"
                  style={{ width: `${probability}%` }}
                />
              </div>
            </div>
          </div>

          {/* Order Book */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* YES Orders */}
            <div className="bg-white border-2 border-black rounded-lg p-4 sm:p-6">
              <div className="flex items-center space-x-2 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b-2 border-gray-200">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <h3 className="text-base sm:text-lg font-bold text-black">YES Orders</h3>
                <div className="ml-auto text-xs sm:text-sm text-gray-600 font-mono">
                  Best: ₹{topYesPrice}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs font-bold text-gray-500 border-b border-gray-200 pb-2 mb-3">
                  <span>PRICE</span>
                  <span className="text-center">QTY</span>
                  <span className="text-right">TOTAL</span>
                </div>
                {yesOrders.map((order, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-3 gap-2 sm:gap-4 items-center py-1 sm:py-2 px-2 sm:px-3 rounded hover:bg-gray-50 transition-all duration-200 hover:scale-[1.01] cursor-pointer relative overflow-hidden border-b border-gray-100 group"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <span className="text-black font-bold font-mono z-10 transition-colors duration-200 group-hover:text-green-600 text-xs sm:text-sm">₹{order.price}</span>
                    <span className="text-center text-gray-700 font-mono z-10 transition-colors duration-200 text-xs sm:text-sm">{order.totalQty.toLocaleString()}</span>
                    <span className="text-right text-gray-700 font-mono z-10">
                      ₹{(parseFloat(order.price) * order.totalQty).toLocaleString()}
                    </span>
                    <div
                      className="absolute left-0 top-0 h-full bg-green-500 opacity-20 transition-all duration-500 group-hover:opacity-30"
                      style={{ width: `${(order.totalQty / maxYesTotal) * 100}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* NO Orders */}
            <div className="bg-white border-2 border-black rounded-lg p-4 sm:p-6">
              <div className="flex items-center space-x-2 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b-2 border-gray-200">
                <TrendingDown className="w-5 h-5 text-red-500" />
                <h3 className="text-base sm:text-lg font-bold text-black">NO Orders</h3>
                <div className="ml-auto text-xs sm:text-sm text-gray-600 font-mono">
                  Best: ₹{topNoPrice}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs font-bold text-gray-500 border-b border-gray-200 pb-2 mb-3">
                  <span>PRICE</span>
                  <span className="text-center">QTY</span>
                  <span className="text-right">TOTAL</span>
                </div>
                {noOrders.map((order, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-3 gap-2 sm:gap-4 items-center py-1 sm:py-2 px-2 sm:px-3 rounded hover:bg-gray-50 transition-all duration-200 hover:scale-[1.01] cursor-pointer relative overflow-hidden border-b border-gray-100 group"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <span className="text-black font-bold font-mono z-10 transition-colors duration-200 group-hover:text-red-600 text-xs sm:text-sm">₹{order.price}</span>
                    <span className="text-center text-gray-700 font-mono z-10 transition-colors duration-200 text-xs sm:text-sm">{order.totalQty.toLocaleString()}</span>
                    <span className="text-right text-gray-700 font-mono z-10">
                      ₹{(parseFloat(order.price) * order.totalQty).toLocaleString()}
                    </span>
                    <div
                      className="absolute right-0 top-0 h-full bg-red-500 opacity-20 transition-all duration-500 group-hover:opacity-30"
                      style={{ width: `${(order.totalQty / maxNoTotal) * 100}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Trading Panel */}
        <div className="w-full lg:w-80">
          <div className="bg-white border-2 border-black rounded-lg p-4 sm:p-6 lg:sticky lg:top-6">
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center space-x-2 text-black">
              <DollarSign className="w-5 h-5 text-black" />
              <span>Place Order</span>
            </h3>

            {/* Buy/Sell Tabs */}
            <div className="flex space-x-0 mb-4 sm:mb-6 border-2 border-black rounded-lg overflow-hidden">
              <button
                onClick={() => {setActiveSide(SIDE.BUY); console.log(activeSide+"======")}}
                className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 font-bold transition-all duration-300 transform hover:scale-[1.02] text-sm sm:text-base ${
                  activeSide === SIDE.BUY
                    ? "bg-black text-white"
                    : "bg-white text-black hover:bg-gray-100"
                }`}
              >
                BUY
              </button>
              <button
                onClick={() => setActiveSide(SIDE.SELL)}
                className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 font-bold transition-all duration-300 transform hover:scale-[1.02] border-l-2 border-black text-sm sm:text-base ${
                  activeSide === SIDE.SELL
                    ? "bg-black text-white"
                    : "bg-white text-black hover:bg-gray-100"
                }`}
              >
                SELL
              </button>
            </div>

            {/* Yes/No Selection */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
              <button
                onClick={() => {setYesSelected(true); setPrice(topYesPrice)}}
                className={`py-3 sm:py-4 rounded-lg font-bold transition-all duration-300 transform hover:scale-[1.05] active:scale-[0.98] border-2 ${
                  yesSelected 
                    ? "bg-green-500 text-white border-green-500 shadow-lg " 
                    : "bg-white text-black border-black hover:bg-gray-50 hover:border-green-500"
                }`}
              >
                <div className="text-sm font-bold">YES</div>
                <div className="text-base sm:text-lg font-mono">₹{topYesPrice}</div>
              </button>
              <button
                onClick={() => {setYesSelected(false); setPrice(topNoPrice)}}
                className={`py-3 sm:py-4 rounded-lg font-bold transition-all duration-300 transform hover:scale-[1.05] active:scale-[0.98] border-2 ${
                  !yesSelected 
                    ? "bg-red-500 text-white border-red-500 shadow-lg" 
                    : "bg-white text-black border-black hover:bg-gray-50 hover:border-red-500"
                }`}
              >
                <div className="text-sm font-bold">NO</div>
                <div className="text-base sm:text-lg font-mono">₹{topNoPrice}</div>
              </button>
            </div>

            {/* Price Control */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-bold text-black mb-2">
                PRICE PER SHARE
              </label>
              <div className="flex items-center border-2 border-black rounded-lg overflow-hidden">
                <button
                  onClick={() => handleIncrement(-1, setPrice)}
                  className="w-10 sm:w-12 h-10 sm:h-12 bg-white hover:bg-gray-100 transition-all duration-200 transform hover:scale-110 active:scale-95 flex items-center justify-center font-bold text-base sm:text-lg border-r-2 border-black"
                >
                  −
                </button>
                <div className="flex-1 text-center font-bold text-base sm:text-lg font-mono py-2 sm:py-3 bg-white transition-all duration-200">
                  ₹{price}
                </div>
                <button
                  onClick={() => handleIncrement(1, setPrice)}
                  className="w-10 sm:w-12 h-10 sm:h-12 bg-white hover:bg-gray-100 transition-all duration-200 transform hover:scale-110 active:scale-95 flex items-center justify-center font-bold text-base sm:text-lg border-l-2 border-black"
                >
                  +
                </button>
              </div>
            </div>

            {/* Shares Input */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-bold text-black mb-2">
                NUMBER OF SHARES
              </label>
              <input
                type="number"
                value={shares}
                onChange={(e) => setShares(parseInt(e.target.value) || 0)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-white border-2 border-black focus:outline-none focus:ring-4 focus:ring-gray-200 focus:border-gray-400 transition-all duration-300 font-mono transform focus:scale-[1.02] text-sm sm:text-base"
                placeholder="Enter shares..."
              />
              
              <div className="flex items-center justify-between mt-3">
                <div className="text-xs text-gray-600 font-mono">
                  Available: {yesSelected 
                    ? yesOrders.find(o => parseInt(o.price) === price)?.totalQty || 0
                    : noOrders.find(o => parseInt(o.price) === price)?.totalQty || 0
                  } shares
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleIncrement(-10, setShares)}
                    className="px-2 sm:px-3 py-1 text-xs rounded border border-black bg-white hover:bg-gray-100 transition-all duration-200 transform hover:scale-110 active:scale-95 font-bold"
                  >
                    -10
                  </button>
                  <button
                    onClick={() => handleIncrement(10, setShares)}
                    className="px-2 sm:px-3 py-1 text-xs rounded border border-black bg-white hover:bg-gray-100 transition-all duration-200 transform hover:scale-110 active:scale-95 font-bold"
                  >
                    +10
                  </button>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            {/* <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg border-2 border-gray-200 transition-all duration-300 hover:shadow-md">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 font-bold">TOTAL COST</span>
                <span className="font-bold text-black font-mono transition-all duration-200">₹{totalCost}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 font-bold">POTENTIAL WIN</span>
                <span className="font-bold text-black font-mono transition-all duration-200">₹{toWin}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t-2 border-gray-300">
                <span className="text-gray-700 font-bold">MAX RETURN</span>
                <span className="font-bold text-black font-mono transition-all duration-200">
                  {toWin !== 0.00 ? `${(((toWin) / (totalCost)) * 100).toFixed(1)}%` : "0%"}
                </span>
              </div>
            </div> */}

            {/* Trade Button */}
            <button
              onClick={handleTrade}
              disabled={shares === 0}
              className={`w-full py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition-all duration-300 transform border-2 ${
                shares  > 0
                  ? "bg-black text-white border-black hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                  : "bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed"
              }`}
            >
              {activeSide === SIDE.BUY ? "PLACE BUY ORDER" : "PLACE SELL ORDER"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpinionOrderBook