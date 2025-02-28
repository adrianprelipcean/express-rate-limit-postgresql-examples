import { PostgresStore, PostgresStoreIndividualIP } from "@acpr/rate-limit-postgresql";
import rateLimit from "express-rate-limit";
import { NextRequest, NextResponse } from "next/server";

let databaseConnection = {
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    port: parseInt(process.env.PGPORT || "")
}

const aggregatedStore = new PostgresStore(
    databaseConnection,
    'aggregated_store');

const aggregatedlimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    store: aggregatedStore,
    keyGenerator: (req) => {
        return req.headers["x-forwarded-for"] ?? '0.0.0.0'
    },
    handler: (req) => {
        if (req.rateLimit.remaining === 0) {
            throw new Error;
        }
    }
})

const individualStore = new PostgresStoreIndividualIP(
    databaseConnection,
    'individual_store');

const individualLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    store: individualStore,
    keyGenerator: (req) => {
        return req.headers["x-forwarded-for"] ?? '0.0.0.0'
    },
    handler: (req) => {
        if (req.rateLimit.remaining === 0) {
            throw new Error;
        }
    }
})
export function aggregatedApiRateLimiter(
    handler: (
        req: NextRequest,
        params: { params: Promise<Record<string, string>> }
    ) => Promise<NextResponse>
) {
    return async (req: NextRequest, params: { params: Promise<Record<string, string>> }): Promise<NextResponse> => {
        try {
            const mockRes = {
                setHeader: () => { },
                status: () => ({ send: () => { } })
            };

            await new Promise<void>((resolve, reject) => {
                aggregatedlimiter(req, mockRes, (error: Error | undefined) => {
                    if (error) reject(error);
                    resolve();
                });
            });

            return await handler(req, params);
        } catch (error) {
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }
    }
}

export function individualApiRateLimiter(
    handler: (
        req: NextRequest,
        params: { params: Promise<Record<string, string>> }
    ) => Promise<NextResponse>
) {
    return async (req: NextRequest, params: { params: Promise<Record<string, string>> }): Promise<NextResponse> => {
        try {
            const mockRes = {
                setHeader: () => { },
                status: () => ({ send: () => { } })
            };

            await new Promise<void>((resolve, reject) => {
                individualLimiter(req, mockRes, (error: Error | undefined) => {
                    if (error) reject(error);
                    resolve();
                });
            });

            return await handler(req, params);
        } catch (error) {
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }
    }
}
