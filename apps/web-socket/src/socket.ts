import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { MessageRecieved } from "@repo/common";
const wss = new WebSocketServer({ port: 4000 });

const GlobalUsers = new Map<WebSocket, string[]>();

type Markets = Record<string, WebSocket[]>;

// so why 2 global , pretty simple one to keep track which market events come and based on the user id
// can simple get the web socket to send message or market info

const GlobalMarkets: Markets = {};

const checkAuth = (wsurl: string): boolean => {
  try {
    const url = wsurl?.split("?");

    const params = new URLSearchParams(url![1]);

    const token = params.get("token");

    if (!token) {
      return false;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET ?? "mysupersecretpassword"
    );

    if (!decoded) {
      return false;
    }

    return true;

    return true;
  } catch (error) {
    console.log(error + " error in authentication");
    return false;
  }
};

wss.on("connection", async (ws, req) => {
  if (!GlobalUsers.has(ws)) GlobalUsers.set(ws, []);

  ws.on("message", (data) => {
    const response = JSON.parse(data.toString());
    console.log(response);

    handleMessageRecieved(response, ws);
  });

  ws.on('close',()=>{
    const subMarket = GlobalUsers.get(ws);
    GlobalUsers.delete(ws);

    subMarket?.forEach((market)=>{
        const newlist =GlobalMarkets[market].filter((socket)=>socket!=ws);
        GlobalMarkets[market] = newlist
    })
  })
});

const handleMessageRecieved = (response: MessageRecieved, ws: WebSocket) => {
  try {
    switch (response.type) {
      case "SUBSCRIBE_MARKET":
        handleSubscriptionRequest(response.payload, ws);
        break;
      case "UNSUBSCRIBE_MARKET":
        handleUnSubscriptionRequest(response.payload, ws);
        break;

      case "NEW_MARKET":
        handleNewMarket(response.payload, ws);
        break;

      case "MARKET_UPDATE":
        handleMarketUpdate(response.payload,ws);
        break;

      default:
        console.log("request did not match " + JSON.stringify(response));
    }
  } catch (error) {
    console.log(error);
  }
};

const handleSubscriptionRequest = (
  payload: Extract<MessageRecieved, { type: "SUBSCRIBE_MARKET" }>["payload"],
  ws: WebSocket
) => {
  try {
    const marketId = payload.marketId;

    if (!GlobalMarkets[marketId]) {
      return;
    }

    const socketMarket = GlobalUsers.get(ws);
    if (socketMarket?.includes(marketId)) {
      return;
    }

    socketMarket?.push(marketId);

    GlobalMarkets[marketId].push(ws);

    return;
  } catch (error) {
    console.log("error in subscription handler " + error);
  }
};

const handleUnSubscriptionRequest = (
  payload: Extract<MessageRecieved, { type: "UNSUBSCRIBE_MARKET" }>["payload"],
  ws: WebSocket
) => {
  try {
    const marketId = payload.marketId;

    if (!GlobalMarkets[marketId]) {
      ws.close();
      return;
    }

    const socketMarket = GlobalUsers.get(ws)?.filter(
      (market) => market !== marketId
    )!;

    GlobalUsers.set(ws, socketMarket);

    const newlist = GlobalMarkets[marketId].filter((socket) => socket != ws);
    GlobalMarkets[marketId] = newlist;

    return;
  } catch (error) {
    console.log("error in unsubscription handler " + error);
  }
};

const handleNewMarket = (
  payload: Extract<MessageRecieved, { type: "NEW_MARKET" }>["payload"],
  ws: WebSocket
) => {
  try {
    const {  marketId } = payload;

    if(GlobalMarkets[marketId]){
      console.log("already listening to");
      return
    }

    GlobalMarkets[marketId]= []
    console.log("Market added successfully "+marketId);


    return;
  } catch (error) {
    console.log("error in market creation " + error);
  }
};


const handleMarketUpdate = (response:Extract <MessageRecieved,{type:"MARKET_UPDATE"}>["payload"],ws:WebSocket)=>{
  try {
    const {marketId,orderBook} = response;

    const marketExist = GlobalMarkets[marketId];

    if(!marketExist){
      console.log("market is not created before critical error ");
      return 
    }

    marketExist.forEach((ws)=>{
      ws.send(JSON.stringify(orderBook));
    })

    console.log("sent updates to all socket connection")

    return;

    
  } catch (error) {
    console.log("Error in updating market "+error)
  }
}
