import {  RedisClientType } from "redis";
import {createClient } from '@redis/client'
import { WebSocketServer } from "ws"

export class RedisManager {
  private redisClient: RedisClientType;
  private static instance: RedisManager;

  private constructor() {
    this.redisClient = createClient();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new RedisManager();
    }
    return this.instance;
  }

  subscribeToMarket(marketId:string){
    this.redisClient.subscribe(marketId,(data)=>{
        console.log(data);
    })
  }

  unsubscribeToMarket(marketId:string){
    this.redisClient.unsubscribe(marketId,()=>{
      console.log("market unsubed");
    })
  }
  
}