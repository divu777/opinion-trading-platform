import { RedisManager } from "@/app/redis";
import { LimitOrderRequest, LimitOrderSchema } from "@repo/common";
import { prisma } from "@repo/db/client";
import { NextResponse } from "next/server";
import { useId } from "react";
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
        const {userId,ticket_type,order_type,quantity,price}:LimitOrderRequest=body;


        const checkUserExist= await prisma.user.findUnique({
            where:{
                id:userId
            }
        })

        if(!checkUserExist){
            return NextResponse.json({
                message:"UserId doesn't exist in the database",
                status:false
            })
        }

        await redisInstance.pushToQueue({
            userId,
            ticket_type,
            order_type,
            quantity,
            price
        });

        await redisInstance
        
    } catch (error) {
        console.log(error + " Error in sending Post Request. ");
    }
}