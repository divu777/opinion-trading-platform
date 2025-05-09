import e from "express";
const orderRoute = e.Router();

//user type

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

type Market = {
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
type OrderBookSystem=Record<string,Market>
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

type MarketOrderRequest = {
  userId: string;
  ticket_type: "YES" | "NO";
  order_type: "BUY" | "SELL";
  quantity: number;
};

type LimitOrderRequest = {
  userId: string;
  ticket_type: "YES" | "NO";
  order_type: "BUY" | "SELL";
  quantity: number;
  price: number;
};

orderRoute.post("/marketOrder", (req, res) => {
  // eg YES , BUY , 10
  let { userId, ticket_type, order_type, quantity }: MarketOrderRequest =
    req.body;

  if (!userId || !ticket_type || !order_type || !quantity) {
    return res.status(400).json({
      message: "Missing required fields",
      success: false,
    });
  }

  if (quantity <= 0) {
    return res.status(400).json({
      message: "Quantity must be positive",
      success: false,
    });
  }

  const counterAction = order_type == "BUY" ? "SELL" : "BUY";
  const counterSide = orderBook[ticket_type][counterAction];

  try {
    // check do we even have totalorders more than quantity = liquidity in market
    if (counterSide.totalPriceQty < quantity) {
      return res.status(400).json({
        message: "Market order could not be fulfilled (insufficient liquidity)",
        success: false,
      });
    }

    let remainingQuantity = quantity;
    let filledQuantity = 0;
    const fills = [];

    for (
      let i = 0;
      i < counterSide.priceLevels.length && remainingQuantity > 0;
      i++
    ) {
      const priceLevel = counterSide.priceLevels[i]!;
      const orders = priceLevel!.orders;

      let priceLevelFillQuantity = 0;

      for (let j = 0; j < orders.length && remainingQuantity > 0; j++) {
        const order = orders[j]!;

        if (order.stock_quantity <= remainingQuantity) {
          // full fill the whole Order entry and gets deleted in the end
          const fillAmount = order.stock_quantity;
          remainingQuantity -= fillAmount;
          filledQuantity += fillAmount;

          priceLevelFillQuantity += fillAmount;
          orders.splice(j, 1);
          j--;
        } else {
          // partial removed from the table price list 
          const fillAmount = remainingQuantity;
          order!.stock_quantity -= fillAmount;
          filledQuantity += fillAmount;

          priceLevelFillQuantity += fillAmount;
          remainingQuantity = 0;
        }

      }

      if (priceLevelFillQuantity > 0) {
         priceLevel.totalQty -= priceLevelFillQuantity;
        counterSide.totalPriceQty -= priceLevelFillQuantity;
        fills.push({
          price: priceLevel.price,
          quantity: priceLevelFillQuantity,
        });
      }

      if (priceLevel.totalQty === 0) {
        counterSide.priceLevels.splice(i, 1);
        i--;
      }
    }

    return res.status(200).json({
      message: "Market order fully filled",
      success: true,
      filledQuantity,
      remainingQuantity,
      fills,
    });
  } catch (error) {
    console.log(error + " error in making market order");
    return res.status(500).json({
      message: "Error processing market order",
      success: false,
    });
  }
});

orderRoute.post("/limitOrder", (req, res) => {
  try {
    const { userId } = req.body;
    const { order_type, ticket_type, quantity, price }: LimitOrderRequest =
      req.body;

    if (!userId || !ticket_type || !order_type || !quantity || !price) {
      return res.status(400).json({
        message: "Missing required fields",
        success: false,
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        message: "Quantity must be positive",
        success: false,
      });
    }

    if (price <= 0 || price > 10) {
      return res.status(400).json({
        message: "Price must be between 0 and 10",
        success: false,
      });
    }

    const counterAction = order_type === "BUY" ? "SELL" : "BUY";
    const counterSide = orderBook[ticket_type][counterAction];

    let remainingQuantity = quantity;
    let filledQuantity = 0;
    const fills = [];

    counterSide.priceLevels.sort((a, b) => {
      return order_type === "BUY"
        ? a.price - b.price // Ascending for matching buy orders against sell book
        : b.price - a.price; // Descending for matching sell orders against buy book
    });

    for (
      let i = 0;
      i < counterSide.priceLevels.length && remainingQuantity > 0;
      i++
    ) {
      const priceLevel = counterSide.priceLevels[i]!;

      // Check if price is acceptable for matching
      const isPriceAcceptable =
        order_type === "BUY"
          ? priceLevel.price <= price // For BUY orders, only match with SELL orders at or below our price
          : priceLevel.price >= price; // For SELL orders, only match with BUY orders at or above our price

      if (!isPriceAcceptable) {
        continue; // Skip this price level if not acceptable
      }

      const orders = priceLevel.orders;
      // made to subtract value from the upper total count in the object tree , tbh i had better name but GPT said naah fam
      let priceLevelFillQuantity = 0;

      for (let j = 0; j < orders.length && remainingQuantity > 0; j++) {
        const order = orders[j]!;

        if (order.stock_quantity <= remainingQuantity) {
          // Full fill of this order
          const fillAmount = order.stock_quantity;
          remainingQuantity -= fillAmount;
          filledQuantity += fillAmount;
          priceLevelFillQuantity += fillAmount;
          orders.splice(j, 1);
          j--;
        } else {
          // Partial fill of this order
          order.stock_quantity -= remainingQuantity;
          priceLevelFillQuantity += remainingQuantity;
          filledQuantity += remainingQuantity;
          remainingQuantity = 0;
        }
      }

      if (priceLevelFillQuantity > 0) {
        priceLevel.totalQty -= priceLevelFillQuantity;
        counterSide.totalPriceQty -= priceLevelFillQuantity;

        fills.push({
          price: priceLevel.price,
          quantity: priceLevelFillQuantity,
        });
      }

      // Remove empty price levels
      if (priceLevel.totalQty === 0) {
        counterSide.priceLevels.splice(i, 1);
        i--;
      }
    }
    if (remainingQuantity > 0) {
      const orderSide = orderBook[ticket_type][order_type];
      let priceLevel = orderSide.priceLevels.find(
        (level) => level.price === price
      );

      if (!priceLevel) {
        priceLevel = {
          price: price,
          totalQty: 0,
          orders: [],
        };
        orderSide.priceLevels.push(priceLevel);

        // Sort price levels for display (BUY side descending, SELL side ascending)
        orderSide.priceLevels.sort((a, b) => {
          return order_type === "BUY"
            ? b.price - a.price // Descending for BUY
            : a.price - b.price; // Ascending for SELL
        });
      }

      // Add the new order
      priceLevel.orders.push({
        userId,
        stock_quantity: remainingQuantity,
      });

      // Update counters
      priceLevel.totalQty += remainingQuantity;
      orderSide.totalPriceQty += remainingQuantity;
    }

    return res.status(200).json({
      message:
        filledQuantity > 0
          ? `Limit order partially filled: ${filledQuantity} filled, ${remainingQuantity} placed on book`
          : `Limit order placed on book: ${remainingQuantity} units at ${price}`,
      success: true,
      filledQuantity,
      remainingQuantity,
      fills,
    });
  } catch (error) {
    console.error("Error processing limit order:", error);
    return res.status(500).json({
      message: "Error processing limit order",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get current order book state
orderRoute.get("/order-book/:outcome", (req, res) => {
  try {
    const outcome = req.params.outcome as "YES" | "NO";

    if (outcome !== "YES" && outcome !== "NO") {
      return res.status(400).json({
        message: "Invalid outcome parameter. Must be 'YES' or 'NO'",
        success: false,
      });
    }

    return res.status(200).json({
      success: true,
      orderBook: {
        outcome,
        bids: orderBook[outcome].BUY.priceLevels.map((level) => ({
          price: level.price,
          quantity: level.totalQty,
        })),
        asks: orderBook[outcome].SELL.priceLevels.map((level) => ({
          price: level.price,
          quantity: level.totalQty,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching order book:", error);
    return res.status(500).json({
      message: "Error fetching order book",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default orderRoute;
