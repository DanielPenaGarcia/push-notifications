import { Request } from "express";

export function parseLimit(req: Request) {
    const limitParam: string = req.query["count"] as string;
    if(limitParam === undefined){ return 20; }
    let limit: number = parseInt(limitParam) || 20;
    if(limit < 1){ limit = 1; }
    if(limit > 50){ limit = 50; }
    return limit;
}