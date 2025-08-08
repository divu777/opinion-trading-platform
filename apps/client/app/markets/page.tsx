import MarketCard from '@/components/MarketCard';
import { fetchAllMarkets } from '@/lib/utils';
import React from 'react'
import Image from 'next/image';
import sidebaner from '@/public/op3.jpg';



const Page = async () => {
  const markets: string[] = await fetchAllMarkets()
  return (
    <div className="h-screen w-screen flex text-white bg-white ">
      
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
      <div className="w-1/4 h-full bg-white border-l border-zinc-800 flex items-center justify-center p-6">
        <Image src={sidebaner} alt="Sidebar Banner" className="object-contain" />

      </div>
      
    </div>
  );
};

export default Page;


