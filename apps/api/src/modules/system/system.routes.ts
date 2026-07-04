import { Router } from "express";

import { health } from "./system.controller";

const router = Router();

router.get("/health", health);

export default router;