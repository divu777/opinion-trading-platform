import z from "zod"

type Balances = Record<string, number>;

interface User {
  id: string;
  balance: number;
  stocks: Balances;
}

// order book
type SingleOrder = {
  userId: string;
  stock_quantity: number;
};

type PriceLevel = {
  totalQty: number;
  orders: SingleOrder[];
};

type OrderSide = {
  totalQty: number;
  priceLevels: Record<number, PriceLevel>; // this will be like uk each price and then how much quantity and then array or orders i can iterate
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
export type OrderBookSystem = Record<string, Market>;



export const LimitOrderSchema = z.object({
  userId: z.string({ message: "Invalid User Id." }),
  ticket_type: z.enum(["YES", "NO"], {
    message: "Invalid Ticket Type Provided.",
  }),
  order_type: z.enum(["BUY", "SELL"], {
    message: "Invaid Order Type Provided.",
  }),
  quantity: z
    .number()
    .int()
    .positive({ message: "Invalid quantity provided." }),
  price: z
    .number()
    .int()
    .positive()
    .min(0.5)
    .max(9.5, { message: "Invalid Price" }),
  marketId: z.string({ message: "Event Id not specificed" }),
});


export const StartMarketSchema = z.object({
  marketId: z
    .string()
    .min(6)
    .max(50, { message: "Invalid Market ID Admin sensei" }),
});

export const CreateNewUserSchema = z.object({
  userId: z.string().min(4).max(15, { message: "Invalid user Id" }),
});



export type LimitOrderRequest = z.infer<typeof LimitOrderSchema>;

export type CreateUserType = z.infer<typeof CreateNewUserSchema>;

export type StartMarketType = z.infer<typeof StartMarketSchema>;

export type GetMarketOrderBook = z.infer<typeof StartMarketSchema>;

export type GetUserBalanceType = z.infer<typeof CreateNewUserSchema>;

export type GetUserStockBalance = z.infer<typeof CreateNewUserSchema>;


export type SubscribeMessageType =
  | {
      type: "BUY",
      eventId: string,
      payload: LimitOrderRequest
    }
  | {
      type: "SELL",
      eventId: string,
      payload: LimitOrderRequest
    }
  | {
      type: "CREATE_MARKET",
      eventId: string,
      payload: StartMarketType
    }
  | {
      type: "GET_MARKET_ORDERBOOK",
      eventId: string,
      payload: GetMarketOrderBook
    }
  | {
      type: "CREATE_USER",
      eventId: string,
      payload: CreateUserType
    }
  | {
    type : "GET_USER_BALANCE",
    eventId:string,
    payload: GetUserBalanceType
  } 
  | {
    type: "GET_USER_STOCK_BALANCE",
    eventId:string,
    payload: GetUserStockBalance
  }

