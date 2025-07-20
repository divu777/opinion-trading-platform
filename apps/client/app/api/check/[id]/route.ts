import { NextRequest, NextResponse } from "next/server";

export const GET = (_:NextRequest,{params}:{params:{id:string}})=>{
    return NextResponse.json({idwalal:params.id});
}