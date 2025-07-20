import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


import axios from "axios";

export const fetchAllMarkets = async () => {
  const response = await axios.get("http://localhost:3000/api/market")
  return response.data.markets;
}

export const addnewMarket = async (marketName:string)=>{
  const response = await axios.post(`http://localhost:3000/api/market`,{
    
      marketId:marketName

  })
  return response.data
}