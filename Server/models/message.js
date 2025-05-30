import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
    },
    content: {
      type: String,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
const MessageModel = mongoose.model("Message", MessageSchema);

export default MessageModel;
