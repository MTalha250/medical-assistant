import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FaRobot,
  FaCog,
  FaCheck,
  FaCrown,
  FaGooglePay,
  FaHeart,
  FaBolt,
  FaShieldAlt,
} from "react-icons/fa";
import useAuthStore from "@/store/authStore";
import { getAvailableModels, updateSelectedModel } from "@/hooks/models";
import { AIModel } from "@/types";
import toast from "react-hot-toast";

interface ModelSelectorProps {
  onModelChange?: (modelId: string) => void;
}

const ModelSelector = ({ onModelChange }: ModelSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [models, setModels] = useState<AIModel[]>([]);
  const [currentModel, setCurrentModel] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<string>("");
  const { user, token, setUser } = useAuthStore();

  // Initialize with user's selected model when component loads
  useEffect(() => {
    if (user?.selectedModel) {
      setCurrentModel(user.selectedModel);
    }
  }, [user?.selectedModel]);

  // Fetch models when component mounts to get model details for display
  useEffect(() => {
    if (token) {
      fetchModels();
    }
  }, [token]);

  useEffect(() => {
    if (open) {
      fetchModels();
    }
  }, [open, token]);

  const fetchModels = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await getAvailableModels(token);
      setModels(response.availableModels);

      // Update current model from server response if different from local state
      if (response.currentModel !== currentModel) {
        setCurrentModel(response.currentModel);
        // Also update the user store to keep it in sync
        if (user) {
          setUser({
            ...user,
            selectedModel: response.currentModel,
          });
        }
      }

      setPlan(response.plan);
    } catch (error) {
      console.error("Error fetching models:", error);
      if (open) {
        toast.error("Failed to load available models");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleModelSelect = async (modelId: string) => {
    if (!token) return;

    try {
      setLoading(true);
      await updateSelectedModel(modelId, token);
      setCurrentModel(modelId);

      // Update user in store
      if (user) {
        setUser({
          ...user,
          selectedModel: modelId,
        });
      }

      toast.success("Model updated successfully!");
      onModelChange?.(modelId);
      setOpen(false);
    } catch (error: any) {
      console.error("Error updating model:", error);
      toast.error(error.message || "Failed to update model");
    } finally {
      setLoading(false);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "google":
        return <FaGooglePay className="text-blue-500" />;
      case "cohere":
        return <FaHeart className="text-pink-500" />;
      case "huggingface":
        return <FaRobot className="text-orange-500" />;
      default:
        return <FaBolt className="text-yellow-500" />;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case "google":
        return "bg-blue-50 border-blue-200";
      case "cohere":
        return "bg-pink-50 border-pink-200";
      case "huggingface":
        return "bg-orange-50 border-orange-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getCurrentModelInfo = () => {
    const foundModel = models.find((model) => model.id === currentModel);

    // If we found the model in the loaded models array, return it
    if (foundModel) {
      return foundModel;
    }

    // If we have a currentModel ID but models array is empty/not loaded yet,
    // provide basic info based on the model ID
    if (currentModel) {
      // Map common model IDs to basic display information
      const modelDisplayMap: {
        [key: string]: { name: string; provider: string };
      } = {
        "gemini-2.0-flash": { name: "Gemini 2.0 Flash", provider: "google" },
        "llama-3.1-8b": { name: "Llama 3.1 8B", provider: "huggingface" },
        "llama-3.1-70b": { name: "Llama 3.1 70B", provider: "huggingface" },
        "cohere-command-r": { name: "Cohere Command R", provider: "cohere" },
      };

      const basicInfo = modelDisplayMap[currentModel];
      if (basicInfo) {
        return {
          id: currentModel,
          name: basicInfo.name,
          provider: basicInfo.provider,
          description: "Loading model details...",
          maxTokens: 0,
        };
      }
    }

    // Fallback to first model in array or default model info
    return (
      models[0] || {
        id: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
        provider: "google",
        description: "Default model",
        maxTokens: 2000,
      }
    );
  };

  const currentModelInfo = getCurrentModelInfo();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-1 sm:gap-2 bg-white hover:bg-gray-50 px-2 sm:px-3 py-1 sm:py-2 h-8 sm:h-auto"
        >
          <FaCog className="text-xs sm:text-sm flex-shrink-0" />
          <div className="flex flex-col items-start min-w-0">
            <span className="text-xs text-gray-500 hidden sm:block">
              AI Model
            </span>
            <span className="text-xs sm:text-sm font-medium truncate max-w-[80px] sm:max-w-none">
              {currentModelInfo?.name || "Select Model"}
            </span>
          </div>
          <div className="flex-shrink-0">
            {getProviderIcon(currentModelInfo?.provider || "")}
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FaRobot className="text-slate" />
            Choose AI Model
            <Badge
              className={`${
                plan === "free"
                  ? "bg-gray-500"
                  : plan === "basic"
                  ? "bg-blue-500"
                  : "bg-purple-500"
              } text-white`}
            >
              {plan?.toUpperCase()} Plan
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <FaCog className="animate-spin text-2xl text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Loading models...</p>
              </div>
            ) : (
              models.map((model) => (
                <Card
                  key={model.id}
                  className={`p-4 cursor-pointer transition-all duration-200 ${
                    currentModel === model.id
                      ? "ring-2 ring-slate border-slate"
                      : "hover:shadow-md"
                  } ${getProviderColor(model.provider)}`}
                  onClick={() => handleModelSelect(model.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getProviderIcon(model.provider)}
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {model.name}
                          </h3>
                          <p className="text-sm text-gray-600 capitalize">
                            by {model.provider}
                          </p>
                        </div>
                        {currentModel === model.id && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            <FaCheck className="text-xs" />
                            Current
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-3">
                        {model.description}
                      </p>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="text-xs">
                          <FaShieldAlt className="mr-1" />
                          {model.maxTokens} tokens
                        </Badge>
                        {model.provider === "google" && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-blue-50"
                          >
                            Vision Support
                          </Badge>
                        )}
                        {model.provider === "huggingface" && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-orange-50"
                          >
                            Open Source
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>

        {plan === "free" && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <FaCrown className="text-sm" />
              <span className="text-sm font-medium">
                Upgrade to access more powerful AI models!
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ModelSelector;
