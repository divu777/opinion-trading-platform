import { RedisManager } from "@/lib/redis";
import { StartMarketSchema } from "@repo/common";
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

    const eventId = await redisclient.pushToEngine({marketId},"GET_MARKET_ORDERBOOK")

    const response = await redisclient.subscribeToEvent(eventId);


    return NextResponse.json(response)
}



export async function POST (req:NextRequest){
    const body  = await req.json();

     const validInput = StartMarketSchema.safeParse(body)

    if(!validInput.success){
        return NextResponse.json({
            message:validInput.error.message,
            success:false
        })
    }

    const redisclient = RedisManager.getInstance();

    const eventId = await redisclient.pushToEngine(body,"CREATE_MARKET")

    const response = await redisclient.subscribeToEvent(eventId);


    return NextResponse.json(response)
}