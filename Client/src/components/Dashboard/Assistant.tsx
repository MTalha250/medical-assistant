import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import useAuthStore from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { GrSend } from "react-icons/gr";
import {
  FaRobot,
  FaUser,
  FaCopy,
  FaCheck,
  FaSpinner,
  FaMicrophone,
  FaMicrophoneSlash,
  FaTrash,
  FaImage,
  FaTimes,
  FaCrown,
  FaExclamationTriangle,
} from "react-icons/fa";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import toast from "react-hot-toast";
import Speech from "react-text-to-speech";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { Message } from "@/types";
import { checkSubscriptionLimits } from "@/hooks/subscription";
import { generateAIResponse } from "@/hooks/models";
import SubscriptionDialog from "./SubscriptionDialog";
import ModelSelector from "./ModelSelector";

const MedicalAssistant = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [messageLimits, setMessageLimits] = useState({
    currentCount: 0,
    limit: 0,
    canAdd: true,
    remaining: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, token, setUser } = useAuthStore();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    setMessages(
      user.messages && user.messages.length > 0
        ? user.messages
        : [
            {
              role: "assistant",
              content:
                "Hello! I'm your AI medical assistant. How can I help you today? I can provide general medical information, explain medical terms, or discuss common health topics.",
            },
          ]
    );
    checkMessageLimits();
  }, [user?._id]);

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      toast.error("Speech recognition is not supported in your browser");
    }
  }, [browserSupportsSpeechRecognition]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkMessageLimits = async () => {
    if (!token) return;

    try {
      const limits = await checkSubscriptionLimits("messages", token);
      setMessageLimits(limits);
    } catch (error) {
      console.error("Error checking message limits:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const storeMessage = async (message: {
    role: string;
    content: string;
    image?: string;
  }) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URI}/messages/create`,
        message,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Error storing message:", error);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user?.subscription?.features?.imageAnalysis) {
      toast.error(
        "Image analysis is only available with Premium subscription!"
      );
      setSubscriptionDialogOpen(true);
      return;
    }

    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        toast.error("Image size should be less than 1MB");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !selectedImage) return;

    if (!messageLimits.canAdd) {
      toast.error(
        `You've reached your limit of ${messageLimits.limit} messages. Please upgrade your plan to continue.`
      );
      setSubscriptionDialogOpen(true);
      return;
    }

    // Check if user is trying to use image analysis without permission
    if (selectedImage && !user?.subscription?.features?.imageAnalysis) {
      toast.error(
        "Image analysis is only available with Premium subscription!"
      );
      setSubscriptionDialogOpen(true);
      return;
    }

    const userMessage = {
      role: "user",
      content: input,
      image: selectedImage || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    await storeMessage(userMessage);
    if (user) {
      setUser({
        ...user,
        messages: [...user.messages, userMessage],
      });
    }
    setInput("");
    setSelectedImage("");

    try {
      setLoading(true);
      const response = await generateAIResponse(
        input,
        selectedImage || null,
        token!
      );
      const assistantMessage = {
        role: "assistant",
        content: response.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      await storeMessage(assistantMessage);
      if (user) {
        setUser({
          ...user,
          messages: [...user.messages, assistantMessage],
        });
      }

      // Update message limits after successful message
      await checkMessageLimits();
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm sorry, I couldn't process your request. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URI}/auth/deleteUserMessages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessages([
        {
          role: "assistant",
          content:
            "Chat history cleared. How can I help you with your medical questions today?",
        },
      ]);
      if (user) {
        setUser({
          ...user,
          messages: [],
        });
      }
      toast.success("Chat history cleared successfully");
      // Update limits after clearing
      await checkMessageLimits();
    } catch (error) {
      console.error("Error clearing chat:", error);
      toast.error("Failed to clear chat history");
    }
  };

  const copyToClipboard = (content: string, index: number) => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        setCopiedMessageId(index);
        toast.success("Response copied to clipboard");
        setTimeout(() => {
          setCopiedMessageId(null);
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        toast.error("Failed to copy text");
      });
  };

  const toggleListening = () => {
    // Check if user has voice features
    if (!user?.subscription?.features?.voiceFeatures) {
      toast.error(
        "Voice features are only available with Basic or Premium subscription!"
      );
      setSubscriptionDialogOpen(true);
      return;
    }

    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  const renderLimitWarning = () => {
    if (messageLimits.limit === -1) return null; // Unlimited

    const warningThreshold = Math.ceil(messageLimits.limit * 0.8); // 80% of limit
    const isNearLimit = messageLimits.currentCount >= warningThreshold;
    const isAtLimit = !messageLimits.canAdd;

    if (isAtLimit) {
      return (
        <Card className="mb-4 p-4 bg-red-50 border-red-200">
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="text-red-500" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Message Limit Reached</p>
              <p className="text-red-600 text-sm">
                You've sent all {messageLimits.limit} messages in your{" "}
                {user?.subscription?.plan} plan.
              </p>
            </div>
            <Button
              onClick={() => setSubscriptionDialogOpen(true)}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <FaCrown className="mr-2" />
              Upgrade
            </Button>
          </div>
        </Card>
      );
    }

    if (isNearLimit) {
      return (
        <Card className="mb-4 p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="text-yellow-500" />
            <div className="flex-1">
              <p className="text-yellow-800 font-medium">
                Approaching Message Limit
              </p>
              <p className="text-yellow-600 text-sm">
                {messageLimits.remaining} messages remaining in your{" "}
                {user?.subscription?.plan} plan.
              </p>
            </div>
            <Button
              onClick={() => setSubscriptionDialogOpen(true)}
              variant="outline"
              className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
            >
              <FaCrown className="mr-2" />
              Upgrade
            </Button>
          </div>
        </Card>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-white">
      <div className="py-3 px-2 sm:px-6 bg-gradient-to-r from-slate to-[#3A526A] border-b border-slate/10">
        {/* Mobile Layout */}
        <div className="flex flex-col gap-2 sm:hidden">
          {/* Top row: Title and Clear button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 flex-1">
              <div className="bg-peach p-2 rounded-full mr-3 flex-shrink-0">
                <FaRobot className="text-slate text-lg" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-bold text-lg text-white truncate">
                  Medical Assistant
                </h1>
              </div>
            </div>
            <Button
              type="button"
              onClick={clearChat}
              className="bg-peach text-slate rounded-full p-2 h-9 w-9 flex items-center justify-center transition-colors flex-shrink-0 ml-2"
              title="Clear chat"
            >
              <FaTrash className="text-sm" />
            </Button>
          </div>

          {/* Bottom row: Model selector and status badges */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 min-w-0 flex-1">
              {messageLimits.limit !== -1 && (
                <>
                  <Badge
                    variant="outline"
                    className="text-white border-white/30 text-xs whitespace-nowrap"
                  >
                    {messageLimits.currentCount}/{messageLimits.limit}
                  </Badge>
                  <Badge
                    className={`text-xs whitespace-nowrap ${
                      user?.subscription?.plan === "free"
                        ? "bg-gray-500"
                        : user?.subscription?.plan === "basic"
                        ? "bg-blue-500"
                        : "bg-purple-500"
                    } text-white`}
                  >
                    {user?.subscription?.plan?.toUpperCase() || "FREE"}
                  </Badge>
                </>
              )}
            </div>
            <div className="flex-shrink-0">
              <ModelSelector onModelChange={() => checkMessageLimits()} />
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-peach p-2 rounded-full mr-3">
              <FaRobot className="text-slate text-xl" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-white">
                Medical Assistant
              </h1>
              {messageLimits.limit !== -1 && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className="text-white border-white/30"
                  >
                    {messageLimits.currentCount}/{messageLimits.limit} messages
                    sent
                  </Badge>
                  <Badge
                    className={`${
                      user?.subscription?.plan === "free"
                        ? "bg-gray-500"
                        : user?.subscription?.plan === "basic"
                        ? "bg-blue-500"
                        : "bg-purple-500"
                    } text-white`}
                  >
                    {user?.subscription?.plan?.toUpperCase() || "FREE"} Plan
                  </Badge>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ModelSelector onModelChange={() => checkMessageLimits()} />
            <Button
              type="button"
              onClick={clearChat}
              className="bg-peach text-slate rounded-full p-2 h-10 w-10 flex items-center justify-center transition-colors"
              title="Clear chat"
            >
              <FaTrash className="text-xl" />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col h-[calc(100%-4rem)] overflow-hidden">
        <div className="px-2 sm:px-6 pt-6">
          <Card className="bg-skyBlue/20 border border-skyBlue rounded-xl p-4 text-slate">
            <p className="text-sm">
              This AI assistant provides general medical information only. It is
              not a substitute for professional medical advice, diagnosis, or
              treatment. Always consult with a qualified healthcare provider for
              medical concerns.
            </p>
          </Card>
          {renderLimitWarning()}
        </div>
        <ScrollArea className="flex-1 px-2 sm:px-6 pt-4 pb-2">
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start max-w-full sm:max-w-[80%] ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <Avatar
                    className={`flex-shrink-0 ${
                      message.role === "user"
                        ? "ml-3 bg-peach text-slate"
                        : "mr-3 bg-slate text-white"
                    } h-9 w-9 shadow-sm flex items-center justify-center`}
                  >
                    {message.role === "user" ? <FaUser /> : <FaRobot />}
                  </Avatar>
                  <div
                    className={`rounded-2xl px-4 py-3 shadow-sm ${
                      message.role === "user"
                        ? "bg-peach text-slate rounded-tr-none"
                        : "bg-skyBlue text-slate rounded-tl-none"
                    } relative`}
                  >
                    {message.image && (
                      <div className="mb-2">
                        <img
                          src={message.image}
                          alt="Attached"
                          className="max-w-[300px] rounded-lg"
                        />
                      </div>
                    )}
                    <div className="prose prose-sm max-w-none pr-6">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                    {message.role === "assistant" && (
                      <button
                        onClick={() => copyToClipboard(message.content, index)}
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-white/50 hover:bg-white/80 transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedMessageId === index ? (
                          <FaCheck className="text-green-500 text-xs" />
                        ) : (
                          <FaCopy className="text-slate/70 text-xs" />
                        )}
                      </button>
                    )}
                    {message.role === "assistant" &&
                      user?.subscription?.features?.voiceFeatures && (
                        <div className="mt-2">
                          <Speech text={message.content} />
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-start max-w-[80%]">
                  <Avatar className="mr-3 bg-slate text-white h-9 w-9">
                    <FaRobot />
                  </Avatar>
                  <div className="rounded-2xl rounded-tl-none px-4 py-3 bg-skyBlue text-slate shadow-sm">
                    <FaSpinner className="animate-spin" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <div className="px-2 sm:px-6 py-4 border-t border-slate/10 bg-white">
          <form onSubmit={sendMessage} className="flex flex-col gap-2">
            {selectedImage && (
              <div className="relative inline-block">
                <img
                  src={selectedImage}
                  alt="Selected"
                  className="max-h-[100px] rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeSelectedImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <FaTimes />
                </button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />
              <Button
                type="button"
                onClick={() => {
                  if (!user?.subscription?.features?.imageAnalysis) {
                    toast.error(
                      "Image analysis is only available with Premium subscription!"
                    );
                    setSubscriptionDialogOpen(true);
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
                className={`${
                  user?.subscription?.features?.imageAnalysis
                    ? "bg-peach hover:bg-peach/90"
                    : "bg-gray-300 hover:bg-gray-400"
                } text-slate rounded-full p-2 h-10 w-10 flex items-center justify-center transition-colors relative`}
                title={
                  user?.subscription?.features?.imageAnalysis
                    ? "Attach image"
                    : "Image analysis requires Premium subscription"
                }
              >
                <FaImage className="text-xl" />
                {!user?.subscription?.features?.imageAnalysis && (
                  <FaCrown className="absolute -top-1 -right-1 text-xs text-yellow-500" />
                )}
              </Button>
              <Button
                type="button"
                onClick={toggleListening}
                className={`${
                  listening
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : user?.subscription?.features?.voiceFeatures
                    ? "bg-peach hover:bg-peach/90"
                    : "bg-gray-300 hover:bg-gray-400"
                } text-slate rounded-full p-2 h-10 w-10 flex items-center justify-center transition-colors relative`}
                title={
                  user?.subscription?.features?.voiceFeatures
                    ? listening
                      ? "Stop listening"
                      : "Start listening"
                    : "Voice features require Basic or Premium subscription"
                }
              >
                {listening ? (
                  <FaMicrophoneSlash className="text-xl" />
                ) : (
                  <>
                    <FaMicrophone className="text-xl" />
                    {!user?.subscription?.features?.voiceFeatures && (
                      <FaCrown className="absolute -top-1 -right-1 text-xs text-yellow-500" />
                    )}
                  </>
                )}
              </Button>
              <div className="flex-1 relative">
                <Input
                  className="w-full bg-skyBlue/10 hover:bg-skyBlue/20 border-skyBlue text-slate rounded-full pl-4 pr-12 py-6 placeholder-slate/50"
                  placeholder={
                    listening
                      ? "Listening..."
                      : !messageLimits.canAdd
                      ? "Message limit reached..."
                      : "Type your medical question..."
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !e.shiftKey && sendMessage(e)
                  }
                  disabled={!messageLimits.canAdd}
                />
                <Button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-slate hover:bg-slate/90 text-white rounded-full p-2 h-9 w-9 flex items-center justify-center"
                  disabled={
                    loading ||
                    (!input.trim() && !selectedImage) ||
                    !messageLimits.canAdd
                  }
                >
                  <GrSend className="text-sm" />
                </Button>
              </div>
            </div>
            {!messageLimits.canAdd && (
              <div className="text-center">
                <Button
                  onClick={() => setSubscriptionDialogOpen(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  <FaCrown className="mr-2" />
                  Upgrade to Continue Chatting
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>

      <SubscriptionDialog
        open={subscriptionDialogOpen}
        onOpenChange={setSubscriptionDialogOpen}
      />
    </div>
  );
};

export default MedicalAssistant;
