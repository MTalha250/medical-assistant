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
} from "react-icons/fa";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import toast from "react-hot-toast";
import Speech from "react-text-to-speech";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { Message } from "@/types";

const MedicalAssistant = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, token, setUser } = useAuthStore();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API });
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
      const response = await generateAIResponse(input, selectedImage);
      const assistantMessage = {
        role: "assistant",
        content: response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      await storeMessage(assistantMessage);
      if (user) {
        setUser({
          ...user,
          messages: [...user.messages, assistantMessage],
        });
      }
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

  const generateAIResponse = async (prompt: string, image?: string) => {
    let imageData;
    if (image) {
      imageData = image.split(",")[1];
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: image
        ? [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/png",
                data: imageData,
              },
            },
          ]
        : prompt,
      config: {
        systemInstruction: `You are a helpful and knowledgeable AI medical assistant. Your responses should be strictly related to medical topics and structured clearly using paragraphs and headings. Also skip a line between paragraphs.
- If a user asks for medical advice, provide general information and suggest they consult a healthcare professional.
- If a user asks about a disease, provide a concise and well-structured explanation of the disease, including its symptoms, causes, risk factors, and possible treatments.
- If the user describes one or more symptoms, analyze them and suggest possible related medical conditions along with a brief explanation for each.
- Keep responses concise, focused, and avoid excessive detail unless the user asks for more.
- Always include a disclaimer that your suggestions are not a diagnosis and advise the user to consult a qualified healthcare professional for medical evaluation or treatment.
- If a question is not medical in nature, politely decline to answer and remind the user that you are designed solely for medical assistance. Do not provide non-medical advice or information.`,
      },
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
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
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-white">
      <div className="py-4 px-2 sm:px-6 bg-gradient-to-r from-slate to-[#3A526A] border-b border-slate/10 flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-peach p-2 rounded-full mr-3">
            <FaRobot className="text-slate text-xl" />
          </div>
          <h1 className="font-bold text-xl text-white">Medical Assistant</h1>
        </div>
        <Button
          type="button"
          onClick={clearChat}
          className="bg-peach text-slate rounded-full p-2 h-10 w-10 flex items-center justify-center transition-colors"
          title="Clear chat"
        >
          <FaTrash className="text-xl" />
        </Button>
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
                    {message.role === "assistant" && (
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
                onClick={() => fileInputRef.current?.click()}
                className="bg-peach hover:bg-peach/90 text-slate rounded-full p-2 h-10 w-10 flex items-center justify-center transition-colors"
                title="Attach image"
              >
                <FaImage className="text-xl" />
              </Button>
              <Button
                type="button"
                onClick={toggleListening}
                className={`${
                  listening
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-peach hover:bg-peach/90"
                } text-slate rounded-full p-2 h-10 w-10 flex items-center justify-center transition-colors`}
                title={listening ? "Stop listening" : "Start listening"}
              >
                {listening ? (
                  <FaMicrophoneSlash className="text-xl" />
                ) : (
                  <FaMicrophone className="text-xl" />
                )}
              </Button>
              <div className="flex-1 relative">
                <Input
                  className="w-full bg-skyBlue/10 hover:bg-skyBlue/20 border-skyBlue text-slate rounded-full pl-4 pr-12 py-6 placeholder-slate/50"
                  placeholder={
                    listening ? "Listening..." : "Type your medical question..."
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !e.shiftKey && sendMessage(e)
                  }
                />
                <Button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-slate hover:bg-slate/90 text-white rounded-full p-2 h-9 w-9 flex items-center justify-center"
                  disabled={loading || (!input.trim() && !selectedImage)}
                >
                  <GrSend className="text-sm" />
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MedicalAssistant;
