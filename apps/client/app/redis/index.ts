import { createClient } from "@redis/client";
import { LimitOrderRequest } from "@repo/common";
import { randomUUID } from "crypto";
import type { RedisClientType } from "redis";

export class RedisManager {
  private client: RedisClientType;
  private static instance: RedisManager;

  private constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL,
    });
    this.client.connect();
  }
  
  static getInstance() {
    if (!RedisManager.instance) {
      RedisManager.instance = new RedisManager();
    }
    return RedisManager.instance;
  }

  async pushToEngine(data: any, type:string):Promise<string> {
        const uniqueId = randomUUID();
        await this.client.lPush(
          "order.queue",
          JSON.stringify({ type,eventId: uniqueId,  payload:data})
        );
        console.log("pushed to engine")
        return uniqueId;
  }

  subscribeToEvent(eventName: string):Promise<any> {

    return new Promise((resolve,reject)=>{
       const timeout = setTimeout(() => {
        this.client.unsubscribe(eventName);
        reject({message:"no response"});
      }, 5000)


      this.client.subscribe(eventName, (message) => {
            clearTimeout(timeout);
      const data = JSON.parse(message);

      this.client.unsubscribe(eventName);
      resolve(data)
    });
    })
    
  }


}


