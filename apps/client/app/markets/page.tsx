import { fetchAllMarkets } from '@/lib/utils';
import React from 'react'
import Image from 'next/image';
import sidebaner from '@/public/op3.jpg';
import Markets from '@/components/Markets';
import { StartMarketType } from '@repo/common';



const Page = async () => {
  const markets = await fetchAllMarkets()

  return (
    <div className="h-screen w-screen flex text-white bg-white ">
      
      {/* Left Side - Market Grid */}
      
        
     <Markets markets={markets}/>
          


      {/* Right Side - Sidebar */}
      <div className="w-1/4 h-full bg-white border-l border-zinc-800 flex items-center justify-center p-6">
        <Image src={sidebaner} alt="Sidebar Banner" className="object-contain" />

      </div>
      
    </div>
  );
};

export default Page;


