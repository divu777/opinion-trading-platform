import e from 'express'
import cors from 'cors'
import { Manager } from './redis/index';
import './bots';
import { getmarkets } from './bots';


const app=e();
const PORT = process.env.PORT ?? 8085
console.log( typeof PORT)
app.use(e.json());
app.use(cors());





const redisInstance =Manager.getInstance();

redisInstance.listenForOrders().catch((err)=>{
    console.log("Error in listening for orders " + err);
})


// setInterval(getmarkets,15000)




app.get("/",(req,res)=>{
     res.send("Hmmm.....trading karne hai tereko");
})


app.post("/ping",(req,res)=>{
    res.status(200).json({
        message:"Thanks for pinging and to check if server is alive"
    })
})


app.listen(PORT,()=>{
    console.log("app is listening on port "+ PORT);
})



