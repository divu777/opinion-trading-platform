"use client";

import React, { useState } from "react";
import MarketCard from "./MarketCard";
import { StartMarketType } from "@repo/common";
import { addnewMarket } from "@/lib/utils";

const AdminDashboard = ({
  marketsData,
}: {
  marketsData: StartMarketType[];

}) => {
  const [markets, setMarkets] = useState(marketsData);
  const [showModal, setShowModal] = useState(false);
  const [newMarket, setNewMarket] = useState({
    marketId: "",
    title: "",
    description: "",
  });

  const handleAddMarket = async () => {
    const response = await addnewMarket(newMarket);
    console.log(JSON.stringify(response));

    setMarkets((prev) => [...prev, newMarket]);
    setNewMarket({
      marketId: "",
      title: "",
      description: "",
    });
    setShowModal(false);
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-white text-zinc-800">
      {/* Header */}
      <div className="w-full h-20 flex items-center justify-between px-10 bg-white border-b border-zinc-200 shadow-sm sticky top-0 z-40">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          All the Markets
        </h1>
        <button
          className="bg-zinc-900 text-white px-4 py-2 rounded-md hover:bg-zinc-700 transition"
          onClick={() => setShowModal(true)}
        >
          + Add Market
        </button>
      </div>

      {/* Market Cards */}
      {markets && markets.length > 0 ? (
        <div className="bg-zinc-50 w-full max-h-[calc(100vh-5rem)] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-10">
          {markets.map((market, index) => (
            <MarketCard key={index} market={market} secured={true} setMarkets={setMarkets} />
          ))}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-zinc-500">
          No markets available right now
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-zinc-200/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md border border-zinc-200 shadow-xl transition-all">
            <h2 className="text-xl font-semibold mb-4 text-zinc-800">
              Add New Market
            </h2>

            {/* Input Field */}
            <input
              type="text"
              value={newMarket.marketId}
              onChange={(e) =>
                setNewMarket((prev) => ({ ...prev, marketId: e.target.value }))
              }
              placeholder="Enter market Market Id"
              className="w-full bg-white text-zinc-800 border border-zinc-300 p-3 rounded-md mb-4 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition"
            />
            <input
              type="text"
              value={newMarket.title}
              onChange={(e) =>
                setNewMarket((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter market title"
              className="w-full bg-white text-zinc-800 border border-zinc-300 p-3 rounded-md mb-4 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition"
            />
            <input
              type="text"
              value={newMarket.description}
              onChange={(e) =>
                setNewMarket((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Enter market description"
              className="w-full bg-white text-zinc-800 border border-zinc-300 p-3 rounded-md mb-4 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition"
            />

            {/* Button Group */}
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded border border-zinc-300 text-zinc-600 hover:bg-zinc-100 transition"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded transition"
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
