import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import axios from "axios";
import { LimitOrderRequest } from "@repo/common";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
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



