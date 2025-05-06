import {
  login,
  register,
  getUser,
  deleteUserMessages,
} from "../controllers/auth.js";
import express from "express";
import verifyToken from "../middlewares/verify.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/user", verifyToken, getUser);
router.delete("/deleteUserMessages", verifyToken, deleteUserMessages);

export default router;
