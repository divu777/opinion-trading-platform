import { RedisManager } from '@/app/redis';
import { CreateNewUserSchema } from '@repo/common';
import { NextRequest, NextResponse } from 'next/server';
export  async function POST(req:NextRequest,){
    try{

        const body = await req.json();
        const validInput = CreateNewUserSchema.safeParse(body);

        if(!validInput.success){
            NextResponse.json({
                message: validInput.error.message,
                success:false
            })
        }


        const redisClient= RedisManager.getInstance();

        const subscribeId = await redisClient.pushToEngine(body)

        const response = await redisClient.subscribeToEvent(subscribeId);

        NextResponse.json(response);


    }
catch(error){
    console.log("Error in creating new user " +error);
    NextResponse.json({
        "message":"Error in creating new user",
        "sucess":false,
        error
    })
}
}