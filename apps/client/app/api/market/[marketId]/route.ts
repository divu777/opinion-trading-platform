import { RedisManager } from "@/lib/redis";
import { StartMarketSchema } from "@repo/common";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_:NextRequest,{params}:{params:Promise<{marketId:string}>}){
    const marketId = (await params).marketId
    console.log ( marketId + "mrrr")

    const validInput = StartMarketSchema.safeParse({marketId})

    if(!validInput.success){
        return NextResponse.json({
            message:validInput.error.message,
            success:false
        })
    }

    const redisclient = RedisManager.getInstance();

    // const eventId = await redisclient.pushToEngine({marketId},"GET_MARKET_ORDERBOOK")

    // const response = await redisclient.subscribeToEvent(eventId);

    const uniqueId = randomUUID()
            const promise =  redisclient.subscribeToEvent(uniqueId);
            const eventId = await redisclient.pushToEngine({marketId},"GET_MARKET_ORDERBOOK",uniqueId);
    
            const response = await promise

    


    return NextResponse.json(response)
}



