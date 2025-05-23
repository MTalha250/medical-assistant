import { createMessage, generateAIResponse } from "../controllers/message.js";
import express from "express";
import verifyToken from "../middlewares/verify.js";

const router = express.Router();

router.post("/create", verifyToken, createMessage);
router.post("/generate", verifyToken, generateAIResponse);

export default router;
