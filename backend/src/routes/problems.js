import express from "express";
import { addProblem, listProblems } from "../controllers/problemsController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);
router.get("/", listProblems);
router.post("/", addProblem);

export default router;
