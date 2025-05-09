import axios from "axios";

const BASE_URL = "http://localhost:8080/api/v1/order";
const USERS = Array.from({ length: 50 }, (_, i) => (i + 1).toString());
const OUTCOME = "YES"; // could be YES or NO

const rand = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]!;
const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const simulateOrder = async () => {
  const userId = rand(USERS);
  const order_type = rand(["BUY", "SELL"]);
  const ticket_type = OUTCOME;
  const quantity = randInt(1, 50);
  const isLimit = Math.random() < 0.7;

  try {
    if (isLimit) {
      const price = randInt(1, 10);
      const res = await axios.post(`${BASE_URL}/limitOrder`, {
        userId,
        order_type,
        ticket_type,
        quantity,
        price,
      });
      if (res.data.filledQuantity || res.data.fills?.length) {
        console.log(`[LIMIT ${order_type}]`, res.data.message);
      }
    } else {
      const res = await axios.post(`${BASE_URL}/marketOrder`, {
        userId,
        order_type,
        ticket_type,
        quantity,
      });
      if (res.data.filledQuantity || res.data.fills?.length) {
        console.log(`[MARKET ${order_type}]`, res.data.message);
      }
    }
  } catch (err: any) {
    console.error(`[ERROR ${order_type}]`, err.response?.data?.message || err.message);
  }
};

const simulateMarket = async (count = 1000) => {
  console.log("📊 Starting market simulation...");

  for (let i = 0; i < count; i++) {
    await simulateOrder();
    // Optional: Delay to mimic real-world timing
    // await new Promise((r) => setTimeout(r, 10));
  }

  // Final order book snapshot
  try {
    const res = await axios.get(`${BASE_URL}/order-book/${OUTCOME}`);
    console.log("\n📘 Final Order Book:");
    console.log(JSON.stringify(res.data.orderBook, null, 2));
  } catch (err: any) {
    console.error("Failed to fetch order book", err.message);
  }
};

simulateMarket(500);
