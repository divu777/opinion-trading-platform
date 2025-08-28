import z from "zod/v4";

// order book
type SingleOrder = {
  userId: string;
  stock_quantity: number;
};

export type PriceLevel = {
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

export type OrderBookSystem2 = Record<
  string,
  { BUY: OrderSide; SELL: OrderSide }
>;

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
  price: z.float32().positive().min(0.5).max(9.5, { message: "Invalid Price" }),
  marketId: z.string({ message: "Event Id not specificed" }),
});

export const StartMarketSchema = z.object({
  marketId: z
    .string()
    .min(6)
    .max(50, { message: "Invalid Market ID Admin sensei" }),
  title: z.string().optional(),
  description: z.string().optional(),
});

export const QueryMarketSchema = z.object({
  query: z.string({ message: "Not valid query for searching markets" }),
});

export const CreateNewUserSchema = z.object({
  userId: z.string().min(4).max(15, { message: "Invalid user Id" }),
});

export const ResolveMarketSchema = z.object({
  marketId:z.string(),
  winner: z.enum(["YES","NO"])
})

export type LimitOrderRequest = z.infer<typeof LimitOrderSchema>;

export type CreateUserType = z.infer<typeof CreateNewUserSchema>;

export type StartMarketType = z.infer<typeof StartMarketSchema>;

export type GetMarketOrderBook = z.infer<typeof StartMarketSchema>;

export type GetUserBalanceType = z.infer<typeof CreateNewUserSchema>;

export type GetUserStockBalance = z.infer<typeof CreateNewUserSchema>;

export type SubscribeMessageType =
  | {
      type: "BUY";
      eventId: string;
      payload: LimitOrderRequest;
    }
  | {
      type: "SELL";
      eventId: string;
      payload: LimitOrderRequest;
    }
  | {
      type: "CREATE_MARKET";
      eventId: string;
      payload: StartMarketType;
    }
  | {
      type: "GET_MARKET_ORDERBOOK";
      eventId: string;
      payload: GetMarketOrderBook;
    }
  | {
      type: "CREATE_USER";
      eventId: string;
      payload: CreateUserType;
    }
  | {
      type: "GET_USER_BALANCE";
      eventId: string;
      payload: GetUserBalanceType;
    }
  | {
      type: "GET_USER_STOCK_BALANCE";
      eventId: string;
      payload: GetUserStockBalance;
    }
  | {
      type: "GET_ALL_MARKETS";
      eventId: string;
      payload: {};
    }
  | {
      type: "RESOLVE_MARKET";
      eventId: string;
      payload: {
        marketId: string;
        winner: "YES" | "NO";
      };
    }
  | {
      type: "QUERY_SEARCH";
      eventId: string;
      payload: {
        query: string;
      };
    };

export type MessageRecieved =
  | {
      type: "SUBSCRIBE_MARKET";
      payload: {
        marketId: string;
      };
    }
  | {
      type: "UNSUBSCRIBE_MARKET";
      payload: {
        marketId: string;
      };
    }
  | {
      type: "MARKET_UPDATE";
      payload: {
        marketId: string;
        orderBook: any;
      };
    }
  | {
      type: "NEW_MARKET";
      payload: {
        marketId: string;
      };
    };
    
export type BALANCES = {
  balance: number;
};

export type Stock_balance = {
  [userId: string]: {
    [marketId: string]: Partial<{
      [ticket_type in "YES" | "NO"]: number;
    }>;
  };
};

export type Market_Info = Record<
  string,
  {
    title?: string;
    description?: string;
    YES?: number;
    NO?: number;
    isResolved: boolean;
    winner: "YES" | "NO" | undefined;
  }
>;

export type UserBalances = {
  [userId: string]: {
    balance: number;
    locked: number; 
  };
};
