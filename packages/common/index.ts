
type Balances = Record<string, number>;

interface User {
  id: string;
  balance: number;
  stocks: Balances;
}

const user1: User = {
  id: "1",
  balance: 2000,
  stocks: {},
};
const user2: User = {
  id: "2",
  balance: 2000,
  stocks: {},
};
// order book
type SingleOrder = {
  userId: string;
  stock_quantity: number;
};

type PriceLevel = {
  price: number;
  totalQty: number;
  orders: SingleOrder[];
};

type OrderSide = {
  totalPriceQty: number;
  priceLevels: PriceLevel[];
};

export type Market = {
  YES: {
    BUY: OrderSide;
    SELL: OrderSide;
  };
  NO: {
    BUY: OrderSide;
    SELL: OrderSide;
  };
};

// this contains the markett Id and the Market Associated with it 
export type OrderBookSystem=Record<string,Market>
const orderBook: Market = {
  YES: {
    BUY: {
      totalPriceQty: 0,
      priceLevels: [],
    },
    SELL: {
      totalPriceQty: 0,
      priceLevels: [],
    },
  },
  NO: {
    BUY: {
      totalPriceQty: 0,
      priceLevels: [],
    },
    SELL: {
      totalPriceQty: 0,
      priceLevels: [],
    },
  },
};




import z from "zod";



export const MarketOrderSchema=z.object({
    userId:z.string({message:"Invalid User Id."}),
    ticket_type:z.enum(["YES","NO"],{message:"Invalid Ticket Type Provided."}),
    order_type:z.enum(["BUY","SELL"],{message:"Invaid Order Type Provided."}),
    quantity:z.number().int().positive({message:"Invalid quantity provided."}),
    marketId:z.string({message:"Event Id not specificed"})
})

export type MarketOrderRequest=z.infer<typeof MarketOrderSchema>


export const LimitOrderSchema=z.object({
    userId:z.string({message:"Invalid User Id."}),
    ticket_type:z.enum(["YES","NO"],{message:"Invalid Ticket Type Provided."}),
    order_type:z.enum(["BUY","SELL"],{message:"Invaid Order Type Provided."}),
    quantity:z.number().int().positive({message:"Invalid quantity provided."}),
    price:z.number().int().positive().min(0.5).max(9.5)
})

export type LimitOrderRequest=z.infer<typeof LimitOrderSchema>


export type SubscribeMessageType={
  type:"buy",
  eventId:string,
  payload: LimitOrderRequest
} | {
  type:"sell",
    eventId:string,
  payload: LimitOrderRequest
} 

//  cancel order type 

// start and resolve but we will deal with that later 