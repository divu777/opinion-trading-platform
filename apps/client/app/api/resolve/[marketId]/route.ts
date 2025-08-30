import { RedisManager } from "@/lib/redis";
import { ResolveMarketSchema } from "@repo/common";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from 'crypto';

export const POST  =async(req:NextRequest,{params}:{params:Promise<{marketId:string}>})=>{
    const marketId = (await params).marketId
    try {
       const body = await req.json()

       const validinputs = ResolveMarketSchema.safeParse(body)

       if(!validinputs.success){
        return NextResponse.json({
            message:"Error in inputs",
            success:false
        })
       }

       const redisClient = RedisManager.getInstance()
       const randomId = randomUUID()
       const promise = redisClient.subscribeToEvent('RESOLVE_MARKET')
       await redisClient.pushToEngine(validinputs.data,'RESOLVE_MARKET',randomId);
       const response = await promise

       return NextResponse.json(response)

        
    } catch (error) {
        console.log("Error in resolving market"+marketId + " : "+error);
        return NextResponse.json({
            message:"Error in resolving market",
            success:false
        })
    }
}   