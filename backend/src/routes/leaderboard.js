import express from "express";
import { leaderboard } from "../controllers/leaderboardController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);
router.get("/", leaderboard);

export default router;
