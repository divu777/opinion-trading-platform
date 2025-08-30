"use client";
import { useSocket } from "@/lib/socket/useSocket";
import axios from "axios";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";

interface Order {
  price: string;
  totalQty: number;
}

interface MarketData {
  Yes: Order[];
  No: Order[];
}

enum SIDE {
  BUY,
  SELL,
}

const OpinionOrderBook = ({
  market,
  marketId,
}: {
  market: MarketData;
  marketId: string;
}) => {
  const [marketData, setMarket] = useState(market);
  const socket = useSocket();
  const [activeSide, setActiveSide] = useState<SIDE>(SIDE.BUY);
  const [yesSelected, setYesSelected] = useState(true);
  const [price, setPrice] = useState(5);
  const [shares, setShares] = useState(0);

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


  const yesOrders = marketData.Yes;
  const noOrders = marketData.No;

  const maxYesTotal = Math.max(...yesOrders.map((o) => o.totalQty), 1);
  const maxNoTotal = Math.max(...noOrders.map((o) => o.totalQty), 1);

  const topYesPrice = parseFloat(yesOrders[0]?.price || "0");
  const topNoPrice = parseFloat(noOrders[0]?.price || "0");

  const probability =
    topYesPrice + topNoPrice > 0
      ? (topYesPrice / (topYesPrice + topNoPrice)) * 100
      : 0;

  const handleIncrement = (amount: number,fn:Dispatch<SetStateAction<number>>) => {
    fn((prev) => Math.max(0, prev + amount));
  };

  const handleTrade = async() => {



    const response = await axios.post("")
    console.log({
      side: SIDE[activeSide],
      position: yesSelected ? "Yes" : "No",
      price,
      shares,
      total:  (shares * (price)),
      toWin: (shares * (10-price+price))
    });
  };

  const totalCost = (shares * (price))
  const toWin = (shares * (10-price+price));
  return (
    <div className="bg-[#0e0e0e] text-white p-6 min-h-screen font-mono flex w-screen">
      {/* Header */}
      <div className="w-4/6 ">
        <div className="text-center text-xl mb-6 text-white font-semibold">
          🧠 Implied Probability: {probability.toFixed(2)}%
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4 max-w-6xl mx-auto text-sm">
          {/* YES Column */}
          <div className="text-green-400">
            <div className="mb-2 font-semibold text-center">📈 YES Orders</div>
            {yesOrders.map((order, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center relative py-1 px-2"
              >
                <span className="z-10 w-[33%] text-left">${order.price}</span>
                <span className="z-10 w-[33%] text-right">
                  {order.totalQty.toFixed(0)}
                </span>
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
              <div
                key={idx}
                className="flex justify-between items-center relative py-1 px-2"
              >
                <span className="z-10 w-[33%] text-left">${order.price}</span>
                <span className="z-10 w-[33%] text-right">
                  {order.totalQty.toFixed(0)}
                </span>
                <div
                  className="absolute right-0 top-0 h-full bg-red-700 opacity-30"
                  style={{ width: `${(order.totalQty / maxNoTotal) * 100}%` }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-2/6 flex flex-col items-center justify-center text-white bg-[#0e0e0e] p-6 rounded-lg shadow-md">
        <div className="max-w-md w-full mx-auto bg-[#1d1d1d] text-white p-6 rounded-xl shadow-lg space-y-6 font-sans">
          {/* Buy/Sell Tabs */}
          <div className="flex space-x-4 border-b border-gray-700 pb-2">
            <button
              onClick={() => setActiveSide(SIDE.BUY)}
              className={`text-lg font-semibold ${
                activeSide === SIDE.BUY
                  ? "text-white border-b-2 border-blue-500"
                  : "text-gray-400"
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setActiveSide(SIDE.SELL)}
              className={`text-lg font-semibold ${
                activeSide === SIDE.SELL
                  ? "text-white border-b-2 border-blue-500"
                  : "text-gray-400"
              }`}
            >
              Sell
            </button>
          </div>

          {/* Yes / No Selector */}
          <div className="flex space-x-4">
            <button
              onClick={() => {setYesSelected(true); setPrice(topYesPrice)}}
              className={`flex-1 py-3 rounded-md text-sm font-bold ${
                yesSelected ? "bg-green-600" : "bg-[#1E2A38] text-gray-300"
              }`}
            >
              Yes {topYesPrice}¢
            </button>
            <button
              onClick={() => {setYesSelected(false); setPrice(topNoPrice)}}
              className={`flex-1 py-3 rounded-md text-sm font-bold ${
                !yesSelected ? "bg-red-600" : "bg-[#1E2A38] text-gray-300"
              }`}
            >
              No {topNoPrice}¢
            </button>
          </div>

          {/* Price Info */}
          <div className="flex items-center justify-between text-sm text-gray-300">
            <span> Price</span>
            <div className="flex items-center space-x-2 bg-[#1E2A38] px-3 py-1 rounded-md text-white">
              <span onClick={()=>handleIncrement(-1,setPrice)} className=" cursor-pointer">-</span>
              <span className="font-bold">₹{price}</span>
              <span onClick={()=>handleIncrement(1,setPrice)} className="cursor-pointer">+</span>
            </div>
          </div>

          {/* Shares Input */}
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Shares</label>
            <input
              type="number"
              value={shares}
              onChange={(e) => setShares(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 rounded-md bg-[#1E2A38] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm bg-green-800 text-green-300 px-2 py-1 rounded-md">
                {yesSelected ? <div>
                  {yesOrders.filter((order)=>Number(order.price)==price)[0]?.price ?   yesOrders.filter((order)=>Number(order.price)==price)[0].price : 0} qty  
                </div> : <div>
                  {noOrders.filter((order)=>Number(order.price)==price)[0]?.price ? noOrders.filter((order)=>Number(order.price)===price)[0].price : 0 } qty  
                </div>}
              </span>
              <div className="space-x-2">
                <button
                  onClick={() => handleIncrement(-10,setShares)}
                  className="px-3 py-1 rounded-md bg-[#293849] hover:bg-[#3A4B60]"
                >
                  -10
                </button>
                <button
                  onClick={() => handleIncrement(10,setShares)}
                  className="px-3 py-1 rounded-md bg-[#293849] hover:bg-[#3A4B60]"
                >
                  +10
                </button>
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total</span>
              <span className="text-blue-400">${totalCost}</span>
            </div>
            <div className="flex justify-between">
              <span>
                To Win <span className="ml-1">💵</span>
              </span>
              <span className="text-green-400">${toWin}</span>
            </div>
          </div>

          {/* Trade Button */}
          <button
            onClick={handleTrade}
            className="w-full py-3 mt-2 rounded-md bg-blue-500 hover:bg-blue-600 transition font-bold text-white"
          >
            Trade
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpinionOrderBook;
