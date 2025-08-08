import { NextRequest, NextResponse } from "next/server";

export const POST  =async(req:NextRequest,{params}:{params:Promise<{marketId:string}>})=>{
    const marketId = (await params).marketId
    try {
        console.log(marketId)
        return NextResponse.json({
            marketId
        })
        
    } catch (error) {
        console.log("Error in resolving market"+marketId + " : "+error);
        return NextResponse.json({
            message:"Error in resolving market",
            success:false
        })
    }
}   