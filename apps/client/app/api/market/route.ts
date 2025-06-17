import { RedisManager } from "@/app/redis";
import { NextRequest, NextResponse } from "next/server";

export const  GET = async(_:NextRequest)=>{
    try {

        const redisclient =  RedisManager.getInstance();


        const eventId = await redisclient.pushToEngine({},"GET_ALL_MARKETS");
        const response = await redisclient.subscribeToEvent(eventId);

        return NextResponse.json(response);
        
    } catch (error) {
        console.log("error in getting all markets "+error);
        return NextResponse.json({
            message:error,
            success:false
        })
    }
}   