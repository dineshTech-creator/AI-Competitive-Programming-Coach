import express from "express";
import {
  analysis,
  recommendation,
  hint,
  performanceAnalysis,
  getMCQQuestions,
  submitMCQAnswers,
} from "../controllers/aiController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);
router.get("/analysis", analysis);
router.get("/recommendation", recommendation);
router.post("/hint", hint);
router.get("/performance", performanceAnalysis);
router.get("/mcq-questions", getMCQQuestions);
router.post("/mcq-submit", submitMCQAnswers);

export default router;
