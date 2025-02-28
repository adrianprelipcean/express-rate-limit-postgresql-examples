import { NextRequest, NextResponse } from "next/server";
import { individualApiRateLimiter } from "../../../../service/rate-limiter";

export const GET = individualApiRateLimiter(async (req: NextRequest) => {
    return NextResponse.json(
      { message: "Users Individual Data", data: [] }, 
      { status: 200 }
    );
  });