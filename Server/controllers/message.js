import MessageModel from "../models/message.js";
import AuthModel from "../models/auth.js";

export const createMessage = async (req, res) => {
  try {
    const { role, content, image } = req.body;
    const id = req.userId;
    const newMessage = await MessageModel.create({
      role,
      content,
      image,
    });
    const user = await AuthModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.messages.push(newMessage._id);
    await user.save();
    res.status(201).json(newMessage);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
