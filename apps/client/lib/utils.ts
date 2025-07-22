import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import CredentialsProvider from "next-auth/providers/credentials";
import z from 'zod/v4'
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


import axios from "axios";
import { LimitOrderRequest } from "@repo/common";
import { RedisManager } from "./redis";
import { randomUUID } from "crypto";
import { AuthOptions, SessionStrategy } from "next-auth";

export const fetchAllMarkets = async () => {
  const response = await axios.get("http://localhost:3000/api/market")
  return response.data.markets;
}

export const addnewMarket = async (marketName:string)=>{
  const response = await axios.post(`http://localhost:3000/api/market`,{
    
      marketId:marketName

  })
  return response.data
}

export const orderRequest = async(data:LimitOrderRequest)=>{
  console.log("data ++ ++++ ++"+JSON.stringify(data))
  const response = await axios.post(`http://localhost:3000/api/order`,{
    ...data
  })

  console.log(JSON.stringify(response.data))

  return response.data
}

export const getUserData= async(name:string)=>{
  const response = await axios.get("http://localhost:3000/api/user/"+name);
  console.log(JSON.stringify(response.data));

  return response.data
}

const userSignUpSchema = z.object({
  username:z.string({message:"Username not provided"}),
  password:z.string().min(6).max(32,{message:"Password not correct"})
})


export const authOptions : AuthOptions ={
  providers :[ 
    CredentialsProvider({
      name : 'CredentialProvider',
      credentials:{
        username: { label:"username",type:"text"},
        password : { label:"password",type:"password"}
      },
      async authorize(credentials){
        console.log("here");

        const validInputs = userSignUpSchema.safeParse(credentials)

        if(!validInputs.success){
          console.log("krsna")
          return null
        }

        const { username , password } = validInputs.data

        const redisclient = RedisManager.getInstance()

        const uniqueId = randomUUID();

        const promise = redisclient.subscribeToEvent(uniqueId)

        await redisclient.pushToEngine({userId:username},'CREATE_USER',uniqueId)

        const response = await promise

        if(!response.success){
          return null
        }

        console.log("responssee")

        return {id:'divu',name:'divu'}
      }
    })
  ],
  secret:process.env.NEXTAUTH_SECRET,
  session:{
    strategy:'jwt' as SessionStrategy
  },
  callbacks:{
    async jwt({token,user}:any){
      console.log(JSON.stringify(token) + "------"+JSON.stringify(user)+"tokeeee")
      if(user){
        console.log("here1")
        token.id= user.id
        token.name= user.name
      }
      console.log(JSON.stringify(token))
      return token
    },
    async session({session,token}:any){
      console.log(JSON.stringify(session) + "------"+JSON.stringify(token)+"sess")

      session.user.id = token.id
      session.user.name = token.name
      return session
    }
  }
}