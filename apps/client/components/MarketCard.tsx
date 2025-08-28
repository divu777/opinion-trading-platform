"use client";
import { StartMarketType } from "@repo/common";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {resolveMarket} from "@/lib/utils"
const MarketCard = ({
  market,
  secured,
  setMarkets
}: {
  market: StartMarketType;
  secured?: boolean;
  setMarkets?:React.Dispatch<React.SetStateAction<{
    marketId: string;
    title?: string | undefined;
    description?: string | undefined;
}[]>>

}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [resolution, setResolution] = useState<string>("");

  const handleResolve = async () => {
    if (!resolution) return alert("Please select Yes or No");
    const response = await resolveMarket(market.marketId, resolution);

    if(response.success){
      if(!setMarkets) return
      setMarkets(prev => prev.filter((Eachmarket)=>Eachmarket.marketId!=market.marketId))
    }
    setResolution("");
    setOpen(false);
    
  };

  return (
    <>
      <div
        onClick={() => router.push(`/markets/${market.marketId}`)}
        className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm hover:shadow-lg hover:border-zinc-300 hover:-translate-y-1 transform transition duration-300 cursor-pointer flex flex-col justify-between h-60"
      >
        {/* Top section */}
        <div>
          <h2 className="text-lg font-bold text-zinc-900 truncate">
            {market.title}
          </h2>
          <p className="text-sm text-zinc-500 mt-2 line-clamp-3">
            {market.description || "No description provided."}
          </p>
        </div>

        {/* Bottom section */}
        <div className="flex justify-between items-center mt-4">
          <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
            View Details →
          </button>
          {secured && (
            <Button
              size="sm"
              className="bg-green-500 text-white hover:bg-green-600"
              onClick={(e) => {
                e.stopPropagation(); // prevent card redirect
                setOpen(true);
              }}
            >
              Resolve
            </Button>
          )}
        </div>
      </div>

      {/* Light theme Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white text-zinc-900 rounded-xl shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-zinc-900">
              Resolve Market
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-zinc-600 mb-2">
            Market: <strong>{market.title}</strong>
          </p>

          <Select onValueChange={(value) => setResolution(value)}>
            <SelectTrigger className="w-full mt-3 border border-zinc-300 rounded-md bg-white text-zinc-900">
              <SelectValue placeholder="Select outcome" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-zinc-200 shadow-md rounded-md">
              <SelectItem
                value="yes"
                className="text-zinc-900 hover:bg-zinc-100"
              >
                Yes
              </SelectItem>
              <SelectItem
                value="no"
                className="text-zinc-900 hover:bg-zinc-100"
              >
                No
              </SelectItem>
            </SelectContent>
          </Select>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleResolve}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MarketCard;
