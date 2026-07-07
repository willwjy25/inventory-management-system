import { Request, Response } from "express";

import { asyncHandler } from "../../common/asyncHandler";
import { successResponse } from "../../common/response";

import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
} from "./auth.validation";

import * as authService from "./auth.service";

export const register = asyncHandler(
  async (req: Request, res: Response) => {
    const data = registerSchema.parse(req.body);

    const user = await authService.register(data);

    return successResponse(
      res,
      "User registered successfully.",
      user,
      201
    );
  }
);

export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const data = loginSchema.parse(req.body);

    const result = await authService.login(data);

    return successResponse(
      res,
      "Login successful.",
      result
    );
  }
);

export const refreshController = asyncHandler(
  async (req: Request, res: Response) => {
    const data = refreshTokenSchema.parse(req.body);

    const result = await authService.refresh(data);

    return successResponse(
      res,
      "Token refreshed successfully.",
      result
    );
  }
);

export const logoutController = asyncHandler(async (req, res) => {
  const data = logoutSchema.parse(req.body);

  await authService.logout(data);

  return successResponse(
    res,
    "Logout successful.",
    null
  );
});