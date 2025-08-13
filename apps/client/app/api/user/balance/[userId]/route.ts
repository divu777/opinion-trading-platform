import { RedisManager } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const userId = (await params).userId;

  if (!userId) {
    return NextResponse.json({
      message: "user id not valid",
    });
  }

  const redisclient = RedisManager.getInstance();
       await redisclient.init()


  // const eventId = await redisclient.pushToEngine({userId},"GET_USER_STOCK_BALANCE");

  // const response = await redisclient.subscribeToEvent(eventId);

  const uniqueId = randomUUID();
  const promise = redisclient.subscribeToEvent(uniqueId);
  const eventId = await redisclient.pushToEngine(
    { userId },
    "GET_USER_STOCK_BALANCE",
    uniqueId
  );

  const response = await promise;

  return NextResponse.json(response);
}
