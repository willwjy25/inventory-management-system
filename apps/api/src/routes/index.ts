import { Router } from "express";

import systemRoutes from "../modules/system";
import authRoutes from "../modules/auth";

const router = Router();

router.use("/system", systemRoutes);
router.use("/auth", authRoutes);

export default router;