"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import MarketCard from "./MarketCard";
import { getSearchInputResult } from "@/lib/utils";
import { StartMarketType } from "@repo/common";

const Markets = ({ markets }: { markets: StartMarketType[] }) => {
  const [input, setInput] = useState("");
  const [marketData,setMarketData] = useState(markets)

const interval = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDebounce = useCallback((value:string)=>{
    setInput(value)
    if(interval.current){
        clearTimeout(interval.current)
    }

    interval.current = setTimeout(async() => {
      if(value.trim()){

        const res = await fetch(`/api/markets/search?query=${value}`);
        const result = await res.json();
        setMarketData(result.success ? result.data : []);
      }else{
        setMarketData(markets)
      }
    }, 1000);
  } , [markets] )

   useEffect(() => {
    return () => {
      if (interval.current) {
        clearTimeout(interval.current);
      }
    };
  }, []);

  return (
    <div className="w-3/4 h-full flex flex-col justify-around">
      <div className=" w-full flex items-center justify-center p-10">
        <div className="w-3/4 flex  border-2 border-slate-200  rounded-full p-2 hover:border-slate-300 shadow-sm focus:shadow">


        <input
          type="text"
          placeholder="Search Market...."
          className=" w-full py-2 px-3  bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border rounded-md  transition duration-300 ease focus:outline-none focus:border-none  "
          value={input}
          onChange={(e)=>handleDebounce(e.target.value)}
        />
        <button className=" px-4 py-1 bg-black text-white rounded-3xl ">
            +
        </button>
                </div>

      </div>

      <div className="w-full h-full overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        { marketData?.length > 0 ? (
          marketData.map((market,index) => <MarketCard key={index} market={market} />)
        ) : (
          <div className="col-span-full text-center text-zinc-400">
            No markets available
          </div>
        )}
      </div>
    </div>
  );
};

export default Markets;
