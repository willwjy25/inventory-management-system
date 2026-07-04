import { Request, Response } from "express";

import { asyncHandler } from "../../common/asyncHandler";
import { successResponse } from "../../common/response";

import { getHealthStatus } from "./system.service";

export const health = asyncHandler(async (_req: Request, res: Response) => {
  const result = await getHealthStatus();

  return successResponse(
    res,
    "System is healthy.",
    result
  );
});