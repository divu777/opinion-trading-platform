import { prisma } from '@repo/db/client';
import { createClient } from "@redis/client";
import type { RedisClientType } from "redis";
import type { Market, SubscribeMessageType,OrderBookSystem } from '@repo/common';

type ResponseToAPI={
    eventId:string,
    payload:any
}
export class Manager{
    private client:RedisClientType
    private static instance: Manager;
    private OrderBook:OrderBookSystem={}
    
     private constructor(){
        this.client= createClient({
            url:process.env.REDIS_URL
        })
        this.client.connect();
        
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

    }


    async handleBuyOrder(data: Extract<SubscribeMessageType, {type:"BUY"}>){
    //     const {userId,ticket_type,order_type,quantity,price,marketId}=data.payload;

    //     if (!userId || !ticket_type || !order_type || !quantity || !price || !marketId) {
    //   return {
    //     eventId:data.eventId,
    //     payload:{
    //     message: "Missing required fields",
    //     success: false,
    //   }};
    // }


    //  if (quantity <= 0) {
    //   return {
    //     eventId:data.eventId,
    //     payload:{
    //     message: "Quantity must be positive",
    //     success: false,
    //   }}
    // }

    // if (price <= 0 || price > 10) {
    //   return {
    //     eventId:data.eventId,
    //     payload:{
    //     message: "Price must be between 0 and 10",
    //     success: false,
    //   }};
    // }

    //     // check balance 
    //     const userExist=await prisma.user.findUnique({
    //         where:{
    //             id:userId
    //         }
    //     });

    //     if(!userExist){
    //         return {eventId:data.eventId,
    //             payload:{
    //             message:"User Doesn't Exist",
    //             success:false
    //         }}
    //     }

    //     if(userExist.balance<price*quantity*100){
    //         return {eventId:data.eventId,
    //             payload:{
    //             message:"Insufficient Balances",
    //             success:false
    //         }}
    //     }

    //     const marketExist=await prisma.market.findUnique({
    //         where:{
    //             id:marketId
    //         }
    //     })


    //     if(!marketExist){
    //         return {
    //             eventId:data.eventId,
    //             payload:{
    //                 message:"market does not exist",
    //                 success:false
    //             }
    //         }
    //     }
    //     const marketName=marketExist.name
    //     const marketWatch:Market =this.OrderBook.marketName!


    //     const counterSide=order_type==="BUY" ? marketWatch[ticket_type]["SELL"] : marketExist[ticket_type]["BUY"]


    //     let remainingQuantity=quantity;
    //     let filledQuantity=0;
    //     const fills=[];

    //     counterSide.priceLevels.sort((a:any,b:any)=>{
    //         return order_type==="BUY"?
    //         a.price-b.price
    //         : b.price-a.price
    //     })


    //     for(let i=0;i<counterSide.priceLevels.length && remainingQuantity>0 ; i++){

    //         const priceLevel = counterSide.priceLevels[i];

    //     const isPriceAcceptable= order_type==="BUY"?
    //     priceLevel.price<=price :
    //     priceLevel.price >= price;



    //                 if(!isPriceAcceptable){
    //                     continue;
    //                 }

    //                 const orders=priceLevel.orders;
    //                 let priceLevelFillQuantity = 0;


    //                 for(let j=0;j<orders.length && remainingQuantity>0;j++){
    //                     const order =orders[j];

    //                     if(order.stock_quantity<=remainingQuantity){
    //                         const fillAmount=order.stock_quantity;
    //                         remainingQuantity-=fillAmount;
    //                         filledQuantity+=fillAmount;
    //                         priceLevelFillQuantity+=fillAmount;
    //                         orders.splice(j,1);
    //                         j--;
    //                     }else{
    //                         order.stock_quantity-=remainingQuantity;
    //                         filledQuantity+=remainingQuantity;
    //                         priceLevelFillQuantity+=remainingQuantity;
    //                         remainingQuantity=0;
    //                     }
    //                 }

    //                 if(priceLevelFillQuantity>0){
    //                     priceLevel.totalOty -=priceLevelFillQuantity;
    //                     counterSide.totalQty-=priceLevelFillQuantity;

    //                     fills.push({
    //                         price:priceLevel.price,
    //                         quantity:priceLevelFillQuantity
    //                     })
    //                 }

    //                 if(priceLevel.totalQty===0){
    //                     counterSide.priceLevels.splice(i,1);
    //                     i--;
    //                 }

    //     }

    //     if(remainingQuantity>0){
    //         const orderSide= this.OrderBook[marketName]![ticket_type][order_type];

    //         let priceLevel = orderSide.priceLevels.find(
    //             (level)=>level.price===price
    //         )

    //         if(!priceLevel){
    //             priceLevel={
    //                 price,
    //                 totalQty:0,
    //                 orders:[],

    //             }

    //             orderSide.priceLevels.push(priceLevel);

    //             orderSide.priceLevels.sort((a,b)=>{
    //                 return order_type==="BUY"?
    //                 b.price-a.price:
    //                 a.price-b.price
    //             })

    //         }

    //         priceLevel.orders.push({
    //             userId,
    //             stock_quantity:remainingQuantity
    //         })

    //         priceLevel.totalQty+=remainingQuantity
    //         orderSide.totalQty+=remainingQuantity

    //     }

    //     return {
    //         eventId:data.eventId,
    //         payload:{
    //              message:
    //     filledQuantity > 0
    //       ? `Limit order partially filled: ${filledQuantity} filled, ${remainingQuantity} placed on book`
    //       : `Limit order placed on book: ${remainingQuantity} units at ${price}`,
    //   success: true,
    //   filledQuantity,
    //   remainingQuantity,
    //   fills,
    //         }
    //     }









    }


    async handleSellOrder(data: Extract<SubscribeMessageType,{type:"SELL"}>){
        const {userId,ticket_type,order_type,quantity,price,marketId}=data.payload;
    }

    createNewMarket(data: Extract<SubscribeMessageType, { type: "CREATE_MARKET" }>){

        const {marketName}=data.payload;

        if(!marketName){
            return {
                eventId:data.eventId,
                payload:{
                    message:"Invalid Market Name",
                    status:false
                }
            }
        }
        try {
           if (this.OrderBook!.marketName){
            return {
                eventId:data.eventId,
                payload:{
                    message:"Market with the same name already Exist",
                    status:false
                }
            }
           }


           this.OrderBook.marketName={
                YES: {
                    BUY: {
                    totalQty: 0,
                    priceLevels: [],
                    },
                    SELL: {
                    totalQty: 0,
                    priceLevels: [],
                    },
                },
                NO: {
                    BUY: {
                    totalQty: 0,
                    priceLevels: [],
                    },
                    SELL: {
                    totalQty: 0,
                    priceLevels: [],
                    },
                },
                };
            
        } catch (error) {
            console.log("Error in creating new Market "+error)
        }
    }

    

   

}


