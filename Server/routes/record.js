import express from "express";
import verifyToken from "../middlewares/verify.js";
import { createRecord, deleteRecord } from "../controllers/record.js";

const router = express.Router();

router.post("/create", verifyToken, createRecord);
router.delete("/delete/:id", verifyToken, deleteRecord);

export default router;
