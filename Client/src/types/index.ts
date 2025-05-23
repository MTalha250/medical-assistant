type User = {
  _id: string;
  name: string;
  email: string;
  password: string;
  messages: Message[];
  records: Record[];
  subscription: {
    plan: "free" | "basic" | "premium";
    status: "active" | "inactive" | "expired";
    startDate?: string;
    endDate?: string;
    features: {
      maxMessages: number;
      maxRecords: number;
      voiceFeatures: boolean;
      imageAnalysis: boolean;
      prioritySupport: boolean;
    };
  };
  selectedModel: string; // Default: "gemini-2.0-flash"
  createdAt: string;
  updatedAt: string;
};

export type Record = {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  createdAt: string;
};

export type Message = {
  role: string;
  content: string;
  image?: string;
};

export type SubscriptionPlan = {
  name: string;
  price: number;
  features: {
    maxMessages: number;
    maxRecords: number;
    voiceFeatures: boolean;
    imageAnalysis: boolean;
    prioritySupport: boolean;
  };
  availableModels: AIModel[];
};

export type AIModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
  maxTokens: number;
};

export default User;
