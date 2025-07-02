"use client";

import React, { useState } from "react";
import MarketCard from "./MarketCard";

const AdminDashboard = ({ marketsData }: { marketsData: string[] }) => {
  const [markets, setMarkets] = useState(marketsData);
  const [showModal, setShowModal] = useState(false);
  const [marketName, setMarketName] = useState("");

  const handleAddMarket = () => {
    if (!marketName.trim()) return;

    setMarkets((prev) => [...prev, marketName]);
    setMarketName("");
    setShowModal(false);
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-black text-white">
      {/* Header */}
      <div className="w-full h-20 flex items-center justify-between px-10 bg-zinc-950 border-b border-zinc-800">
        <h1 className="text-2xl font-bold text-orange-400">All the markets</h1>
        <button
          className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
          onClick={() => setShowModal(true)}
        >
          + Add Market
        </button>
      </div>

      {/* Market Cards */}
      {markets && markets.length > 0 ? (
        <div className="w-full max-h-[calc(100vh-5rem)] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-10 bg-black">
          {markets.map((market, index) => (
            <MarketCard key={index} market={market} />
          ))}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-zinc-400">
          No markets available right now
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-6 rounded-lg w-96 border border-zinc-800 shadow-lg">
            <h2 className="text-xl font-bold text-orange-400 mb-4">
              Add New Market
            </h2>
            <input
              type="text"
              value={marketName}
              onChange={(e) => setMarketName(e.target.value)}
              placeholder="Enter market name"
              className="w-full bg-zinc-800 text-white border border-zinc-700 p-2 rounded mb-4 placeholder-zinc-500"
            />
            <div className="flex justify-end gap-2">
              <button
                className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded text-white"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded"
                onClick={handleAddMarket}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
