import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URI;

export const getSubscriptionPlans = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/subscription/plans`);
    return response.data.plans;
  } catch (error) {
    throw error;
  }
};

export const getUserSubscription = async (token: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/subscription/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const subscribeToPlan = async (planType: string, token: string) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/subscription/subscribe`,
      { planType },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const cancelSubscription = async (token: string) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/subscription/cancel`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const checkSubscriptionLimits = async (
  type: "messages" | "records",
  token: string
) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/subscription/limits?type=${type}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
