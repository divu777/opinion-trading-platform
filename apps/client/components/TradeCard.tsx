import { DollarSign } from "lucide-react";
import React from "react";

enum SIDE {
  BUY = "BUY",
  SELL = "SELL",
}

const TradeCard = ({
  orderPlaced,
  setActiveSide,
  activeSide,
  setYesSelected,
  yesSelected,
  topYesPrice,
  topNoPrice,
  handleIncrement,
  setPrice,
  price,
  setShares,
  shares
}: {
  orderPlaced: boolean;
  setActiveSide: (x: any) => void;
  activeSide: SIDE;
  setYesSelected: (x: any) => void;
  yesSelected:boolean;
  topYesPrice:number;
  topNoPrice:number;
  handleIncrement: (x:number,y:(x:any)=>void)=>void;
  setPrice:(x:any)=>void;
  price:number;
  setShares:(value: number) => void
    shares:number

}) => {
  return (
    <div className="w-full lg:w-96">
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
    </div>
  );
};

export default TradeCard;
