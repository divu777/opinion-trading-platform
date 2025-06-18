import ws, { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken'
const wss = new WebSocketServer({port:4000});

type User={
    ws:WebSocket,
    markets :string[] // basically contains all users market currently watching 
}

type Users=Record<string,User>

const GlobalUsers = {}

type Markets = Record<string , string[]>

// so why 2 global , pretty simple one to keep track which market events come and based on the user id 
// can simple get the web socket to send message or market info

const GlobalMarkets = {}


const handleConnectType = (ws:WebSocket,obj:any)=>{

}


const checkAuth = (wsurl:string):boolean=>{
    try {
        
    
 const url = wsurl?.split("?")

    const params = new URLSearchParams(url![1]);

    const token = params.get('token')

    if(!token){
        return false;
    }
    

    const decoded =  jwt.verify(token,process.env.JWT_SECRET??"mysupersecretpassword")

    if(!decoded){
        return false
    }

    return true

    return true;
    } catch (error) {
        return false;
    }
    }

wss.on('connection',async(ws,req)=>{
   
    const isvalid =  checkAuth(req.url!)

    
    ws.on('message',(data)=>{
        const response = JSON.parse(data.toString());
        console.log(response);
        
    })
})