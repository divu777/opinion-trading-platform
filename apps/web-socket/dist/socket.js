"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const wss = new ws_1.WebSocketServer({ port: 4000 });
const GlobalUsers = new Map();
// so why 2 global , pretty simple one to keep track which market events come and based on the user id
// can simple get the web socket to send message or market info
const GlobalMarkets = {};
const checkAuth = (wsurl) => {
    var _a;
    try {
        const url = wsurl === null || wsurl === void 0 ? void 0 : wsurl.split("?");
        const params = new URLSearchParams(url[1]);
        const token = params.get("token");
        if (!token) {
            return false;
        }
        const decoded = jsonwebtoken_1.default.verify(token, (_a = process.env.JWT_SECRET) !== null && _a !== void 0 ? _a : "mysupersecretpassword");
        if (!decoded) {
            return false;
        }
        return true;
        return true;
    }
    catch (error) {
        console.log(error + " error in authentication");
        return false;
    }
};
wss.on("connection", (ws, req) => __awaiter(void 0, void 0, void 0, function* () {
    if (!GlobalUsers.has(ws))
        GlobalUsers.set(ws, []);
    ws.on("message", (data) => {
        const response = JSON.parse(data.toString());
        console.log(response);
        handleMessageRecieved(response, ws);
    });
    ws.on('close', () => {
        const subMarket = GlobalUsers.get(ws);
        GlobalUsers.delete(ws);
        subMarket === null || subMarket === void 0 ? void 0 : subMarket.forEach((market) => {
            const newlist = GlobalMarkets[market].filter((socket) => socket != ws);
            GlobalMarkets[market] = newlist;
        });
    });
}));
const handleMessageRecieved = (response, ws) => {
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
                handleMarketUpdate(response.payload, ws);
                break;
            default:
                console.log("request did not match " + JSON.stringify(response));
        }
    }
    catch (error) {
        console.log(error);
    }
};
const handleSubscriptionRequest = (payload, ws) => {
    try {
        const marketId = payload.marketId;
        if (!GlobalMarkets[marketId]) {
            return;
        }
        const socketMarket = GlobalUsers.get(ws);
        if (socketMarket === null || socketMarket === void 0 ? void 0 : socketMarket.includes(marketId)) {
            return;
        }
        socketMarket === null || socketMarket === void 0 ? void 0 : socketMarket.push(marketId);
        GlobalMarkets[marketId].push(ws);
        return;
    }
    catch (error) {
        console.log("error in subscription handler " + error);
    }
};
const handleUnSubscriptionRequest = (payload, ws) => {
    var _a;
    try {
        const marketId = payload.marketId;
        if (!GlobalMarkets[marketId]) {
            ws.close();
            return;
        }
        const socketMarket = (_a = GlobalUsers.get(ws)) === null || _a === void 0 ? void 0 : _a.filter((market) => market !== marketId);
        GlobalUsers.set(ws, socketMarket);
        const newlist = GlobalMarkets[marketId].filter((socket) => socket != ws);
        GlobalMarkets[marketId] = newlist;
        return;
    }
    catch (error) {
        console.log("error in unsubscription handler " + error);
    }
};
const handleNewMarket = (payload, ws) => {
    try {
        const { marketId } = payload;
        if (GlobalMarkets[marketId]) {
            console.log("already listening to");
            return;
        }
        GlobalMarkets[marketId] = [];
        console.log("Market added successfully " + marketId);
        return;
    }
    catch (error) {
        console.log("error in market creation " + error);
    }
};
const handleMarketUpdate = (response, ws) => {
    try {
        const { marketId, orderBook } = response;
        const marketExist = GlobalMarkets[marketId];
        if (!marketExist) {
            console.log("market is not created before critical error ");
            return;
        }
        marketExist.forEach((ws) => {
            ws.send(JSON.stringify(orderBook));
        });
        console.log("sent updates to all socket connection");
        return;
    }
    catch (error) {
        console.log("Error in updating market " + error);
    }
};
