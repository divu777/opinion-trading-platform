import { createClient } from "@redis/client";
import type { RedisClientType } from "redis";

class RedisManager{
    private client:RedisClientType
    private static instance: RedisManager;

    
     private constructor(){
        this.client= createClient({
            url:process.env.REDIS_URL
        })
        this.client.connect();
        
    }
    public async pushToQueue(clientId:string,message:any){
        this.client.lPush(clientId,JSON.stringify(message))
    } 

    public getInstance(){
        if(!RedisManager.instance){
            return new RedisManager()
        }
        return RedisManager.instance 
    }

}


