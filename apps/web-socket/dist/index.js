"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisManager = void 0;
const client_1 = require("@redis/client");
class RedisManager {
    constructor() {
        this.redisClient = (0, client_1.createClient)();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new RedisManager();
        }
        return this.instance;
    }
    subscribeToMarket(marketId) {
        this.redisClient.subscribe(marketId, (data) => {
            console.log(data);
        });
    }
    unsubscribeToMarket(marketId) {
        this.redisClient.unsubscribe(marketId, () => {
            console.log("market unsubed");
        });
    }
}
exports.RedisManager = RedisManager;
/*
1) add the logic of how web socket will work [ main index calls web socket to start -> web socket uses
 redisclient to call sub and unsub to new market ( only when new market event comes or delete market/resolve market )
 
 -> thne what is recieved from the sub is then emmitted out to the WS listening ]


 2) test it on the frontend

 3) simulate a test where infinte loop runs that nodejs thread make request to the backend to simulate

 4) also add the admin logic to make markets and also then resolve


*/ 
