import { createMessage } from "../controllers/message.js";
import express from "express";
import verifyToken from "../middlewares/verify.js";

const router = express.Router();

router.post("/create", verifyToken, createMessage);

export default router;
