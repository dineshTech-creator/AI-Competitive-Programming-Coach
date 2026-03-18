import express from "express";
import { getDashboard } from "../controllers/dashboardController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);
router.get("/", getDashboard);

export default router;
