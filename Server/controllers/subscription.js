import AuthModel from "../models/auth.js";
import dotenv from "dotenv";
dotenv.config();

// Subscription plans configuration
const SUBSCRIPTION_PLANS = {
  free: {
    name: "Free",
    price: 0,
    features: {
      maxMessages: 10,
      maxRecords: 5,
      voiceFeatures: false,
      imageAnalysis: false,
      prioritySupport: false,
    },
    availableModels: [
      {
        id: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
        provider: "google",
        description: "Latest fast model for basic medical queries",
        maxTokens: 2000,
      },
    ],
  },
  basic: {
    name: "Basic",
    price: 9.99,
    features: {
      maxMessages: 100,
      maxRecords: 25,
      voiceFeatures: true,
      imageAnalysis: false,
      prioritySupport: false,
    },
    availableModels: [
      {
        id: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
        provider: "google",
        description: "Latest fast model for basic medical queries",
        maxTokens: 2000,
      },
      {
        id: "llama-3.1-8b",
        name: "Llama 3.1 8B",
        provider: "huggingface",
        description: "Open source model for general medical information",
        maxTokens: 800,
      },
    ],
  },
  premium: {
    name: "Premium",
    price: 19.99,
    features: {
      maxMessages: -1, // Unlimited
      maxRecords: -1, // Unlimited
      voiceFeatures: true,
      imageAnalysis: true,
      prioritySupport: true,
    },
    availableModels: [
      {
        id: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
        provider: "google",
        description: "Latest and most advanced Gemini model",
        maxTokens: 4000,
      },
      {
        id: "llama-3.1-70b",
        name: "Llama 3.1 70B",
        provider: "huggingface",
        description: "Large open source model with advanced capabilities",
        maxTokens: 2500,
      },
      {
        id: "cohere-command-r",
        name: "Cohere Command R",
        provider: "cohere",
        description: "Advanced model with retrieval capabilities",
        maxTokens: 2000,
      },
    ],
  },
};

// Get all available subscription plans
export const getSubscriptionPlans = async (req, res) => {
  try {
    res.status(200).json({
      plans: SUBSCRIPTION_PLANS,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's current subscription
export const getUserSubscription = async (req, res) => {
  try {
    const user = await AuthModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      subscription: user.subscription,
      currentPlan: SUBSCRIPTION_PLANS[user.subscription.plan],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Subscribe to a plan
export const subscribeToPlan = async (req, res) => {
  try {
    const { planType } = req.body;
    const userId = req.userId;

    if (!SUBSCRIPTION_PLANS[planType]) {
      return res.status(400).json({ message: "Invalid subscription plan" });
    }

    const user = await AuthModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

    // Update user's subscription
    user.subscription = {
      plan: planType,
      status: "active",
      startDate: startDate,
      endDate: endDate,
      features: SUBSCRIPTION_PLANS[planType].features,
    };

    await user.save();

    res.status(200).json({
      message: "Subscription updated successfully",
      subscription: user.subscription,
      currentPlan: SUBSCRIPTION_PLANS[planType],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cancel subscription
export const cancelSubscription = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await AuthModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Reset to free plan
    user.subscription = {
      plan: "free",
      status: "inactive",
      startDate: null,
      endDate: null,
      features: SUBSCRIPTION_PLANS.free.features,
    };

    await user.save();

    res.status(200).json({
      message: "Subscription cancelled successfully",
      subscription: user.subscription,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Check subscription limits
export const checkSubscriptionLimits = async (req, res) => {
  try {
    const userId = req.userId;
    const { type } = req.query; // 'messages' or 'records'

    const user = await AuthModel.findById(userId).populate("messages records");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let currentCount;
    if (type === "messages") {
      // Only count user messages, not assistant messages
      currentCount = user.messages.filter(
        (message) => message.role === "user"
      ).length;
    } else {
      currentCount = user.records.length;
    }

    const limit =
      user.subscription.features[
        type === "messages" ? "maxMessages" : "maxRecords"
      ];

    const canAdd = limit === -1 || currentCount < limit;

    res.status(200).json({
      currentCount,
      limit,
      canAdd,
      remaining: limit === -1 ? -1 : Math.max(0, limit - currentCount),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get available models for user's subscription
export const getAvailableModels = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await AuthModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userPlan = user.subscription.plan;
    const availableModels = SUBSCRIPTION_PLANS[userPlan].availableModels;

    res.status(200).json({
      availableModels,
      currentModel: user.selectedModel,
      plan: userPlan,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user's selected model
export const updateSelectedModel = async (req, res) => {
  try {
    const userId = req.userId;
    const { modelId } = req.body;

    const user = await AuthModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the model is available for user's subscription
    const userPlan = user.subscription.plan;
    const availableModels = SUBSCRIPTION_PLANS[userPlan].availableModels;
    const isModelAvailable = availableModels.some(
      (model) => model.id === modelId
    );

    if (!isModelAvailable) {
      return res.status(403).json({
        message: "This model is not available for your subscription plan",
      });
    }

    user.selectedModel = modelId;
    await user.save();

    res.status(200).json({
      message: "Model updated successfully",
      selectedModel: modelId,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
