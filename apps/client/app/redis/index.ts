import { createClient } from "@redis/client";
import { LimitOrderRequest, MarketOrderRequest } from "@repo/common";
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


  pushToEngine(data: LimitOrderRequest | MarketOrderRequest):Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const uniqueId = randomUUID();
        this.client.lPush(
          "order.queue",
          JSON.stringify({ id: uniqueId, ...data })
        );
        resolve(uniqueId);
      } catch (error) {
        reject(error);
      }
    });
  }

  subscibeToEvent(eventName: string):Promise<any> {
    return new Promise((resolve,reject)=>{
        this.client.subscribe(eventName, (message) => {
      const data = JSON.parse(message);
      resolve(data)
    });
    })
    
  }

  static getInstance() {
    if (!RedisManager.instance) {
      return new RedisManager();
    }
    return RedisManager.instance;
  }
}


