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
    subscription: {
      plan: {
        type: String,
        enum: ["free", "basic", "premium"],
        default: "free",
      },
      status: {
        type: String,
        enum: ["active", "inactive", "expired"],
        default: "inactive",
      },
      startDate: {
        type: Date,
      },
      endDate: {
        type: Date,
      },
      features: {
        maxMessages: {
          type: Number,
          default: 10,
        },
        maxRecords: {
          type: Number,
          default: 5,
        },
        voiceFeatures: {
          type: Boolean,
          default: false,
        },
        imageAnalysis: {
          type: Boolean,
          default: false,
        },
        prioritySupport: {
          type: Boolean,
          default: false,
        },
      },
    },
    selectedModel: {
      type: String,
      default: "gemini-2.0-flash", // Default to Gemini 2.0 Flash
    },
  },
  {
    timestamps: true,
  }
);

const AuthModel = mongoose.model("User", AuthSchema);
export default AuthModel;
