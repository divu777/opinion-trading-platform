import { prisma } from '@repo/db/client';
import { createClient } from "@redis/client";
import type { RedisClientType } from "redis";
import type { Market, SubscribeMessageType,OrderBookSystem } from '@repo/common';
import { collapseTextChangeRangesAcrossMultipleVersions } from 'typescript';

type BALANCES={
    balance:number,
    locked:number
}
export class Manager{
    private client:RedisClientType
    private static instance: Manager;
    private OrderBook:OrderBookSystem;
    private User_Balances:Record<string,BALANCES>;
    
     private constructor(){
        this.client= createClient({
            url:process.env.REDIS_URL
        })
        this.client.connect();
        this.OrderBook={};
        this.User_Balances={};
    }

     static getInstance(){
        if(!Manager.instance){
            return new Manager()
        }
        return Manager.instance 
    }

    
    async listenForOrders(){
        while(true){
            const message=await this.client.brPop('order.queue',0);
            console.log(message);
            const data:SubscribeMessageType = JSON.parse(message!.element);
            this.ManageOrderRecieved(data);
        }
    }
    
    async publishToAPI(eventName:string,message:any){
        await this.client.publish(eventName,JSON.stringify(message))
    }


    
    
    async ManageOrderRecieved(data: SubscribeMessageType){
        let response;
        
        switch(data.type){
            case "BUY":
                response=await this.handleBuyOrder(data);
                break;

            case "SELL":
                await this.handleSellOrder(data);
                break;

            case "CREATE_MARKET":
                 this.createNewMarket(data);
                 break;

            default:
                console.log("No type of request got matched");
                break;
        
        }

        if(!response || !response?.eventId || !response?.payload){
            throw new Error ( "Response either empty or not in correct Format");
        }

        await this.publishToAPI(response.eventId,response.payload)

    }

    resolveMarket(data:any){
        const {marketId,winner}=data.payload;

        if(!marketId || !this.OrderBook[marketId]){
            return{
                eventId:data.eventId,
                payload:{
                    message:"Market Id not defined or Not Available",
                    success:false
                }
            }
        }

        // winner - will be side either YES or NO and then we iterate over the buy and sell table and add money to people balances 
        // doing simple 10-price * quantity 


        return {
            eventId:data.eventId,
            payload:{
                message:"Market Resolved Successfully , gamblers are happy now",
                success:true
            }
        }
    }


    async handleBuyOrder(data: Extract<SubscribeMessageType, {type:"BUY"}>){
        const {userId,ticket_type,order_type,quantity,price,marketId}=data.payload;

        if (!userId || !ticket_type || !order_type || !quantity || !price || !marketId) {
      return {
        eventId:data.eventId,
        payload:{
        message: "Missing required fields",
        success: false,
      }};
    }


     if (quantity <= 0) {
      return {
        eventId:data.eventId,
        payload:{
        message: "Quantity must be positive",
        success: false,
      }}
    }

    if (price <= 0 || price > 10) {
      return {
        eventId:data.eventId,
        payload:{
        message: "Price must be between 0 and 10",
        success: false,
      }};
    }
    const userExist = this.User_Balances[userId];

    if(!userExist){
        return {
            eventId:data.eventId,
            payload:{
                message:"User Does not Exist",
                status:false
            }
        }
    }




        if(userExist.balance<price*quantity*100){
            return {
                eventId:data.eventId,
                payload:{
                message:"Insufficient Balances",
                success:false
            }}
        }



        const marketExist=this.OrderBook[marketId];


        if(!marketExist){
            return {
                eventId:data.eventId,
                payload:{
                    message:"market does not exist",
                    success:false
                }
            }
        }


        const counterSide=marketExist[ticket_type]["SELL"]


        let remainingQuantity=quantity;
        let filledQuantity=0;
        const fills=[];

        const PriceKeys = Object.keys(counterSide.priceLevels).map(Number);

        PriceKeys.sort((a,b)=>a-b)


        for(let priceLevel of PriceKeys){
        const isPriceAcceptable= priceLevel<=price 
                    if(isPriceAcceptable){
                        
                        const priceLevelDetail=counterSide.priceLevels[priceLevel]!

                        const orders = priceLevelDetail?.orders;

                        while(orders.length && remainingQuantity>0){
                            const currOrder=orders[0]!;
                            const filled = Math.min(currOrder.stock_quantity,remainingQuantity);
                             
                            fills.push({
                                price:priceLevel,
                                quantity:filled
                            })

                            remainingQuantity-=filled
                            currOrder.stock_quantity-=filled
                            filledQuantity+=filled

                            if(currOrder.stock_quantity==0){
                                orders.shift()
                            }

                            priceLevelDetail.totalQty-=filled
                            counterSide.totalQty-=filled
                            

                        }


                    }else{
                        break;
                    }
                }

                 if(remainingQuantity>0){
                            // make entry to that price
                            const buyside = marketExist[ticket_type]["BUY"];
                            
                            if(!buyside.priceLevels[price]){
                                buyside.priceLevels[price] = {
                                    totalQty: 0,
                                    orders: []
                                    };
                            }

                            buyside.priceLevels[price].orders.push({
                                userId,
                                stock_quantity:remainingQuantity
                            })

                            buyside.totalQty+=remainingQuantity
                            buyside.priceLevels[price].totalQty+=remainingQuantity
                        }

                

        return {
  eventId: data.eventId,
  payload: {
    message,
    success: true,
    filledQuantity,
    remainingQuantity,
    fills,
  }
};


    }


    async handleSellOrder(data: Extract<SubscribeMessageType,{type:"SELL"}>){
        const {userId,ticket_type,order_type,quantity,price,marketId}=data.payload;
    }

    createNewMarket(data: Extract<SubscribeMessageType, { type: "CREATE_MARKET" }>){

        const {marketId}=data.payload;

        if(!marketId){
            return {
                eventId:data.eventId,
                payload:{
                    message:"Missing MarkerId",
                    status:false
                }
            }
        }
        try {
           if (this.OrderBook[marketId]){
            return {
                eventId:data.eventId,
                payload:{
                    message:"Market with the same name already Exist",
                    status:false
                }
            }
           }


           this.OrderBook.marketName = {
             YES: {
               BUY: {
                 totalQty: 100,
                 priceLevels: {
                   "5": {
                     totalQty: 100,
                     orders: [
                       {
                         userId: "ADMIN",
                         stock_quantity: 100,
                       },
                     ],
                   },
                 },
               },
               SELL: {
                 totalQty: 100,
                 priceLevels: {
                   "5": {
                     totalQty: 100,
                     orders: [
                       {
                         userId: "ADMIN",
                         stock_quantity: 100,
                       },
                     ],
                   },
                 },
               },
             },
             NO: {
               BUY: {
                 totalQty: 100,
                 priceLevels: {
                   "5": {
                     totalQty: 100,
                     orders: [
                       {
                         userId: "ADMIN",
                         stock_quantity: 100,
                       },
                     ],
                   },
                 },
               },
               SELL: {
                 totalQty: 100,
                 priceLevels: {
                   "5": {
                     totalQty: 100,
                     orders: [
                       {
                         userId: "ADMIN",
                         stock_quantity: 100,
                       },
                     ],
                   },
                 },
               },
             },
           };

           return {
            eventId:data.eventId,
            payload:{
                message:"Created and populated the new market in the orderbook",
                success:true
            }
           }


            
        } catch (error) {
            console.log("Error in creating new Market "+error);
            return{
                eventId:data.eventId,
                payload:{
                    message:"Error in creating new market",
                    success:false
                }
            }
        }
    }



    getMarketOrderBook(data:Extract<SubscribeMessageType,{type:"GET_MARKET_ORDERBOOK"}>){
        const {marketId} = data.payload;

        
        if(!marketId || !this.OrderBook[marketId]){
            return {
                eventId:data.eventId,
                payload:{
                    message:"Invalid Market Name",
                    status:false
                }
            }
        }

        return {
            eventId:data.eventId,
            payload:{
                mmessage:"Here the OrderBook you asked master",
                status:false,
                data:this.OrderBook[marketId]
            }
        }



    }

    

   

}


