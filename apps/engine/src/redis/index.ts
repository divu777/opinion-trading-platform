import { createClient } from "@redis/client";
import type { RedisClientType } from "redis";
import type {  SubscribeMessageType,OrderBookSystem } from '@repo/common';

type BALANCES={
    balance:number,
}

type Stock_balance={
  [userId:string]:{
    [marketId:string]:Partial<{
      [ticket_type in "YES" | "NO"]:number
    }>
  }
}



export class Manager {
  private client: RedisClientType;
  private static instance: Manager;
  private OrderBook: OrderBookSystem;
  private User_Balances: Record<string, BALANCES>;
  private Stock_Balances: Stock_balance;
  private constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL,
    });
    this.client.connect();
    this.OrderBook = {};
    this.User_Balances = {};
    this.Stock_Balances= {};
    this.populateAdminBalance();
  }

  populateAdminBalance(){
    this.User_Balances = {
      "ADMIN":{
        balance:20000000
      }
    }


    console.log("admin balance added");
  }

  static getInstance() {
    if (!Manager.instance) {
      Manager.instance = new Manager();
    }
    return Manager.instance;
  }

  async listenForOrders() {
    while (true) {
      const message = await this.client.brPop("order.queue", 0);
      const data: any = JSON.parse(message!.element);
      console.log(message?.element + " maarro dikro")
      await this.ManageOrderRecieved(data);
    }
  }

  async ManageOrderRecieved(data: SubscribeMessageType) {
    let response;

    switch (data.type) {
      case "BUY":
        response = await this.handleBuyOrder(data);
        break;

      case "SELL":
        response = await this.handleSellOrder(data);
        break;

      case "CREATE_MARKET":
        response = await this.createNewMarket(data);
        break;

      case "GET_MARKET_ORDERBOOK":
        response = await this.getMarketOrderBook(data);
        break;

      case "CREATE_USER":
        response =  this.createNewUser(data);
        break;

      case "GET_USER_BALANCE":
        response =  this.getUserBalance(data);
        break;

      case "GET_USER_STOCK_BALANCE":
        response =  this.getUserStockBalance(data);
        break;

      default:
        console.log("No type of request got matched");
        break;
    }

    if (!response || !response?.eventId || !response?.payload) {
      throw new Error("Response either empty or not in correct Format");
    }

    await this.publishToAPI(response.eventId, response.payload);
  }

  async publishToAPI(eventName: string, message: any) {
    await this.client.publish(eventName, JSON.stringify(message));
  }

  resolveMarket(data: any) {
    const { marketId, winner } = data.payload;

    if (!marketId || !this.OrderBook[marketId]) {
      return {
        eventId: data.eventId,
        payload: {
          message: "Market Id not defined or Not Available",
          success: false,
        },
      };
    }

    // winner - will be side either YES or NO and then we iterate over the buy and sell table and add money to people balances
    // doing simple 10-price * quantity

    return {
      eventId: data.eventId,
      payload: {
        message: "Market Resolved Successfully , gamblers are happy now",
        success: true,
      },
    };
  }


  async handleBuyOrder(data: Extract<SubscribeMessageType, { type: "BUY" }>) {
    const { userId, ticket_type, order_type, quantity, price, marketId } =
      data.payload;

    if (
      !userId ||
      !ticket_type ||
      !order_type ||
      !quantity ||
      !price ||
      !marketId
    ) {
      return {
        eventId: data.eventId,
        payload: {
          message: "Missing required fields",
          success: false,
        },
      };
    }

    if (quantity <= 0) {
      return {
        eventId: data.eventId,
        payload: {
          message: "Quantity must be positive",
          success: false,
        },
      };
    }

    if (price < 0.5 || price > 9.5) {
      return {
        eventId: data.eventId,
        payload: {
          message: "Price must be between 0 and 10",
          success: false,
        },
      };
    }
    const userExist = this.User_Balances[userId];

    if (!userExist) {
      return {
        eventId: data.eventId,
        payload: {
          message: "User Does not Exist",
          status: false,
        },
      };
    }

    if (userExist.balance < price * quantity * 100) {
      return {
        eventId: data.eventId,
        payload: {
          message: "Insufficient Balances",
          success: false,
        },
      };
    }

    const marketExist = this.OrderBook[marketId];

    if (!marketExist) {
      return {
        eventId: data.eventId,
        payload: {
          message: "market does not exist",
          success: false,
        },
      };
    }

    const counterSide = marketExist[ticket_type]["SELL"];

    let remainingQuantity = quantity;
    let filledQuantity = 0;
    const fills = [];

    const PriceKeys = Object.keys(counterSide.priceLevels).map(Number);

    PriceKeys.sort((a, b) => a - b);

    for (let priceLevel of PriceKeys) {
      const isPriceAcceptable = priceLevel <= price;
      if (isPriceAcceptable) {
        const priceLevelDetail = counterSide.priceLevels[priceLevel]!;

        const orders = priceLevelDetail?.orders;

        

        while (orders.length && remainingQuantity > 0) {
          const currOrder = orders[0]!;
          const filled = Math.min(currOrder.stock_quantity, remainingQuantity);

          // First also check if the currOrder.user also has the stock in the stockbalances table 

          fills.push({
            price: priceLevel,
            quantity: filled,
          });

          remainingQuantity -= filled;
          currOrder.stock_quantity -= filled;
          filledQuantity += filled;

          if (!this.Stock_Balances[userId]) {
            this.Stock_Balances[userId] = {};
          }
          if (!this.Stock_Balances[userId][marketId]) {
            this.Stock_Balances[userId][marketId] = { [ticket_type]: 0 };
          }

          console.log(currOrder.userId)
          if (!this.Stock_Balances[currOrder.userId]) {
            return {
              eventId: data.eventId,
              payload: {
                message: "Critical error1: Seller not found in stock balances",
                success: false,
              },
            };
          }

          if (!this.Stock_Balances[currOrder.userId]![marketId]) {
            return {
              eventId: data.eventId,
              payload: {
                message: "Critical error2: Seller has no stock record for this market",
                success: false,
              },
            };
          }

          if (this.Stock_Balances[currOrder.userId]![marketId]![ticket_type]! < filled) {
            return {
              eventId: data.eventId,
              payload: {
                message: "Critical error3: Seller doesn't have enough stock to fulfill order",
                success: false,
              },
            };
          }

          this.Stock_Balances[userId]![marketId]![ticket_type]! += filled;

          this.Stock_Balances[currOrder.userId]![marketId]![ticket_type]!-=filled;

          if(this.Stock_Balances[currOrder.userId]![marketId]![ticket_type]===0){
            delete this.Stock_Balances[currOrder.userId]![marketId]![ticket_type]
          }

          if(Object.keys(this.Stock_Balances[currOrder.userId]![marketId]!).length==0){
            delete this.Stock_Balances[currOrder.userId]![marketId]
          }

          const totalCost = priceLevel * filled * 100 

          const seller = this.User_Balances[currOrder.userId]!

          seller.balance +=  totalCost

          const buyer = this.User_Balances[userId]!

          buyer.balance -= totalCost

          priceLevelDetail.totalQty -= filled;
          counterSide.totalQty -= filled;


          if (currOrder.stock_quantity == 0) {
            orders.shift();
            if (orders.length === 0 && priceLevelDetail.totalQty === 0) {
              delete counterSide.priceLevels[priceLevel];
            }

          }

          
        }
      } else {
        break;
      }
    }

    if (remainingQuantity > 0) {
      // make entry to that price
      const buyside = marketExist[ticket_type]["BUY"];

      if (!buyside.priceLevels[price]) {
        buyside.priceLevels[price] = {
          totalQty: 0,
          orders: [],
        };
      }

      buyside.priceLevels[price].orders.push({
        userId,
        stock_quantity: remainingQuantity,
      });

      buyside.totalQty += remainingQuantity;
      buyside.priceLevels[price].totalQty += remainingQuantity;
    }

    return {
      eventId: data.eventId,
      payload: {
        message: "Order done",
        success: true,
        filledQuantity,
        remainingQuantity,
        fills,
      },
    };
  }

  async handleSellOrder(data: Extract<SubscribeMessageType, { type: "SELL" }>) {
    const { userId, ticket_type, order_type, quantity, price, marketId } = data.payload;
    console.log("seeee")
    if(!userId || !ticket_type || !order_type || !quantity || !price || !marketId){
      return{
        eventId:data.eventId,
        payload:{
          message:"Missing required filled",
          success:false
        }
      }
    }

    if (quantity <= 0) {
      return {
        eventId: data.eventId,
        payload: {
          message: "Quantity must be positive",
          success: false,
        },
      };
    }

    if (price <= 0 || price > 10) {
      return {
        eventId: data.eventId,
        payload: {
          message: "Price must be between 0 and 10",
          success: false,
        },
      };
    }

    if(!this.User_Balances[userId]){
      return{
        eventId:data.eventId,
        payload:{
          message:"User Id does not exist , please signup first",
          success:false
        }
      }
    }

    if(!this.Stock_Balances[userId]){
      return{
        eventId:data.eventId,
        payload:{
          message:"User does not own this stock dumbass , buy some shit first",
          success:false
        }
      }
    }

    const marketExist =this.OrderBook[marketId]

    if(!marketExist){
      return {
        eventId:data.eventId,
        payload:{
          message:"Market does not exist with this id ",
          success:false
        }
      }
    }

    const counterSide = marketExist[ticket_type]["BUY"];


    const PriceLevels = Object.keys(counterSide.priceLevels).map(Number)

    PriceLevels.sort((a,b)=>b-a);

    let remainingQty= quantity;
    const fills=[];
    let filledQuantity = 0;

    for(let pricelevel of PriceLevels){
      const priceAcceptable = pricelevel>=price

      if(priceAcceptable){

        const priceLevelDetail = counterSide.priceLevels[pricelevel]!;

        const orders = priceLevelDetail.orders;

        while(orders.length>0 && remainingQty>0){
          const order = orders[0]!;

          const minQty= Math.min(order.stock_quantity,remainingQty);

          if(!this.Stock_Balances[order.userId]) this.Stock_Balances[order.userId]={}
          if(!this.Stock_Balances[order.userId]![marketId]) this.Stock_Balances[order.userId]![marketId]={[ticket_type]:0}

          this.Stock_Balances[order.userId]![marketId]![ticket_type]!+=minQty
          this.Stock_Balances[userId]![marketId]![ticket_type]!-=minQty

          fills.push({
            price:pricelevel,
            quantity:minQty
          })

          remainingQty-=minQty
          filledQuantity+=minQty
          order.stock_quantity-=minQty


          const seller = this.User_Balances[userId];
          const buyer = this.User_Balances[order.userId]!;

          const totalCost= pricelevel*minQty*100

          seller.balance+=totalCost

          buyer.balance-=totalCost


          priceLevelDetail.totalQty-=minQty
          counterSide.totalQty-=minQty

          if(order.stock_quantity===0){
            orders.shift()
            if(priceLevelDetail.totalQty===0 && priceLevelDetail.orders.length===0){
              delete counterSide.priceLevels[pricelevel]
            }
          }

         
          
        }  

      }else{
        break
      }
    }

    if(remainingQty>0){

      // make entry in sell table 

      const sellSide = marketExist[ticket_type]["SELL"];

      if(!sellSide.priceLevels[price]){
        sellSide.priceLevels[price]={
          totalQty:0,
          orders:[]
        }
      }

      sellSide.priceLevels[price].orders.push({
        userId,
        stock_quantity:remainingQty
      })

      sellSide.priceLevels[price].totalQty+=remainingQty
      sellSide.totalQty+=remainingQty

    }


    return {
      eventId:data.eventId,
      payload:{
        message: "Order done",
        success: true,
        filledQuantity,
        remainingQty,
        fills,
      }
    }

    



  }

  createNewMarket(
    data: Extract<SubscribeMessageType, { type: "CREATE_MARKET" }>
  ) {
    const { marketId } = data.payload;

    console.log(JSON.stringify(this.OrderBook))

    if (!marketId) {
      return {
        eventId: data.eventId,
        payload: {
          message: "Missing MarkerId",
          status: false,
        },
      };
    }
    try {
      if (this.OrderBook[marketId]) {
        return {
          eventId: data.eventId,
          payload: {
            message: "Market with the same name already Exist",
            status: false,
          },
        };
      }

      this.OrderBook[marketId] = {
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

      this.Stock_Balances = {
      "ADMIN":{
        [marketId]:{
          "YES":100,
          "NO":100
        }
      }
    }

      return {
        eventId: data.eventId,
        payload: {
          message: "Created and populated the new market in the orderbook",
          success: true,
        },
      };
    } catch (error) {
      console.log("Error in creating new Market " + error);
      return {
        eventId: data.eventId,
        payload: {
          message: "Error in creating new market",
          success: false,
        },
      };
    }
  }

  getMarketOrderBook(
    data: Extract<SubscribeMessageType, { type: "GET_MARKET_ORDERBOOK" }>
  ) {
    const { marketId } = data.payload;

    if (!marketId || !this.OrderBook[marketId]) {
      return {
        eventId: data.eventId,
        payload: {
          message: "Invalid Market Name",
          status: false,
        },
      };
    }

    return {
      eventId: data.eventId,
      payload: {
        mmessage: "Here the OrderBook you asked master",
        status: false,
        data: this.OrderBook[marketId],
      },
    };
  }

// should be implemented to create entries in the user_Balances with default money and also entry in the stock 

/* what we will do is in nextjs we do is create user entry in the db and get the id from there that we pass it here - then it won't be any issue
 but tbh it will be an issue for example what if the main backend goes down now we have the user in db but we never popped it out from the queue 
 even if in the V2 we add the redis for RDS and AOF for recovery mechanism

 29/05/25
 also rememeber when adding queue in main engine to store it in db rather than in the nextjs layer , make the queue acknowledge one basically have the 
 logic of retrying - learnt in 22 week cohort 
*/
  createNewUser(data:Extract<SubscribeMessageType,{type:"CREATE_USER"}>){
    const { userId } = data.payload;
    if(!userId){
      return{
        eventId:data.eventId,
        payload:{
          message:"Invalid user id",
          success:false
        }
      }
    }


    if(this.User_Balances[userId]){
      return{
        eventId:data.eventId,
        payload:{
          message:"User already exist",
          success:false
        }
      }
    }

    this.User_Balances[userId]={
      balance:2000
    }

    this.Stock_Balances[userId]={}

  return {
    eventId:data.eventId,
    payload:{
      message:"User created successfully",
      success:true,
      balance:this.User_Balances[userId]
    }
  }


  }

  getUserBalance(data:Extract<SubscribeMessageType,{type:"GET_USER_BALANCE"}>){

    const {userId} = data.payload;

    if(!userId){
      return{
        eventId:data.eventId,
        payload:{
          message:"Invalid user id",
          success:false
        }
      }
    }

    const userExist= this.User_Balances[userId]

    if(!userExist){
      return{
        eventId:data.eventId,
        payload:{
          message:"User does not exist with this user Id "+userId,
          success:false
        }
      }
    }

    return {
      eventId:data.eventId,
      payload:{
        message:"Feteched user balances successfully",
        success:true,
        balance:userExist.balance,
      }
    }
  }

  getUserStockBalance(data:Extract<SubscribeMessageType,{type:"GET_USER_STOCK_BALANCE"}>){
    const {userId} = data.payload;
    console.log("reeacheed "+userId)
    if(!userId){
      return {
        eventId:data.eventId,
        payload:{
          message:"Invalid user Id",
          success:false
        }
      }
    }

    const userExist = this.Stock_Balances[userId]

    if(!userExist){
      return {
        eventId:data.eventId,
        payload:{
          message:"User not found with this user Id "+userId,
          success:false
        }
      }
    }

    return {
      eventId:data.eventId,
      payload:{
        message:"User current stock holdings found",
        success:true,
        stock_balances:userExist
      }
    }


  }

}


