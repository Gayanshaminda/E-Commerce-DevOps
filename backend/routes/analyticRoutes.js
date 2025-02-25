import express from "express";
import { adminRoute, protectRoute } from "../middleware/authMiddleware.js";
import { analytics } from "../controllers/analyticController.js";

const router = express.Router();

router.get("/" , protectRoute, adminRoute, analytics)

export default router;