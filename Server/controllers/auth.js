import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AuthModel from "../models/auth.js";
import dotenv from "dotenv";
dotenv.config();

// Register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const oldUser = await AuthModel.findOne({ email });
    // Check if the user exists
    if (oldUser) {
      return res.status(409).send("User already exists");
    }
    // Create new user
    const user = await AuthModel.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
    });
    // Create token
    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1hr" }
    );

    res.status(201).json({ user, token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

//login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Check if the user exists
    const user = await AuthModel.findOne({ email }).populate(
      "messages records"
    );
    console.log(user);
    if (!user) {
      return res.status(404).send("User doesn't exist");
    }

    // Validate password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).send("Invalid credentials");
    }

    // Create token
    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1hr" }
    );

    res.status(200).json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//getUser
export const getUser = async (req, res) => {
  try {
    const user = await AuthModel.findById(req.userId).populate(
      "messages records"
    );
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const deleteUserMessages = async (req, res) => {
  try {
    const id = req.userId;
    const user = await AuthModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.messages = [];
    await user.save();
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
