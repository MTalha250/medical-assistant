import mongoose from "mongoose";

const RecordSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    fileUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
const RecordModel = mongoose.model("Record", RecordSchema);

export default RecordModel;
