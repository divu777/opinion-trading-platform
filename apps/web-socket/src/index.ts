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



/*
1) add the logic of how web socket will work [ main index calls web socket to start -> web socket uses 
 redisclient to call sub and unsub to new market ( only when new market event comes or delete market/resolve market ) 
 
 -> thne what is recieved from the sub is then emmitted out to the WS listening ]


 2) test it on the frontend 

 3) simulate a test where infinte loop runs that nodejs thread make request to the backend to simulate 

 4) also add the admin logic to make markets and also then resolve 


*/