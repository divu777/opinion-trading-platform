'use client';

import { useRouter } from "next/navigation";

const MarketCard = ({ market }: { market: string }) => {
  const router = useRouter();

  return (
    <div
  onClick={() => router.push(`/markets/${market}`)}
  key={market}
  className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-zinc-400 transition duration-300 cursor-pointer h-56 flex flex-col justify-between"
>
  <h3 className="text-xl font-semibold text-zinc-900">{market}</h3>
  <p className="text-zinc-500 text-sm mt-2">
    This is a market card. You can show more details here later.
  </p>
</div>

  );
};

export default MarketCard;



/*

new things you should work is the web socket logic from the backend i think mostly fetch first the order book and then subscribe to the 
events of that particular markets and show case changes in the UI this is the tricky part now 
*/