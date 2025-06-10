import { RedisManager } from "@/app/redis";
import { CreateNewUserSchema } from "@repo/common"
import { NextRequest, NextResponse } from "next/server"

export const POST=async(req:NextRequest)=>{
    const body = await req.json()

    const validInput =  CreateNewUserSchema.safeParse(body);

    if(!validInput.success){
        return NextResponse.json({
            message:validInput.error.message,
            success:false
        })
    }

    const redisClient = RedisManager.getInstance();

    const eventId = await redisClient.pushToEngine(body,
        "CREATE_USER"
    );
    const response = await redisClient.subscribeToEvent(eventId);




    return NextResponse.json(response)
}