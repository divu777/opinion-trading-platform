import { RedisManager } from "@/app/redis";
import { LimitOrderRequest, LimitOrderSchema } from "@repo/common";
import { prisma } from "@repo/db/client";
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
        const {userId,ticket_type,order_type,quantity,price,marketId}:LimitOrderRequest=body;

        const eventId:string=await redisInstance.pushToEngine({
            userId,
            ticket_type,
            order_type,
            quantity,
            price,
            marketId
        });

        const response = await redisInstance.subscibeToEvent(eventId);
        return NextResponse.json(response);
    } catch (error) {
        console.log(error + " Error in sending Post Request. ");
    }
}