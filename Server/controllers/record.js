import RecordModel from "../models/record.js";
import AuthModel from "../models/auth.js";

export const createRecord = async (req, res) => {
  try {
    const { title, description, fileUrl } = req.body;
    const id = req.userId;
    const newRecord = await RecordModel.create({
      title,
      description,
      fileUrl,
    });
    const user = await AuthModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.records.push(newRecord._id);
    await user.save();
    res.status(201).json(newRecord);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await RecordModel.findByIdAndDelete(id);
    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }
    const user = await AuthModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.records = user.records.filter((record) => record.toString() !== id);
    await user.save();
    res.status(200).json({ message: "Record deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
