import MessageModel from "../models/message.js";
import AuthModel from "../models/auth.js";
import AIService from "../services/aiService.js";

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

// Generate AI response using selected model
export const generateAIResponse = async (req, res) => {
  try {
    const { prompt, image } = req.body;
    const userId = req.userId;

    const user = await AuthModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user's selected model and find its details
    const selectedModelId = user.selectedModel || "gemini-2.0-flash";

    // Get model details from subscription plans
    const subscriptionPlans = {
      free: {
        availableModels: [{ id: "gemini-2.0-flash", maxTokens: 2000 }],
      },
      basic: {
        availableModels: [
          { id: "gemini-2.0-flash", maxTokens: 2000 },
          { id: "llama-3.1-8b", maxTokens: 800 },
        ],
      },
      premium: {
        availableModels: [
          { id: "gemini-2.0-flash", maxTokens: 4000 },
          { id: "llama-3.1-70b", maxTokens: 2500 },
          { id: "cohere-command-r", maxTokens: 2000 },
        ],
      },
    };

    const availableModels =
      subscriptionPlans[user.subscription.plan].availableModels;
    const selectedModel = availableModels.find(
      (model) => model.id === selectedModelId
    );

    if (!selectedModel) {
      return res.status(403).json({
        message: "Selected model is not available for your subscription plan",
      });
    }

    // Generate response using AI service
    const response = await AIService.generateResponse(
      selectedModelId,
      prompt,
      image,
      selectedModel.maxTokens
    );

    res.status(200).json({
      response,
      modelUsed: selectedModelId,
    });
  } catch (error) {
    console.error("AI Response Error:", error);
    res.status(500).json({
      error: "Failed to generate AI response",
      details: error.message,
    });
  }
};
