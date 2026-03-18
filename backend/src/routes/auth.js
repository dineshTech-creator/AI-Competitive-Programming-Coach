import express from "express";
import { login, profile, register } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", requireAuth, profile);

export default router;
