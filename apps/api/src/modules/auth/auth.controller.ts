import { Request, Response } from "express";

import { asyncHandler } from "../../common/asyncHandler";
import { successResponse } from "../../common/response";

import {
  registerSchema,
  loginSchema,
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