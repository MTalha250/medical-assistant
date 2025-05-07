import mongoose from "mongoose";

const AuthSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
    records: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Record",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const AuthModel = mongoose.model("User", AuthSchema);
export default AuthModel;
