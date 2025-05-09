import { createClient } from "@redis/client";
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
    public async pushToQueue(data:any){
        const uniqueId=randomUUID()
        this.client.lPush("order.queue",JSON.stringify({uniqueId,...data}))
    } 

    public subscibeToEvent(eventName:string){
        this.client.subscribe(eventName,(message)=>{
            
        })
    }

    public static getInstance(){
        if(!RedisManager.instance){
            return new RedisManager()
        }
        return RedisManager.instance 
    }


}


