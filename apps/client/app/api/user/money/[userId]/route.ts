import { RedisManager } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_:NextRequest,{params}:{params:Promise<{userId:string}>}){

    const userId = (await params).userId;

    if(!userId){
        return NextResponse.json({
            message:"user id not valid"
        })
    }

    const redisclient = RedisManager.getInstance()

    const eventId = await redisclient.pushToEngine({userId},"GET_USER_BALANCE");

    const response = await redisclient.subscribeToEvent(eventId);
    return NextResponse.json(response)
}

