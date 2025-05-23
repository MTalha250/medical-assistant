import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URI;

export const getAvailableModels = async (token: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/subscription/models`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch available models"
    );
  }
};

export const updateSelectedModel = async (modelId: string, token: string) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/subscription/models/select`,
      { modelId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to update selected model"
    );
  }
};

export const generateAIResponse = async (
  prompt: string,
  image: string | null,
  token: string
) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/messages/generate`,
      { prompt, image },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to generate AI response"
    );
  }
};
