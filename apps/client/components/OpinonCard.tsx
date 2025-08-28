"use client";
import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  BarChart3,
  Activity,
  Users,
  Zap,
} from "lucide-react";
import { orderRequest } from "@/lib/utils";
import { useSocket } from "@/lib/socket/useSocket";
import { useSession } from "next-auth/react";
import { data, div } from "framer-motion/client";
import { useRouter } from "next/navigation";
import { authOptions } from "@/lib/auth";

interface Order {
  price: string;
  totalQty: number;
}

interface MarketData {
  Yes: Order[];
  No: Order[];
}

enum SIDE {
  BUY = "BUY",
  SELL = "SELL",
}

const OpinionOrderBook = ({
  market,
  marketId,
}: {
  market: MarketData;
  marketId: string;
}) => {
  const { data } = useSession();

  const [userId, setUserId] = useState("");

  const [marketData, setMarket] = useState<MarketData>(market);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  const yesOrders = marketData.Yes;
  const noOrders = marketData.No;
  const topYesPrice = parseFloat(yesOrders[0]?.price || "0");
  const topNoPrice = parseFloat(noOrders[0]?.price || "0");

  const [activeSide, setActiveSide] = useState<SIDE>(SIDE.BUY);
  const [yesSelected, setYesSelected] = useState(true);
  const [price, setPrice] = useState(topYesPrice);
  const [shares, setShares] = useState(0);
  const [orderPlaced, setOrderPlaced] = useState(false);


  const maxYesTotal = Math.max(...yesOrders.map((o) => o.totalQty), 1);
  const maxNoTotal = Math.max(...noOrders.map((o) => o.totalQty), 1);

  const probability =
    topYesPrice + topNoPrice > 0
      ? (topYesPrice / (topYesPrice + topNoPrice)) * 100
      : 0;

  const handleIncrement = (
    amount: number,
    fn: React.Dispatch<React.SetStateAction<number>>
  ) => {
    fn((prev) => {
      if (prev + amount > 9.5 || prev + amount < 0.5) {
        return prev;
      } else {
        return prev + amount;
      }
    });
  };

  const handleTrade = async () => {
    console.log("heeeeee");
    const response = await orderRequest({
      userId,
      ticket_type: yesSelected ? "YES" : "NO",
      order_type: SIDE[activeSide],
      quantity: shares,
      price,
      marketId,
    });

    // console.log({
    //   side: SIDE[activeSide],
    //   position: yesSelected ? "Yes" : "No",
    //   price,
    //   shares,
    //   total: shares * price,
    //   toWin: shares * (10 - price + price),
    // });

    setIsLoading(false);
    setOrderPlaced(true);

    setTimeout(() => {
      setOrderPlaced(false);
    }, 2000);
  };

  const totalCost = shares * price;
  const totalQty =
    yesOrders.reduce((sum, order) => order.totalQty + sum, 0) +
    noOrders.reduce((sum, order) => order.totalQty + sum, 0);

  const router = useRouter();
  useEffect(() => {
    if (data && data.user && data.user.name) {
      setUserId(data.user.name);
    }
    // } else {
    //   router.push("/login");
    // }
  }, [data]);

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
        setLastUpdate(Date.now());
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


  useEffect(() => {
    setPrice(yesSelected ? topYesPrice : topNoPrice);
  }, [yesSelected, topYesPrice, topNoPrice]);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white min-h-screen text-black">
      {/* Enhanced Header */}
      <div className="border-b-2 border-gray-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="hidden lg:flex items-center space-x-8 text-sm">
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border">
                  <BarChart3 className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-600">Market:</span>
                  <span className="font-mono font-bold">{marketId}</span>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border">
                  <Users className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-600">Volume:</span>
                  <span className="font-mono font-bold">
                    {totalQty.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border">
                  <Target className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-600">Last Update:</span>
                  <span className="font-mono font-bold text-green-600">
                    {Math.floor((Date.now() - lastUpdate) / 1000)}s ago
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 rounded-full border-2 border-green-700 shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full "></div>
                <span className="text-sm font-bold text-white">LIVE</span>
                <Zap className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 flex flex-col lg:flex-row gap-8">
        {/* Enhanced Order Book Section */}
        <div className="flex-1 space-y-8">
          {/* Enhanced Probability Display */}
          <div className="bg-white border-2 border-black rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]">
            <div className="text-center">
              <div className="mb-4">
                <h2 className="text-5xl font-bold mb-2 text-black font-mono transition-all duration-500 hover:scale-110">
                  {probability.toFixed(1)}%
                </h2>
                <p className="text-lg text-gray-600 font-semibold">
                  Implied Probability
                </p>
              </div>

              <div className="relative w-full bg-gray-200 rounded-full h-4 border-2 border-gray-300 overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-black to-gray-800 h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                  style={{ width: `${probability}%` }}
                >
                  <div className="absolute inset-0 bg-white opacity-20 "></div>
                </div>
              </div>

              <div className="mt-4 flex justify-between text-sm font-mono text-gray-600">
                <span>0%</span>
                <span className="font-bold text-black">
                  {probability.toFixed(1)}%
                </span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Enhanced Order Book */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Enhanced YES Orders */}
            <div className="bg-white border-2 border-black rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]">
              <div className="flex items-center space-x-3 mb-6 pb-4 border-b-2 border-gray-200">
                <div className="p-2 bg-green-500 rounded-full">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-black">YES Orders</h3>
                <div className="ml-auto flex items-center space-x-2">
                  <div className="px-3 py-1 bg-green-100 border border-green-300 rounded-full">
                    <span className="text-sm font-mono font-bold text-green-700">
                      ₹{topYesPrice}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-4 text-xs font-bold text-gray-500 border-b border-gray-200 pb-3 mb-4">
                  <span>PRICE</span>
                  <span className="text-center">QUANTITY</span>
                  <span className="text-right">TOTAL</span>
                </div>
                {yesOrders.map((order, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-3 gap-4 items-center py-3 px-4 rounded-lg hover:bg-gray-50 transition-all duration-300 hover:scale-[1.02] cursor-pointer relative overflow-hidden border border-gray-100 group hover:border-green-300 hover:shadow-md"
                    style={{
                      animationDelay: `${idx * 100}ms`,
                      animation: "fadeInUp 0.5s ease-out forwards",
                    }}
                  >
                    <span className="text-black font-bold font-mono z-10 transition-colors duration-300 group-hover:text-green-600 text-sm">
                      ₹{order.price}
                    </span>
                    <span className="text-center text-gray-700 font-mono z-10 transition-colors duration-300 text-sm">
                      {order.totalQty.toLocaleString()}
                    </span>
                    <span className="text-right text-gray-700 font-mono z-10 text-sm">
                      ₹
                      {(
                        parseFloat(order.price) * order.totalQty
                      ).toLocaleString()}
                    </span>
                    <div
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-400 to-green-500 opacity-20 transition-all duration-700 group-hover:opacity-30 rounded-lg"
                      style={{
                        width: `${(order.totalQty / maxYesTotal) * 100}%`,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced NO Orders */}
            <div className="bg-white border-2 border-black rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]">
              <div className="flex items-center space-x-3 mb-6 pb-4 border-b-2 border-gray-200">
                <div className="p-2 bg-red-500 rounded-full">
                  <TrendingDown className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-black">NO Orders</h3>
                <div className="ml-auto flex items-center space-x-2">
                  <div className="px-3 py-1 bg-red-100 border border-red-300 rounded-full">
                    <span className="text-sm font-mono font-bold text-red-700">
                      ₹{topNoPrice}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-4 text-xs font-bold text-gray-500 border-b border-gray-200 pb-3 mb-4">
                  <span>PRICE</span>
                  <span className="text-center">QUANTITY</span>
                  <span className="text-right">TOTAL</span>
                </div>
                {noOrders.map((order, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-3 gap-4 items-center py-3 px-4 rounded-lg hover:bg-gray-50 transition-all duration-300 hover:scale-[1.02] cursor-pointer relative overflow-hidden border border-gray-100 group hover:border-red-300 hover:shadow-md"
                    style={{
                      animationDelay: `${idx * 100}ms`,
                      animation: "fadeInUp 0.5s ease-out forwards",
                    }}
                  >
                    <span className="text-black font-bold font-mono z-10 transition-colors duration-300 group-hover:text-red-600 text-sm">
                      ₹{order.price}
                    </span>
                    <span className="text-center text-gray-700 font-mono z-10 transition-colors duration-300 text-sm">
                      {order.totalQty.toLocaleString()}
                    </span>
                    <span className="text-right text-gray-700 font-mono z-10 text-sm">
                      ₹
                      {(
                        parseFloat(order.price) * order.totalQty
                      ).toLocaleString()}
                    </span>
                    <div
                      className="absolute right-0 top-0 h-full bg-gradient-to-l from-red-400 to-red-500 opacity-20 transition-all duration-700 group-hover:opacity-30 rounded-lg"
                      style={{
                        width: `${(order.totalQty / maxNoTotal) * 100}%`,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Trading Panel */}
        { userId ? ( <div className="w-full lg:w-96">
          <div className="bg-white border-2 border-black rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 lg:sticky lg:top-6">
            <h3 className="text-xl font-bold mb-6 flex items-center space-x-3 text-black">
              <div className="p-2 bg-black rounded-full">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <span>Place Order</span>
              {orderPlaced && (
                <div className="ml-auto text-green-600 animate-bounce">
                  <div className="w-2 h-2 bg-green-500 rounded-full "></div>
                </div>
              )}
            </h3>

            {/* Enhanced Buy/Sell Tabs */}
            <div className="flex space-x-0 mb-6 border-2 border-black rounded-lg overflow-hidden shadow-md">
              <button
                onClick={() => setActiveSide(SIDE.BUY)}
                className={`flex-1 py-4 px-6 font-bold transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden ${
                  activeSide === SIDE.BUY
                    ? "bg-black text-white shadow-inner"
                    : "bg-white text-black hover:bg-gray-100"
                }`}
              >
                {activeSide === SIDE.BUY && (
                  <div className="absolute inset-0 bg-white opacity-10 "></div>
                )}
                BUY
              </button>
              <button
                onClick={() => setActiveSide(SIDE.SELL)}
                className={`flex-1 py-4 px-6 font-bold transition-all duration-300 transform hover:scale-[1.02] border-l-2 border-black relative overflow-hidden ${
                  activeSide === SIDE.SELL
                    ? "bg-black text-white shadow-inner"
                    : "bg-white text-black hover:bg-gray-100"
                }`}
              >
                {activeSide === SIDE.SELL && (
                  <div className="absolute inset-0 bg-white opacity-10 "></div>
                )}
                SELL
              </button>
            </div>

            {/* Enhanced Yes/No Selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setYesSelected(true)}
                className={`py-5 rounded-xl font-bold transition-all duration-300 transform hover:scale-[1.05] active:scale-[0.98] border-2 relative overflow-hidden group ${
                  yesSelected
                    ? "bg-green-500 text-white border-green-500 shadow-lg shadow-green-200"
                    : "bg-white text-black border-black hover:bg-gray-50 hover:border-green-500 hover:shadow-md"
                }`}
              >
                <div className="text-sm font-bold mb-1">YES</div>
                <div className="text-lg font-mono">₹{topYesPrice}</div>
                {yesSelected && (
                  <div className="absolute inset-0 bg-white opacity-10  rounded-xl"></div>
                )}
              </button>
              <button
                onClick={() => setYesSelected(false)}
                className={`py-5 rounded-xl font-bold transition-all duration-300 transform hover:scale-[1.05] active:scale-[0.98] border-2 relative overflow-hidden group ${
                  !yesSelected
                    ? "bg-red-500 text-white border-red-500 shadow-lg shadow-red-200"
                    : "bg-white text-black border-black hover:bg-gray-50 hover:border-red-500 hover:shadow-md"
                }`}
              >
                <div className="text-sm font-bold mb-1">NO</div>
                <div className="text-lg font-mono">₹{topNoPrice}</div>
                {!yesSelected && (
                  <div className="absolute inset-0 bg-white opacity-10  rounded-xl"></div>
                )}
              </button>
            </div>

            {/* Enhanced Price Control */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-black mb-3">
                PRICE PER SHARE
              </label>
              <div className="flex items-center border-2 border-black rounded-xl overflow-hidden shadow-md">
                <button
                  onClick={() => handleIncrement(-0.5, setPrice)}
                  className="w-14 h-14 bg-white hover:bg-gray-100 transition-all duration-200 transform hover:scale-110 active:scale-95 flex items-center justify-center font-bold text-xl border-r-2 border-black group"
                >
                  <span className="group-hover:scale-125 transition-transform duration-200">
                    −
                  </span>
                </button>
                <div className="flex-1 text-center font-bold text-xl font-mono py-4 bg-white transition-all duration-300 hover:bg-gray-50">
                  ₹{price.toFixed(1)}
                </div>
                <button
                  onClick={() => handleIncrement(0.5, setPrice)}
                  className="w-14 h-14 bg-white hover:bg-gray-100 transition-all duration-200 transform hover:scale-110 active:scale-95 flex items-center justify-center font-bold text-xl border-l-2 border-black group"
                >
                  <span className="group-hover:scale-125 transition-transform duration-200">
                    +
                  </span>
                </button>
              </div>
            </div>

            {/* Enhanced Shares Input */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-black mb-3">
                NUMBER OF SHARES
              </label>
              <input
                type="number"
                value={shares}
                onChange={(e) => setShares(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-4 rounded-xl bg-white border-2 border-black focus:outline-none focus:ring-4 focus:ring-gray-200 focus:border-gray-400 transition-all duration-300 font-mono transform focus:scale-[1.02] shadow-md hover:shadow-lg"
                placeholder="Enter number of shares..."
              />

              <div className="flex items-center justify-between mt-4">
                <div className="text-xs text-gray-600 font-mono bg-gray-50 px-3 py-2 rounded-lg border">
                  Available:{" "}
                  {yesSelected
                    ? yesOrders.find((o) => parseFloat(o.price) === price)
                        ?.totalQty || 0
                    : noOrders.find((o) => parseFloat(o.price) === price)
                        ?.totalQty || 0}{" "}
                  shares
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleIncrement(-10, setShares)}
                    className="px-4 py-2 text-xs rounded-lg border-2 border-black bg-white hover:bg-gray-100 transition-all duration-200 transform hover:scale-110 active:scale-95 font-bold shadow-md hover:shadow-lg"
                  >
                    -10
                  </button>
                  <button
                    onClick={() => handleIncrement(10, setShares)}
                    className="px-4 py-2 text-xs rounded-lg border-2 border-black bg-white hover:bg-gray-100 transition-all duration-200 transform hover:scale-110 active:scale-95 font-bold shadow-md hover:shadow-lg"
                  >
                    +10
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Order Summary */}
            <div className="space-y-3 mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 transition-all duration-300 hover:shadow-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 font-bold">TOTAL COST</span>
                <span className="font-bold text-black font-mono transition-all duration-200 hover:scale-110">
                  ₹{totalCost.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t-2 border-gray-300">
                <span className="text-gray-700 font-bold">SHARES</span>
                <span className="font-bold text-black font-mono transition-all duration-200 hover:scale-110">
                  {shares.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Enhanced Trade Button */}
            <button
              onClick={handleTrade}
              disabled={shares === 0 || isLoading}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 transform border-2 relative overflow-hidden ${
                shares > 0 && !isLoading
                  ? "bg-black text-white border-black hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                  : "bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : orderPlaced ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full "></div>
                  <span>Order Placed!</span>
                </div>
              ) : (
                `${activeSide === SIDE.BUY ? "PLACE BUY ORDER" : "PLACE SELL ORDER"}`
              )}

              {shares > 0 && !isLoading && (
                <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-300 rounded-xl"></div>
              )}
            </button>
          </div>
        </div>):   <div className="w-full lg:w-96">
    <div className="bg-white border-2 border-black rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 lg:sticky lg:top-6 flex flex-col items-center justify-center h-full min-h-[500px]">
      <div className="p-4 bg-yellow-100 border-2 border-yellow-400 rounded-full mb-6">
        <Users className="w-10 h-10 text-yellow-700" />
      </div>
      <h3 className="text-xl font-bold mb-3 text-center text-black">
        Login Required
      </h3>
      <p className="text-gray-600 text-center mb-8 max-w-xs">
        You need to be logged in to place trades in this market.
      </p>
      <button
        onClick={() => router.push("/login")}
        className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 transform border-2 bg-black text-white border-black hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
      >
        Go to Login
      </button>
    </div>
  </div>
           }
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default OpinionOrderBook;
