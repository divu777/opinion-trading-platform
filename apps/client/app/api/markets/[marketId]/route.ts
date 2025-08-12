import { RedisManager } from "@/lib/redis";
import { QueryMarketSchema, StartMarketSchema } from "@repo/common";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ marketId: string }> }
) {
  const marketId = (await params).marketId;
  console.log(marketId + "mrrr");

  if (marketId.startsWith("search-")) {
    const query = marketId.split("search-")[1];

    const validInput = QueryMarketSchema.safeParse({ query });

    if (!validInput.success) {
      return NextResponse.json({
        message: validInput.error.message,
        success: false,
      });
    }

    const redisClient = RedisManager.getInstance();

    const uniqueId = randomUUID();
    const promise = redisClient.subscribeToEvent(uniqueId);

    await redisClient.pushToEngine({ query }, "QUERY_SEARCH", uniqueId);

    const response = await promise;

    return NextResponse.json(response);
  }

  const validInput = StartMarketSchema.safeParse({ marketId });

  if (!validInput.success) {
    return NextResponse.json({
      message: validInput.error.message,
      success: false,
    });
  }

  const redisclient = RedisManager.getInstance();

  // const eventId = await redisclient.pushToEngine({marketId},"GET_MARKET_ORDERBOOK")

  // const response = await redisclient.subscribeToEvent(eventId);

  const uniqueId = randomUUID();
  const promise = redisclient.subscribeToEvent(uniqueId);
  const eventId = await redisclient.pushToEngine(
    { marketId },
    "GET_MARKET_ORDERBOOK",
    uniqueId
  );

  const response = await promise;

  return NextResponse.json(response);
}
