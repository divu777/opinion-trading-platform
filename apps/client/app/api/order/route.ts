import { RedisManager } from "@/lib/redis";
import { LimitOrderSchema } from "@repo/common";
import { randomUUID } from "crypto";

import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();

    const result = LimitOrderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({
        message: result.error.message,
        status: false,
      });
    }
    const redisInstance = RedisManager.getInstance();
         await redisInstance.init()

;

    const uniqueId = randomUUID();
    const promise = redisInstance.subscribeToEvent(uniqueId);
    const eventId = await redisInstance.pushToEngine(
      body,
      String(body.order_type),
      uniqueId
    );

    const response = await promise;
    return NextResponse.json(response);
  } catch (error) {
    console.log(error + " Error in sending Post Request. ");
  }
};
