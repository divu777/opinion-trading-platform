import { RedisManager } from "@/lib/redis";
import {  LimitOrderSchema } from "@repo/common";

import { NextResponse } from "next/server";

export const POST=async(req:Request)=>{
    try {
        const body=await req.json()

        const result=LimitOrderSchema.safeParse(body);

        if(!result.success){
            return NextResponse.json({
                message:result.error.message,
                status:false
            })
        
        }
        const redisInstance = RedisManager.getInstance()

        const eventId:string=await redisInstance.pushToEngine(body,String(body.order_type));

        const response = await redisInstance.subscribeToEvent(eventId);
        return NextResponse.json(response);
    } catch (error) {
        console.log(error + " Error in sending Post Request. ");
    }
}