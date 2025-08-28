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
    this.pubsubclient = this.client.duplicate();
  }

  async init() {
    if (!this.client.isOpen) {
      await this.client.connect();
    }

    if (!this.pubsubclient.isOpen) {
      await this.pubsubclient.connect();
    }

    console.log("Both clients are connected");
  }

  static getInstance() {
    if (!RedisManager.instance) {
      RedisManager.instance = new RedisManager();
    }
    return RedisManager.instance;
  }

/* 
Any one is who is trying to understand , the basic issue was before the redis could subscribe to the clientId we miss the events.
I know might sound like JS can't be that fast but it is so rather than pushing to queue first and then subscribing we subscribe to the event 
first and then push and the confusing code for push to engine you see optional for event was i did to now see all routes to get all red.

P.S - If someone wants to submit a PR for this for sure do just make sure all routes work 👍🏻
*/
  async pushToEngine(data: any, type: string, event?: string): Promise<string> {
    const uniqueId = randomUUID();
    const eventName = event ? event : uniqueId;
    await this.client.lPush(
      "order.queue",
      JSON.stringify({ type, eventId: eventName, payload: data })
    );
    console.log("pushed to engine");
    return uniqueId;
  }

  async subscribeToEvent(eventName: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const timeout = setTimeout(async () => {
        console.log("timeout called");
        await this.pubsubclient.unsubscribe(eventName);
        reject({ message: "no response" });
      }, 5000);

      await this.pubsubclient.subscribe(eventName, (message) => {
        clearTimeout(timeout);
        const data = JSON.parse(message);

        this.pubsubclient.unsubscribe(eventName);
        resolve(data);
      });
    });
  }
}
