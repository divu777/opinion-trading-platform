import { createClient } from "@redis/client";
import { LimitOrderRequest, MarketOrderRequest, SubscribeMessageType } from "@repo/common";
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

  async pushToEngine(data: LimitOrderRequest):Promise<string> {
        const uniqueId = randomUUID();
        await this.client.lPush(
          "order.queue",
          JSON.stringify({ type:data.order_type,eventId: uniqueId,  payload:data})
        );
        console.log("pushed to engine")
        return uniqueId;
  }

  subscibeToEvent(eventName: string):Promise<any> {
    return new Promise((resolve,reject)=>{
        this.client.subscribe(eventName, (message) => {
      const data = JSON.parse(message);
      this.client.unsubscribe(eventName);
      resolve(data)
    });
    })
    
  }


}


