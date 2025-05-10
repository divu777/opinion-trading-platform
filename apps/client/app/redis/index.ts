import { createClient } from "@redis/client";
import { LimitOrderRequest, MarketOrderRequest } from "@repo/common";
import { randomUUID } from "crypto";
import type { RedisClientType } from "redis";

export class RedisManager{
    private client:RedisClientType
    private static instance: RedisManager;

    
     private constructor(){
        this.client= createClient({
            url:process.env.REDIS_URL
        })
        this.client.connect();

        
    }
    pushToEngine(data:LimitOrderRequest | MarketOrderRequest){
        const uniqueId=randomUUID()
        this.client.lPush("order.queue",JSON.stringify({id:uniqueId,...data}))
        return uniqueId;
    } 

    async subscibeToEvent(eventName:string){
        this.client.subscribe(eventName,(message)=>{
            const data =JSON.parse(message);
            return data;
        })
    }

    static getInstance(){
        if(!RedisManager.instance){
            return new RedisManager()
        }
        return RedisManager.instance 
    }


}


