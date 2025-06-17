'use client'

import { useRouter } from "next/navigation"

const MarketCard = ({market}:{market:string}) => {
    const router = useRouter()
  return (
     <div 
                onClick={()=>router.push(`/markets/${market}`)}
                  key={market}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-md hover:shadow-lg hover:border-orange-500 transition duration-300 h-56"
                >
                  <h3 className="text-lg font-semibold text-orange-500 mb-2">{market}</h3>
                  <p className="text-zinc-400 text-sm">
                    This is a market card. You can show more details here later.
                  </p>
                </div>
  )
}

export default MarketCard
