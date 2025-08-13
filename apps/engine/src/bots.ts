import { createClient } from "redis";
import { Manager } from "./redis/currApproach";
import { randomUUIDv7 } from "bun";


export const getmarkets=async()=>{
    const instance = Manager.getInstance();
         await instance.init()


const {payload} = instance.getAllMarkets({type:"GET_ALL_MARKETS",eventId:"ggg",payload:{}})

const markets = payload.markets

console.log(markets)

console.log("hello")

    const redisClient =  createClient()

    await redisClient.connect()


for(let market of markets){
    const uniqueId= randomUUIDv7()
    const buyobj = {type:'BUY_ORDER',eventId:uniqueId,payload:{
        userId:"botxd1",
        ticket_type:"YES",
        order_type:"BUY",
        quantity:Math.floor(Math.random()*10),
        price:(Math.random()*9.5).toFixed(1),
        marketId:market
    }}
    console.log(buyobj)
   await redisClient.lPush('order.queue',JSON.stringify(buyobj))
}


}

async function  createBot(){
    
}
