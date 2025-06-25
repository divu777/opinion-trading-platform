import OpinionOrderBook from '@/components/OrderBook';
import axios from 'axios';
import React from 'react';

interface Order {
  price: string;
  totalQty: number;
}

interface MarketData {
  Yes: Order[];
  No: Order[];
}

const getMarket = async (marketId: string): Promise<MarketData> => {
  const response = await axios.get(`http://localhost:3000/api/market/${marketId}`);
  return response.data.data;
};

const Page = async ({ params }: { params: { marketId: string } }) => {
  const market = await getMarket(params.marketId);
  
  const getMaxQty = (orders: Order[]) => Math.max(...orders.map(o => o.totalQty), 1);
  const maxYesQty = getMaxQty(market.Yes);
  const maxNoQty = getMaxQty(market.No);

  return (
    // <div className="flex flex-col items-center p-8 min-h-screen bg-[#0e0e0e] text-[#f5f5f5]">
    //   <h1 className="text-3xl font-bold mb-10 text-[#ff7f11] tracking-wide">
    //     🧠 Opinion Market
    //   </h1>

    //   <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-6xl">
    //     {/* YES Market */}
    //     <div className="bg-[#161616] border-l-4 border-green-500 rounded-lg shadow-md p-6">
    //       <h2 className="text-xl font-semibold text-[#34d399] mb-4">📈 YES Market</h2>
    //       <div className="overflow-x-auto">
    //         <table className="w-full text-sm">
    //           <thead className="text-[#a7f3d0] border-b border-[#1a1a1a] uppercase text-xs">
    //             <tr>
    //               <th className="py-2 px-3">Price (%)</th>
    //               <th className="py-2 px-3">Total Qty</th>
    //               <th className="py-2 px-3">Depth</th>
    //             </tr>
    //           </thead>
    //           <tbody>
    //             {market.Yes.map((order, idx) => {
    //               const barWidth = (order.totalQty / maxYesQty) * 100;
    //               return (
    //                 <tr key={`yes-${idx}`} className="border-t border-[#1a1a1a] hover:bg-[#1f2f1f]">
    //                   <td className="py-2 px-3">{order.price}%</td>
    //                   <td className="py-2 px-3">{order.totalQty}</td>
    //                   <td className="py-2 px-3">
    //                     <div className="h-3 bg-[#1e3a1e] rounded">
    //                       <div
    //                         className="h-full bg-[#34d399] rounded"
    //                         style={{ width: `${barWidth}%` }}
    //                       />
    //                     </div>
    //                   </td>
    //                 </tr>
    //               );
    //             })}
    //           </tbody>
    //         </table>
    //       </div>
    //     </div>

    //     {/* NO Market */}
    //     <div className="bg-[#161616] border-l-4 border-red-500 rounded-lg shadow-md p-6">
    //       <h2 className="text-xl font-semibold text-[#f87171] mb-4">📉 NO Market</h2>
    //       <div className="overflow-x-auto">
    //         <table className="w-full text-sm">
    //           <thead className="text-[#fca5a5] border-b border-[#1a1a1a] uppercase text-xs">
    //             <tr>
    //               <th className="py-2 px-3">Price (%)</th>
    //               <th className="py-2 px-3">Total Qty</th>
    //               <th className="py-2 px-3">Depth</th>
    //             </tr>
    //           </thead>
    //           <tbody>
    //             {market.No.map((order, idx) => {
    //               const barWidth = (order.totalQty / maxNoQty) * 100;
    //               return (
    //                 <tr key={`no-${idx}`} className="border-t border-[#1a1a1a] hover:bg-[#2f1f1f]">
    //                   <td className="py-2 px-3">{order.price}%</td>
    //                   <td className="py-2 px-3">{order.totalQty}</td>
    //                   <td className="py-2 px-3">
    //                     <div className="h-3 bg-[#3a1e1e] rounded">
    //                       <div
    //                         className="h-full bg-[#f87171] rounded"
    //                         style={{ width: `${barWidth}%` }}
    //                       />
    //                     </div>
    //                   </td>
    //                 </tr>
    //               );
    //             })}
    //           </tbody>
    //         </table>
    //       </div>
    //     </div>
    //   </div>
    // </div>
     <OpinionOrderBook market={market} />
  );
};

export default Page;
