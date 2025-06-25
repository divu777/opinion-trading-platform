'use client'
import { useSocket } from '@/lib/socket/useSocket';
import React, { useEffect } from 'react';

interface Order {
  price: string;
  totalQty: number;
}

interface MarketData {
  Yes: Order[];
  No: Order[];
}


const OpinionOrderBook = ({ market }: { market: MarketData }) => {

    const socket = useSocket();


    useEffect(()=>{
        if(market){
            socket?.send(JSON.stringify({ "name" :"hello"}));
        }

    },[market,socket])



      console.log("yes order -----> "+ JSON.stringify(market.Yes))

  const yesOrders = market.Yes;
  console.log("yes order -----> "+ JSON.stringify(yesOrders))
  const noOrders = market.No;

  const maxYesTotal = Math.max(...yesOrders.map((o) => o.totalQty), 1);
  const maxNoTotal = Math.max(...noOrders.map((o) => o.totalQty), 1);

  const topYesPrice = parseFloat(yesOrders[0]?.price || '0');
  const topNoPrice = parseFloat(noOrders[0]?.price || '0');

  const probability =
    topYesPrice + topNoPrice > 0
      ? (topYesPrice / (topYesPrice + topNoPrice)) * 100
      : 0;

  return (
    <div className="bg-[#0e0e0e] text-white p-6 min-h-screen font-mono">
      {/* Header */}
      <div className="text-center text-xl mb-6 text-[#ff7f11] font-semibold">
        🧠 Implied Probability: {probability.toFixed(2)}%
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 max-w-6xl mx-auto text-sm">
        {/* YES Column */}
        <div className="text-green-400">
          <div className="mb-2 font-semibold text-center">📈 YES Orders</div>
          {yesOrders.map((order, idx) => (
            <div key={idx} className="flex justify-between items-center relative py-1 px-2">
              <span className="z-10 w-[33%] text-left">${order.price}</span>
              <span className="z-10 w-[33%] text-right">{order.totalQty.toFixed(2)}</span>
              <div
                className="absolute left-0 top-0 h-full bg-green-700 opacity-30"
                style={{ width: `${(order.totalQty / maxYesTotal) * 100}%` }}
              />
            </div>
          ))}
        </div>

        {/* NO Column */}
        <div className="text-red-400">
          <div className="mb-2 font-semibold text-center">📉 NO Orders</div>
          {noOrders.map((order, idx) => (
            <div key={idx} className="flex justify-between items-center relative py-1 px-2">
              <span className="z-10 w-[33%] text-left">${order.price}</span>
              <span className="z-10 w-[33%] text-right">{order.totalQty.toFixed(2)}</span>
              <div
                className="absolute right-0 top-0 h-full bg-red-700 opacity-30"
                style={{ width: `${(order.totalQty / maxNoTotal) * 100}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OpinionOrderBook;
