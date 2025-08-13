import { createClient } from "@redis/client";
import { LimitOrderRequest } from "@repo/common";
import { randomUUID } from "crypto";
import type { RedisClientType } from "redis";

export class RedisManager {
  private client: RedisClientType;
    private pubsubclient: RedisClientType;

  private static instance: RedisManager;

  private constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL,
    });
    this.pubsubclient= this.client.duplicate()

  }
  async init() {
  await this.client.connect();
  await this.pubsubclient.connect();
}

  static getInstance() {
    if (!RedisManager.instance) {
      RedisManager.instance = new RedisManager();
    }
    return RedisManager.instance;
  }

  async pushToEngine(data: any, type: string, event?:string): Promise<string> {
  
    const uniqueId = randomUUID();
    const eventName = event?event:uniqueId
    await this.client.lPush(
      "order.queue",
      JSON.stringify({ type, eventId: eventName, payload: data })
    );
    console.log("pushed to engine");
    return uniqueId;
  }

  async subscribeToEvent(eventName: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const timeout = setTimeout(async() => {
        console.log("timeout called")
        await this.pubsubclient.unsubscribe(eventName);
        reject({ message: "no response" });
      }, 5000);

      console.log("we are here1");
      await this.pubsubclient.subscribe(eventName, (message) => {
        console.log("we are here2");

        clearTimeout(timeout);
        const data = JSON.parse(message);

        this.pubsubclient.unsubscribe(eventName);
        resolve(data);
      });
    });
  }
}
