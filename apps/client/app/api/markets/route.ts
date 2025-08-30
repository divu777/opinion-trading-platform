import { RedisManager } from "@/lib/redis";
import { StartMarketSchema } from "@repo/common";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const  GET = async(_:NextRequest)=>{
    try {

        const redisclient =  RedisManager.getInstance();
        await redisclient.init()

        const uniqueId = randomUUID()
        const promise =  redisclient.subscribeToEvent(uniqueId);
        const eventId = await redisclient.pushToEngine({},"GET_ALL_MARKETS",uniqueId);

        const response = await promise

        return NextResponse.json(response);
        
    } catch (error) {
        console.log("error in getting all markets "+JSON.stringify(error));
        return NextResponse.json({
            message:error,
            success:false,
            markets:[]
        })
    }
}   


export async function POST (req:NextRequest){
   try {
     const body  = await req.json();

 
      const validInput = StartMarketSchema.safeParse(body)
 
     if(!validInput.success){
         return NextResponse.json({
             message:validInput.error.message,
             success:false
         })
     }
 
     const redisclient = RedisManager.getInstance();
     await redisclient.init()

 
     // const eventId = await redisclient.pushToEngine(body,"CREATE_MARKET")
 
     // const response = await redisclient.subscribeToEvent(eventId);
 
       const uniqueId = randomUUID()
             const promise =  redisclient.subscribeToEvent(uniqueId);
             const eventId = await redisclient.pushToEngine(body,"CREATE_MARKET",uniqueId);
     
             const response = await promise
 
 
     return NextResponse.json(response)
   } catch (error) {
    console.log("error in creating market" + error)
    return NextResponse.json({
        message:"Error in creating new market admin san",
        success:false
    })
   }
}