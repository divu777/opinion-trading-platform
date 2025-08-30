import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import axios from "axios";
import { LimitOrderRequest, StartMarketType } from "@repo/common";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const fetchAllMarkets = async () => {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/markets`)
  return response.data.markets;
}

export const addnewMarket = async (newMarket:StartMarketType)=>{
  const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/markets`,{
    
      ...newMarket

  })
  return response.data
}

export const orderRequest = async(data:LimitOrderRequest)=>{
  const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/order`,{
    ...data
  })


  return response.data
}

export const getUserData= async(name:string)=>{
  const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user/balance/`+name);

    const response2 = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user/money/`+name);

  return {res1:response.data,res2:response2.data}
}


export const getSearchInputResult = async(query:string)=>{
  const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/markets/search-${query}`);

  return response.data
}


export const resolveMarket = async(marketId:string,resolution:string)=>{
  try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/resolve/${marketId}`,{
        marketId,
        winner:resolution.toUpperCase()
      });

      return response.data
    } catch (err) {
      console.error(err);
    }
}