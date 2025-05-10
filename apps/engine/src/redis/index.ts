import type { MarketOrderRequest ,LimitOrderRequest} from '@repo/common';
import { createClient } from "@redis/client";
import type { RedisClientType } from "redis";




type SubscribeMessageType={
    type:"market_order",
    id:string,
    data:MarketOrderRequest
} | {
    type:"limit_order",
    id:string,
    data:LimitOrderRequest
}
export class RedisManager{
    private client:RedisClientType
    private static instance: RedisManager;

    
     private constructor(){
        this.client= createClient({
            url:process.env.REDIS_URL
        })
        this.client.connect();
        
    }
    subscribeToOrders(){
        this.client.subscribe('order.queue',(message)=>{
            const data:SubscribeMessageType = JSON.parse(message);
            this.ManageOrderRecieved(data);
        })
    }
    
    publishToAPI(eventName:string,message:any){
        this.client.publish(eventName,JSON.stringify(message))
    }
    
    
    ManageOrderRecieved(data: SubscribeMessageType){
        
        if(data.type=="limit_order"){
            const {userId,ticket_type,order_type,quantity,price}=data.data;
            
        }
    }
    

    static getInstance(){
        if(!RedisManager.instance){
            return new RedisManager()
        }
        return RedisManager.instance 
    }

}


