import { createClient } from "@redis/client";
import type { RedisClientType } from "redis";
import type {
  PriceLevel,
  SubscribeMessageType,
  OrderBookSystem,
  UserBalances,
  Stock_balance,
  Market_Info,
} from "@repo/common";

export class Manager {
  private client: RedisClientType;
  private static instance: Manager;
  private OrderBook: OrderBookSystem;
  private User_Balances: UserBalances;
  private Stock_Balances: Stock_balance;
  private Market_Info: Market_Info;
  private websocket: WebSocket;

  private constructor() {
    console.log("Manager instance created");
    this.client = createClient({
      url: process.env.REDIS_URL,
    });
    this.OrderBook = {};
    this.User_Balances = {};
    this.Stock_Balances = {};
    this.websocket = new WebSocket("ws://localhost:4000");
    this.Market_Info = {};
    this.populateAdminBalance();
    // setInterval(this.printOrderBook.bind(this), 30000);
  }

  async init(){
    if(this.client.isOpen){
      console.log("already connected")
      return
    }else{

      await this.client.connect();
    }
  }

  populateAdminBalance() {
    this.User_Balances = {
      ADMIN: {
        balance: 20000000,
        locked: 0,
      },
    };
    console.log("Admin balance initialized");
  }

  sendSocket(data: any) {
    if (this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(data));
    } else if (this.websocket.readyState === WebSocket.CONNECTING) {
      const sendMsg = () => {
        this.websocket.send(JSON.stringify(data));
        this.websocket.removeEventListener("open", sendMsg);
      };
      this.websocket.addEventListener("open", sendMsg);
    } else {
      console.log("WebSocket connection error");
    }
  }

  printOrderBook() {
    console.log("=== Current State ===");
    console.log("OrderBook:", JSON.stringify(this.OrderBook, null, 2));
    console.log("User Balances:", JSON.stringify(this.User_Balances, null, 2));
    console.log(
      "Stock Balances:",
      JSON.stringify(this.Stock_Balances, null, 2)
    );
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
      console.log("Processing order:", message?.element);
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
        response = this.createNewMarket(data);
        break;
      case "GET_MARKET_ORDERBOOK":
        response = this.getMarketOrderBook(data);
        break;
      case "CREATE_USER":
        response = this.createNewUser(data);
        break;
      case "GET_ALL_MARKETS":
        response = this.getAllMarkets(data);
        break;
      case "GET_USER_BALANCE":
        response = this.getUserBalance(data);
        break;
      case "RESOLVE_MARKET":
        response = this.resolveMarket(data);
        break;
      case "QUERY_SEARCH":
        response = this.searchQuery(data);
        break;
      case "GET_USER_STOCK_BALANCE":
        response = this.getUserStockBalance(data);
        break;
      default:
        console.log("Unknown request type");
        return;
    }

    if (!response?.eventId || !response?.payload) {
      throw new Error("Invalid response format");
    }

    await this.publishToAPI(response.eventId, response.payload);
  }

  async publishToAPI(eventName: string, message: any) {
    console.log("Publishing:", JSON.stringify(message));
    await this.client.publish(eventName, JSON.stringify(message));
  }

  resolveMarket(
    data: Extract<SubscribeMessageType, { type: "RESOLVE_MARKET" }>
  ) {
    const { marketId, winner } = data.payload;

    if (!marketId || !this.OrderBook[marketId]) {
      return {
        eventId: data.eventId,
        payload: {
          message: "Market not found",
          success: false,
        },
      };
    }

    if (this.Market_Info[marketId]?.isResolved) {
      return {
        eventId: data.eventId,
        payload: {
          message: "Market already resolved",
          success: false,
        },
      };
    }

    const loser = winner === "YES" ? "NO" : "YES";

    this.distributeWinnings(marketId, winner);

    this.cancelAllOrders(marketId);

    this.Market_Info[marketId] = {
      ...this.Market_Info[marketId],
      isResolved: true,
      winner: winner,
    };

    return {
      eventId: data.eventId,
      payload: {
        message: `Market resolved. Winner: ${winner}`,
        success: true,
        winner: winner,
      },
    };
  }

  private distributeWinnings(marketId: string, winner: "YES" | "NO") {
    for (const userId in this.Stock_Balances) {
      const userStocks = this.Stock_Balances[userId]![marketId];
      if (userStocks && userStocks[winner]) {
        const winningShares = userStocks[winner]!;
        const payout = winningShares * 1000;

        if (!this.User_Balances[userId]) {
          this.User_Balances[userId] = { balance: 0, locked: 0 };
        }

        this.User_Balances[userId].balance += payout;
        console.log(
          `Paid ${payout / 100} to user ${userId} for ${winningShares} winning shares`
        );
      }
    }

    // Clear all stock positions for this market
    for (const userId in this.Stock_Balances) {
      if (this.Stock_Balances[userId]![marketId]) {
        delete this.Stock_Balances[userId]![marketId];
      }
    }
  }

  private cancelAllOrders(marketId: string) {
    const market = this.OrderBook[marketId];
    if (!market) return;

    // Cancel all buy and sell orders, refund locked amounts
    for (const side of ["YES", "NO"] as const) {
      for (const orderType of ["BUY", "SELL"] as const) {
        const bookSide = market[side][orderType];

        for (const priceLevel in bookSide.priceLevels) {
          const level = bookSide.priceLevels[priceLevel]!;

          for (const order of level.orders) {
            if (order.userId !== "ADMIN" && order.userId !== "SYSTEM") {
              // Refund locked balance for buy orders
              if (orderType === "BUY") {
                const refund =
                  parseFloat(priceLevel) * order.stock_quantity * 100;
                this.User_Balances[order.userId]!.locked -= refund;
                this.User_Balances[order.userId]!.balance += refund;
              }
            }
          }
        }
      }
    }

    // Clear the orderbook for this market
    delete this.OrderBook[marketId];
  }

  getAllMarkets(
    data: Extract<SubscribeMessageType, { type: "GET_ALL_MARKETS" }>
  ) {
    const markets = Object.keys(this.OrderBook).filter(
      (marketId) => !this.Market_Info[marketId]?.isResolved
    );

    const marketsData = markets.map((market)=>{
        const data = this.Market_Info[market]
        return {
            marketId:market,
            title:data?.title,
            description:data?.description,
            YES:data?.YES,
            NO:data?.NO
        }
    })


    return {
      eventId: data.eventId,
      payload: {
        message:
          markets.length > 0 ? "Active markets found" : "No active markets",
        markets: marketsData,
        count: markets.length,
      },
    };
  }

  searchQuery(data: Extract<SubscribeMessageType, { type: "QUERY_SEARCH" }>) {
    try {
      const { query } = data.payload;
      const markets = Object.keys(this.OrderBook);
      const regex = new RegExp(query, "i");

      const filter = markets.filter((market) => regex.test(market));

      return {
        eventId: data.eventId,
        payload: {
          message: "Fetched query search results",
          success: filter.length > 0,
          data: filter,
        },
      };
    } catch (error) {
      console.log("Error in searching markets with this query " + error);
      return {
        eventId: data.eventId,
        payload: {
          message: "Error in searching market",
          success: false,
        },
      };
    }
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
        payload: { message: "Missing required fields", success: false },
      };
    }

    if (quantity <= 0 || price < 0.5 || price > 9.5) {
      return {
        eventId: data.eventId,
        payload: { message: "Invalid quantity or price", success: false },
      };
    }

    const user = this.User_Balances[userId];
    if (!user) {
      return {
        eventId: data.eventId,
        payload: { message: "User does not exist", success: false },
      };
    }

    if (this.Market_Info[marketId]?.isResolved) {
      return {
        eventId: data.eventId,
        payload: { message: "Market is already resolved", success: false },
      };
    }

    const totalCost = price * quantity * 100;
    if (user.balance < totalCost) {
      return {
        eventId: data.eventId,
        payload: { message: "Insufficient balance", success: false },
      };
    }

    const market = this.OrderBook[marketId];
    if (!market) {
      return {
        eventId: data.eventId,
        payload: { message: "Market does not exist", success: false },
      };
    }

    user.balance -= totalCost;
    user.locked += totalCost;

    const counterSide = market[ticket_type]["SELL"];
    let remainingQuantity = quantity;
    let filledQuantity = 0;
    const fills = [];

    const priceKeys = Object.keys(counterSide.priceLevels)
      .map(Number)
      .sort((a, b) => a - b);

    for (const priceLevel of priceKeys) {
      if (priceLevel <= price && remainingQuantity > 0) {
        const levelData = counterSide.priceLevels[priceLevel]!;

        while (levelData.orders.length > 0 && remainingQuantity > 0) {
          const sellOrder = levelData.orders[0]!;
          const matchQty = Math.min(
            sellOrder.stock_quantity,
            remainingQuantity
          );

          if (sellOrder.userId !== "ADMIN" && sellOrder.userId !== "SYSTEM") {
            const sellerStock =
              this.Stock_Balances[sellOrder.userId]?.[marketId]?.[
                ticket_type
              ] || 0;
            if (sellerStock < matchQty) {
              console.error(
                `Seller ${sellOrder.userId} doesn't have enough stock`
              );
              levelData.orders.shift();
              continue;
            }
          }

          // Execute the trade
          this.executeTrade(
            userId,
            sellOrder.userId,
            marketId,
            ticket_type,
            matchQty,
            priceLevel
          );

          fills.push({ price: priceLevel, quantity: matchQty });
          remainingQuantity -= matchQty;
          filledQuantity += matchQty;
          sellOrder.stock_quantity -= matchQty;

          if (sellOrder.stock_quantity === 0) {
            levelData.orders.shift();
          }

          levelData.totalQty -= matchQty;
          counterSide.totalQty -= matchQty;

          if (levelData.totalQty === 0) {
            delete counterSide.priceLevels[priceLevel];
            break;
          }
        }
      }
    }

    if (remainingQuantity > 0) {
      this.createOppositeOrder(
        marketId,
        ticket_type,
        price,
        remainingQuantity,
        userId
      );
      this.placeOrderOnBook(
        marketId,
        ticket_type,
        price,
        remainingQuantity,
        userId,
        "BUY"
      );

      //this.initializeUserStock(userId, marketId, ticket_type);
      //this.Stock_Balances[userId]![marketId]![ticket_type]! += remainingQuantity;
    }

    const unusedAmount = remainingQuantity * price * 100;
    user.locked -= unusedAmount;
    user.balance += unusedAmount;

    this.broadcastMarketUpdate(marketId);

    return {
      eventId: data.eventId,
      payload: {
        message: "Buy order processed",
        success: true,
        filledQuantity,
        remainingQuantity,
        fills,
      },
    };
  }

  async handleSellOrder(data: Extract<SubscribeMessageType, { type: "SELL" }>) {
    const { userId, ticket_type, order_type, quantity, price, marketId } =
      data.payload;

    if (!userId || !ticket_type || !quantity || !price || !marketId) {
      return {
        eventId: data.eventId,
        payload: { message: "Missing required fields", success: false },
      };
    }

    if (quantity <= 0 || price <= 0 || price > 10) {
      return {
        eventId: data.eventId,
        payload: { message: "Invalid quantity or price", success: false },
      };
    }

    if (this.Market_Info[marketId]?.isResolved) {
      return {
        eventId: data.eventId,
        payload: { message: "Market is already resolved", success: false },
      };
    }

    const userStock =
      this.Stock_Balances[userId]?.[marketId]?.[ticket_type] || 0;
    if (userStock < quantity) {
      return {
        eventId: data.eventId,
        payload: { message: "Insufficient stock balance", success: false },
      };
    }

    const market = this.OrderBook[marketId];
    if (!market) {
      return {
        eventId: data.eventId,
        payload: { message: "Market does not exist", success: false },
      };
    }

    // this.Stock_Balances[userId]![marketId]![ticket_type]! -= quantity;

    const counterSide = market[ticket_type]["BUY"];
    let remainingQuantity = quantity;
    let filledQuantity = 0;
    const fills = [];

    // Match against existing buy orders (highest price first)
    const priceKeys = Object.keys(counterSide.priceLevels)
      .map(Number)
      .sort((a, b) => b - a);

    for (const priceLevel of priceKeys) {
      if (priceLevel >= price && remainingQuantity > 0) {
        const levelData = counterSide.priceLevels[priceLevel]!;

        while (levelData.orders.length > 0 && remainingQuantity > 0) {
          const buyOrder = levelData.orders[0]!;
          const matchQty = Math.min(buyOrder.stock_quantity, remainingQuantity);

          this.executeTrade(
            buyOrder.userId,
            userId,
            marketId,
            ticket_type,
            matchQty,
            priceLevel
          );

          fills.push({ price: priceLevel, quantity: matchQty });
          remainingQuantity -= matchQty;
          filledQuantity += matchQty;
          buyOrder.stock_quantity -= matchQty;

          if (buyOrder.stock_quantity === 0) {
            levelData.orders.shift();
          }

          levelData.totalQty -= matchQty;
          counterSide.totalQty -= matchQty;

          if (levelData.totalQty === 0) {
            delete counterSide.priceLevels[priceLevel];
            break;
          }
        }
      }
    }

    if (remainingQuantity > 0) {
      // this.Stock_Balances[userId]![marketId]![ticket_type]! -= remainingQuantity;

      this.createOppositeOrder(
        marketId,
        ticket_type,
        price,
        remainingQuantity,
        userId,
        "SELL"
      );
      this.placeOrderOnBook(
        marketId,
        ticket_type,
        price,
        remainingQuantity,
        userId,
        "SELL"
      );

      // Add proceeds to user's balance
      // const proceeds = price * remainingQuantity * 100;
      // this.User_Balances[userId]!.balance += proceeds;
    }

    this.broadcastMarketUpdate(marketId);

    return {
      eventId: data.eventId,
      payload: {
        message: "Sell order processed",
        success: true,
        filledQuantity,
        remainingQuantity,
        fills,
      },
    };
  }

  private executeTrade(
    buyerId: string,
    sellerId: string,
    marketId: string,
    ticketType: "YES" | "NO",
    quantity: number,
    price: number
  ) {
    const tradeValue = price * quantity * 100;

    this.initializeUserStock(buyerId, marketId, ticketType);
    this.Stock_Balances[buyerId]![marketId]![ticketType]! += quantity;

    if (sellerId !== "ADMIN" && sellerId !== "SYSTEM") {
      this.initializeUserStock(sellerId, marketId, ticketType);
      this.Stock_Balances[sellerId]![marketId]![ticketType]! -= quantity;
      if (this.Stock_Balances[sellerId]![marketId]![ticketType] == 0) {
        delete this.Stock_Balances[sellerId]![marketId]![ticketType];
        if (
          this.Stock_Balances[sellerId]![marketId]! &&
          Object.keys(this.Stock_Balances[sellerId]![marketId]!).length == 0
        ) {
          delete this.Stock_Balances[sellerId]![marketId];
        }
      }
    }

    if (!this.User_Balances[sellerId]) {
      this.User_Balances[sellerId] = { balance: 0, locked: 0 };
    }
    this.User_Balances[sellerId].balance += tradeValue;

    // Update buyer's locked balance (if not ADMIN/SYSTEM)
    if (buyerId !== "ADMIN" && buyerId !== "SYSTEM") {
      this.User_Balances[buyerId]!.locked -= tradeValue;
    }

    console.log(
      `Trade executed: ${buyerId} bought ${quantity} ${ticketType} at ${price} from ${sellerId}`
    );
  }

  private createOppositeOrder(
    marketId: string,
    ticketType: "YES" | "NO",
    price: number,
    quantity: number,
    userId: string,
    originalSide: "BUY" | "SELL" = "BUY"
  ) {
    const oppositeSide = ticketType === "YES" ? "NO" : "YES";
    const oppositePrice = 10 - price;
    const oppositeOrderType = originalSide === "BUY" ? "SELL" : "BUY";

    if (!this.OrderBook[marketId]) {
      return;
    }

    const targetBook =
      this.OrderBook[marketId][oppositeSide][oppositeOrderType];

    if (!targetBook.priceLevels[oppositePrice]) {
      targetBook.priceLevels[oppositePrice] = {
        totalQty: 0,
        orders: [],
      };
    }

    targetBook.priceLevels[oppositePrice].orders.push({
      userId: "SYSTEM",
      stock_quantity: quantity,
    });

    targetBook.priceLevels[oppositePrice].totalQty += quantity;
    targetBook.totalQty += quantity;
    console.log(
      `Created opposite order: ${oppositeOrderType} ${oppositeSide} at ₹${oppositePrice} for ${quantity} shares`
    );
  }

  private placeOrderOnBook(
    marketId: string,
    ticketType: "YES" | "NO",
    price: number,
    quantity: number,
    userId: string,
    side: "BUY" | "SELL"
  ) {
    const targetBook = this.OrderBook[marketId]![ticketType][side];

    if (!targetBook.priceLevels[price]) {
      targetBook.priceLevels[price] = {
        totalQty: 0,
        orders: [],
      };
    }

    targetBook.priceLevels[price].orders.push({
      userId: userId,
      stock_quantity: quantity,
    });

    targetBook.priceLevels[price].totalQty += quantity;
    targetBook.totalQty += quantity;
  }

  private initializeUserStock(
    userId: string,
    marketId: string,
    ticketType: "YES" | "NO"
  ) {
    if (!this.Stock_Balances[userId]) {
      this.Stock_Balances[userId] = {};
    }
    if (!this.Stock_Balances[userId][marketId]) {
      this.Stock_Balances[userId][marketId] = {};
    }
    if (!this.Stock_Balances[userId][marketId][ticketType]) {
      this.Stock_Balances[userId][marketId][ticketType] = 0;
    }
  }

  private broadcastMarketUpdate(marketId: string) {
    const market = this.OrderBook[marketId];
    if (!market) return;

    const sellsideYes = { ...market.YES.SELL.priceLevels };
    const sellsideNo = { ...market.NO.SELL.priceLevels };

    this.sendSocket({
      type: "MARKET_UPDATE",
      payload: {
        marketId: marketId,
        orderBook: {
          Yes: cleanOrderbook(sellsideYes),
          No: cleanOrderbook(sellsideNo),
        },
      },
    });
  }

  createNewMarket(
    data: Extract<SubscribeMessageType, { type: "CREATE_MARKET" }>
  ) {
    const { marketId, title, description } = data.payload;

    if (!marketId) {
      return {
        eventId: data.eventId,
        payload: { message: "Missing marketId", success: false },
      };
    }

    if (this.OrderBook[marketId]) {
      return {
        eventId: data.eventId,
        payload: { message: "Market already exists", success: false },
      };
    }

    // Create orderbook structure
    this.OrderBook[marketId] = {
      YES: {
        BUY: {
          totalQty: 100,
          priceLevels: {
            "4.5": {
              totalQty: 100,
              orders: [{ userId: "ADMIN", stock_quantity: 100 }],
            },
          },
        },
        SELL: {
          totalQty: 100,
          priceLevels: {
            "5": {
              totalQty: 100,
              orders: [{ userId: "ADMIN", stock_quantity: 100 }],
            },
          },
        },
      },
      NO: {
        BUY: {
          totalQty: 100,
          priceLevels: {
            "4.5": {
              totalQty: 100,
              orders: [{ userId: "ADMIN", stock_quantity: 100 }],
            },
          },
        },
        SELL: {
          totalQty: 100,
          priceLevels: {
            "5": {
              totalQty: 100,
              orders: [{ userId: "ADMIN", stock_quantity: 100 }],
            },
          },
        },
      },
    };

    // Initialize admin stock balance
    if (!this.Stock_Balances["ADMIN"]) {
      this.Stock_Balances["ADMIN"] = {};
    }
    this.Stock_Balances["ADMIN"][marketId] = { YES: 100, NO: 100 };

    // Store market info
    this.Market_Info[marketId] = {
      title: title || "New Market",
      description: description || "New prediction market",
      YES: 5,
      NO: 5,
      isResolved: false,
      winner: undefined,
    };

    this.sendSocket({
      type: "NEW_MARKET",
      payload: { marketId: marketId },
    });

    return {
      eventId: data.eventId,
      payload: { message: "Market created successfully", success: true },
    };
  }

  getMarketOrderBook(
    data: Extract<SubscribeMessageType, { type: "GET_MARKET_ORDERBOOK" }>
  ) {
    const { marketId } = data.payload;

    if (!marketId || !this.OrderBook[marketId]) {
      return {
        eventId: data.eventId,
        payload: { message: "Market not found", success: false },
      };
    }

    const market = this.OrderBook[marketId];
    const sellsideYes = { ...market.YES.SELL.priceLevels };
    const sellsideNo = { ...market.NO.SELL.priceLevels };

    return {
      eventId: data.eventId,
      payload: {
        message: "OrderBook retrieved successfully",
        success: true,
        data: {
          Yes: cleanOrderbook(sellsideYes),
          No: cleanOrderbook(sellsideNo),
        },
      },
    };
  }

  createNewUser(data: Extract<SubscribeMessageType, { type: "CREATE_USER" }>) {
    const { userId } = data.payload;

    if (!userId) {
      return {
        eventId: data.eventId,
        payload: { message: "Invalid user ID", success: false },
      };
    }

    if (this.User_Balances[userId]) {
      return {
        eventId: data.eventId,
        payload: { message: "User already exists", success: false },
      };
    }

    this.User_Balances[userId] = { balance: 2000, locked: 0 };
    this.Stock_Balances[userId] = {};

    return {
      eventId: data.eventId,
      payload: {
        message: "User created successfully",
        success: true,
        balance: this.User_Balances[userId].balance / 100,
      },
    };
  }

  getUserBalance(
    data: Extract<SubscribeMessageType, { type: "GET_USER_BALANCE" }>
  ) {
    const { userId } = data.payload;

    if (!userId) {
      return {
        eventId: data.eventId,
        payload: { message: "Invalid user ID", success: false },
      };
    }

    const user = this.User_Balances[userId];
    if (!user) {
      return {
        eventId: data.eventId,
        payload: { message: "User not found", success: false },
      };
    }

    return {
      eventId: data.eventId,
      payload: {
        message: "Balance retrieved successfully",
        success: true,
        balance: user.balance / 100,
        locked: user.locked / 100,
      },
    };
  }

  getUserStockBalance(
    data: Extract<SubscribeMessageType, { type: "GET_USER_STOCK_BALANCE" }>
  ) {
    const { userId } = data.payload;

    if (!userId) {
      return {
        eventId: data.eventId,
        payload: { message: "Invalid user ID", success: false },
      };
    }

    const userStocks = this.Stock_Balances[userId];
    if (!userStocks) {
      return {
        eventId: data.eventId,
        payload: { message: "User not found", success: false },
      };
    }

    return {
      eventId: data.eventId,
      payload: {
        message: "Stock balance retrieved successfully",
        success: true,
        stock_balances: userStocks,
      },
    };
  }
}

function cleanOrderbook(priceLevels: Record<number, PriceLevel>): any {
  return Object.entries(priceLevels)
    .map(([price, data]) => ({
      price: parseFloat(price),
      totalQty: data.totalQty,
    }))
    .sort((a, b) => a.price - b.price)
    .slice(0, 10); // Show more levels for better UX
}
