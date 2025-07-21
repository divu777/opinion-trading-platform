import MarketCard from '@/components/MarketCard';
import { fetchAllMarkets } from '@/lib/utils';
import React from 'react'



const Page = async () => {
  const markets: string[] = await fetchAllMarkets()
  return (
    <div className="h-screen w-screen flex bg-black text-white">
      
      {/* Left Side - Market Grid */}
      <div className="w-3/4 h-full overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {markets && markets.length > 0 ? (
          markets.map((market) => (
        


            <MarketCard key={market} market={market} / >

          ))
        ) : (
          <div className="col-span-full text-center text-zinc-400">
            No markets available
          </div>
        )}
      </div>

      {/* Right Side - Sidebar */}
      <div className="w-1/4 h-full bg-zinc-950 border-l border-zinc-800 flex items-center justify-center p-6">
        <div className="bg-zinc-900 p-6 rounded-xl shadow-md border border-zinc-800 w-full max-w-sm text-center">
          <h3 className="text-2xl font-semibold text-blue-500 mb-4">User Info</h3>
          <p className="text-zinc-400 text-sm">User details or profile go here.</p>
        </div>
      </div>
      
    </div>
  );
};

export default Page;


