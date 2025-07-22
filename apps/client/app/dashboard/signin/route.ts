import { RedisManager } from "@/lib/redis";
import { CreateNewUserSchema } from "@repo/common"
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server"

export const POST=async(req:NextRequest)=>{
    const body = await req.json()
    console.log(body);
    const validInput =  CreateNewUserSchema.safeParse(body.data);

    if(!validInput.success){
        return NextResponse.json({
            message:validInput.error.message,
            success:false
        })
    }

    const redisClient = RedisManager.getInstance();

    // const eventId = await redisClient.pushToEngine(
    // );
    // const response = await redisClient.subscribeToEvent(eventId);

    const uniqueId = randomUUID()
            const promise =  redisClient.subscribeToEvent(uniqueId);
            const eventId = await redisClient.pushToEngine(body.data,
        "CREATE_USER",uniqueId);
    
            const response = await promise


    return NextResponse.json(response)
}