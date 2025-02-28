import { NextRequest, NextResponse } from "next/server";
import { aggregatedApiRateLimiter } from "../../../../service/rate-limiter";

export const GET = aggregatedApiRateLimiter(async (req: NextRequest) => {
    return NextResponse.json(
      { message: "Users Aggregated Data", data: [] }, 
      { status: 200 }
    );
  });