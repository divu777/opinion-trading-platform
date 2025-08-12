'use client'
import { StartMarketType } from "@repo/common";
import { useRouter } from "next/navigation";

const MarketCard = ({ market }: { market: StartMarketType }) => {
  const router = useRouter()
  return (
    <div
      onClick={() => router.push(`/markets/${market.marketId}`)}
      className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm hover:shadow-lg hover:border-zinc-300 hover:-translate-y-1 transform transition duration-300 cursor-pointer flex flex-col justify-between h-60"
    >
      {/* Top section */}
      <div>
 

        {/* Market Title */}
        <h2 className="text-lg font-bold text-zinc-900 truncate">
          {market.title}
        </h2>

        {/* Description */}
        <p className="text-sm text-zinc-500 mt-2 line-clamp-3">
          {market.description || "No description provided."}
        </p>
      </div>

      {/* Bottom section */}
      <div className="flex justify-between items-center mt-4">
        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
          View Details →
        </button>
        <span className="text-xs text-zinc-400">
          Active
        </span>
      </div>
    </div>
  );
};

export default MarketCard;
