import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

class AIService {
  constructor() {
    if (process.env.GEMINI_API_KEY) {
      this.googleAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
  }

  async generateResponse(modelId, prompt, image = null, maxTokens = 1000) {
    const provider = this.getProviderFromModelId(modelId);

    switch (provider) {
      case "google":
        return await this.generateGoogleResponse(
          modelId,
          prompt,
          image,
          maxTokens
        );
      case "huggingface":
        return await this.generateHuggingFaceResponse(
          modelId,
          prompt,
          maxTokens
        );
      case "cohere":
        return await this.generateCohereResponse(modelId, prompt, maxTokens);
      default:
        throw new Error(`Unsupported model: ${modelId}`);
    }
  }

  getProviderFromModelId(modelId) {
    if (modelId.startsWith("gemini")) return "google";
    if (modelId.startsWith("llama")) return "huggingface";
    if (modelId.startsWith("cohere")) return "cohere";
    return "google"; // default
  }

  async generateGoogleResponse(
    modelId,
    prompt,
    image = null,
    maxTokens = 1000
  ) {
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("Google Gemini API key not configured");
      }

      if (!this.googleAI) {
        this.googleAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      }

      const systemInstruction = `You are a helpful and knowledgeable AI medical assistant. Your responses should be strictly related to medical topics and structured clearly using paragraphs and headings. Also skip a line between paragraphs.
- If a user asks for medical advice, provide general information and suggest they consult a healthcare professional.
- If a user asks about a disease, provide a concise and well-structured explanation of the disease, including its symptoms, causes, risk factors, and possible treatments.
- If the user describes one or more symptoms, analyze them and suggest possible related medical conditions along with a brief explanation for each.
- Keep responses concise, focused, and avoid excessive detail unless the user asks for more.
- Always include a disclaimer that your suggestions are not a diagnosis and advise the user to consult a qualified healthcare professional for medical evaluation or treatment.
- If a question is not medical in nature, politely decline to answer and remind the user that you are designed solely for medical assistance. Do not provide non-medical advice or information.`;

      // Use the correct API method for @google/genai
      let content;
      if (image) {
        const imageData = image.split(",")[1];
        content = [
          { text: `${systemInstruction}\n\nUser question: ${prompt}` },
          {
            inlineData: {
              mimeType: "image/png",
              data: imageData,
            },
          },
        ];
      } else {
        content = `${systemInstruction}\n\nUser question: ${prompt}`;
      }

      // Use generateContent method directly
      const result = await this.googleAI.models.generateContent({
        model: modelId,
        contents: content,
      });

      return result.text || "I'm sorry, I couldn't generate a response.";
    } catch (error) {
      console.error("Google AI Error:", error);

      // Handle specific error types
      if (error.message.includes("API key")) {
        return "Google Gemini API is not configured. Please add your API key to use this model.";
      }

      if (
        error.message.includes("429") ||
        error.message.includes("quota") ||
        error.message.includes("RESOURCE_EXHAUSTED")
      ) {
        return "🚨 **Gemini API Rate Limit Reached**\n\nYou've exceeded the free tier quota for Google Gemini. Please:\n\n1. **Wait a few minutes** and try again\n2. **Switch to a different model** (try Cohere or Hugging Face)\n3. **Upgrade to Gemini Pro** for higher limits\n\nTip: Try using other available models while waiting for the quota to reset.";
      }

      if (error.message.includes("400") || error.message.includes("invalid")) {
        return "Invalid request to Gemini API. Please try again with a different prompt.";
      }

      throw new Error("Failed to generate response from Google AI");
    }
  }

  async generateHuggingFaceResponse(modelId, prompt, maxTokens = 1000) {
    try {
      if (!process.env.HUGGINGFACE_API_KEY) {
        return "Hugging Face API key not configured. Please add your API key to use Llama models.";
      }

      const modelName =
        modelId === "llama-3.1-8b"
          ? "HuggingFaceH4/zephyr-7b-beta"
          : modelId === "llama-3.1-70b"
          ? "mistralai/Mixtral-8x7B-Instruct-v0.1"
          : "HuggingFaceH4/zephyr-7b-beta";

      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${modelName}`,
        {
          inputs: `You are a medical AI assistant. Please provide helpful medical information about: ${prompt}`,
          parameters: {
            max_new_tokens: maxTokens,
            temperature: 0.7,
            return_full_text: false,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (
        response.data &&
        response.data[0] &&
        response.data[0].generated_text
      ) {
        return response.data[0].generated_text;
      } else {
        throw new Error("Invalid response from Hugging Face");
      }
    } catch (error) {
      console.error("Hugging Face Error:", error);

      if (error.response?.status === 401) {
        return "🔑 **Hugging Face API Key Invalid**\n\nYour API key is not working. Please:\n\n1. Go to https://huggingface.co/settings/tokens\n2. Create a NEW token with 'Write' permissions\n3. Update your .env file with the new token";
      }

      if (error.response?.status === 403) {
        return "🚫 **Hugging Face Permission Denied**\n\nYour API token doesn't have inference permissions. Please:\n\n1. Go to https://huggingface.co/settings/tokens\n2. **Delete your current token**\n3. **Create NEW token** with:\n   - Role: 'Write' (not Read)\n   - Enable 'Inference API' permissions\n4. Update your .env file\n\nCurrent token appears to be read-only.";
      }

      if (error.response?.status === 404) {
        return "🔍 **Hugging Face Model Not Found**\n\nThe requested model is not available through the Inference API. This could be because:\n\n1. **Model is private** or requires special access\n2. **Model is not supported** by the Inference API\n3. **API endpoint has changed**\n\nTrying alternative models automatically...";
      }

      if (error.response?.status === 429) {
        return "⏳ **Hugging Face Rate Limit**\n\nToo many requests. Please wait a moment and try again.";
      }

      return "I'm currently unable to process your request through this model. Please try a different model.";
    }
  }

  async generateCohereResponse(modelId, prompt, maxTokens = 1000) {
    try {
      if (!process.env.COHERE_API_KEY) {
        return "Cohere API key not configured. Please add your API key to use Cohere models.";
      }

      const response = await axios.post(
        "https://api.cohere.ai/v1/generate",
        {
          model: "command",
          prompt: `You are a medical AI assistant. Please provide helpful medical information about: ${prompt}`,
          max_tokens: maxTokens,
          temperature: 0.7,
          k: 0,
          stop_sequences: [],
          return_likelihoods: "NONE",
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (
        response.data &&
        response.data.generations &&
        response.data.generations[0]
      ) {
        return response.data.generations[0].text;
      } else {
        throw new Error("Invalid response from Cohere");
      }
    } catch (error) {
      console.error("Cohere Error:", error);

      if (error.response?.status === 401) {
        return "🔑 **Cohere API Key Invalid**\n\nYour API key is not working. Please:\n\n1. Go to https://dashboard.cohere.ai/api-keys\n2. Generate a new API key\n3. Update your .env file";
      }

      if (error.response?.status === 403) {
        return "🚫 **Cohere Access Denied**\n\nYour account doesn't have access to this model. Please check your Cohere subscription.";
      }

      if (error.response?.status === 429) {
        return "⏳ **Cohere Rate Limit**\n\nYou've hit the rate limit. Please wait and try again.";
      }

      if (error.response?.status >= 500) {
        return "🔧 **Cohere Service Issue**\n\nCohere's servers are having issues. Please try again later.";
      }

      return "I'm currently unable to process your request through this model. Please try a different model.";
    }
  }
}

export default new AIService();
