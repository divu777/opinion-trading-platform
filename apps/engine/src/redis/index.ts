import { prisma } from '@repo/db/client';
import type { MarketOrderRequest ,LimitOrderRequest} from '@repo/common';
import { createClient } from "@redis/client";
import type { RedisClientType } from "redis";
import { SubscribeMessageType } from '@repo/common';



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
    
    
    async ManageOrderRecieved(data: SubscribeMessageType){
        
        if(data.type=="buy"){
            await this.handleBuyOrder(data)
        }else{
            await this.handleSellOrder(data)
        }
    }


    async handleBuyOrder(data: SubscribeMessageType){
        const {userId,ticket_type,order_type,quantity,price}=data.payload;

        if (!userId || !ticket_type || !order_type || !quantity || !price) {
      return this.publishToAPI(data.eventId,{
        message: "Missing required fields",
        success: false,
      });
    }


     if (quantity <= 0) {
      return this.publishToAPI(data.eventId,{
        message: "Quantity must be positive",
        success: false,
      });
    }

    if (price <= 0 || price > 10) {
      return this.publishToAPI(data.eventId,{
        message: "Price must be between 0 and 10",
        success: false,
      });
    }

        // check balance 
        const userExist=await prisma.user.findUnique({
            where:{
                id:userId
            }
        });

        if(!userExist){
            return this.publishToAPI(data.eventId,{
                message:"User Doesn't Exist",
                success:false
            })
        }

        if(userExist.balance<price*quantity*100){
            this.publishToAPI(data.eventId,{
                message:"Insufficient Balances",
                success:false
            })
        }

        const counterAction






    }


    async handleSellOrder(data:SubscribeMessageType){
        const {userId,ticket_type,order_type,quantity,price}=data.payload;
    }

    

    static getInstance(){
        if(!RedisManager.instance){
            return new RedisManager()
        }
        return RedisManager.instance 
    }

}


