import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import axios from "axios";
import { LimitOrderRequest, StartMarketType } from "@repo/common";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const fetchAllMarkets = async () => {
  const response = await axios.get("http://localhost:3000/api/markets")
  return response.data.markets;
}

export const addnewMarket = async (newMarket:StartMarketType)=>{
  const response = await axios.post(`http://localhost:3000/api/markets`,{
    
      ...newMarket

  })
  return response.data
}

export const orderRequest = async(data:LimitOrderRequest)=>{
  console.log("data ++ ++++ ++"+JSON.stringify(data))
  const response = await axios.post(`http://localhost:3000/api/order`,{
    ...data
  })

  console.log(JSON.stringify(response.data))

  return response.data
}

export const getUserData= async(name:string)=>{
  const response = await axios.get("http://localhost:3000/api/user/balance/"+name);
  console.log(JSON.stringify(response.data));

    const response2 = await axios.get("http://localhost:3000/api/user/money/"+name);
  console.log(JSON.stringify(response2.data));

  return {res1:response.data,res2:response2.data}
}


export const getSearchInputResult = async(query:string)=>{
  const response = await axios.get(`http://localhost:3000/api/markets/search-${query}`);

  console.log(JSON.stringify(response.data));
  return response.data
}


export const resolveMarket = async(marketId:string,resolution:string)=>{
  try {
      const response = await axios.post(`http://localhost:3000/api/resolve/${marketId}`,{
        marketId,
        winner:resolution.toUpperCase()
      });

      console.log(JSON.stringify(response))
      return response.data
    } catch (err) {
      console.error(err);
    }
}