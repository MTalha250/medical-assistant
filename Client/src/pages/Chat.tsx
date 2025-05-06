import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import useAuthStore from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { GrSend } from "react-icons/gr";
import { FaRobot, FaUser, FaCopy, FaCheck, FaSpinner } from "react-icons/fa";
import { MdOutlineClear } from "react-icons/md";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import { logout } from "@/hooks/auth";
import toast from "react-hot-toast";

const MedicalAssistant = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
  const { user, token, setToken, setUser } = useAuthStore();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API });

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    setMessages(
      user.messages.length > 0
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
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const storeMessage = async (message: { role: string; content: string }) => {
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

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = {
      role: "user",
      content: input,
    };
    await storeMessage(userMessage);
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setInput("");
    try {
      const response = await generateAIResponse(input);
      const assistantMessage = {
        role: "assistant",
        content: response,
      };
      await storeMessage(assistantMessage);
      setMessages((prev) => [...prev, assistantMessage]);
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

  const generateAIResponse = async (prompt: string) => {
    //
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
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
      toast.success("Chat history cleared successfully");
    } catch (error) {
      console.error("Error clearing chat:", error);
      toast.error("Failed to clear chat history");
    }
  };

  // Function to copy message content to clipboard
  const copyToClipboard = (content: string, index: number) => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        setCopiedMessageId(index);
        toast.success("Response copied to clipboard");

        // Reset the copied state after 2 seconds
        setTimeout(() => {
          setCopiedMessageId(null);
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        toast.error("Failed to copy text");
      });
  };

  return (
    <div className="p-4 md:p-8 w-full h-dvh bg-gray-900">
      <div className="overflow-hidden w-full flex flex-col rounded-xl h-full border border-gray-700">
        <div className="bg-gray-800 p-4 border-b border-gray-700 flex items-center justify-between">
          <h1 className="font-bold text-xl sm:text-2xl text-white flex items-center justify-center">
            <FaRobot className="mr-2 text-blue-400" />
            AI Medical Assistant
          </h1>
          <button
            className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            onClick={() => {
              logout();
              setToken(null);
              setUser(null);
              navigate("/");
              toast.success("Logged out successfully");
            }}
          >
            Logout
          </button>
        </div>

        <div className="flex h-[calc(100% - 4rem)] md:h-[calc(100%-4rem)]">
          <div className="h-full flex flex-col justify-between p-4 w-full bg-gray-900">
            <ScrollArea className="flex-grow pr-4">
              <div className="space-y-4 pb-4">
                <Card className="p-3 bg-blue-900/30 border-blue-700 text-blue-100 text-sm">
                  <p>
                    This AI assistant provides general medical information only.
                    It is not a substitute for professional medical advice,
                    diagnosis, or treatment. Always consult with a qualified
                    healthcare provider for medical concerns.
                  </p>
                </Card>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-start max-w-[80%] ${
                        message.role === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <Avatar
                        className={`h-8 w-8 flex items-center justify-center ${
                          message.role === "user"
                            ? "ml-2 bg-green-700"
                            : "mr-2 bg-blue-700"
                        }`}
                      >
                        {message.role === "user" ? <FaUser /> : <FaRobot />}
                      </Avatar>
                      <div
                        className={`p-3 rounded-lg text-sm ${
                          message.role === "user"
                            ? "bg-green-800 text-white"
                            : "bg-gray-800 text-white"
                        } relative`}
                      >
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                        {message.role === "assistant" && (
                          <button
                            onClick={() =>
                              copyToClipboard(message.content, index)
                            }
                            className="absolute top-2 -right-8 p-1 rounded-full bg-gray-700 hover:bg-gray-600"
                          >
                            {copiedMessageId === index ? (
                              <FaCheck className="text-green-400 text-sm" />
                            ) : (
                              <FaCopy className="text-gray-300 text-sm" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="flex items-start max-w-[80%]">
                      <Avatar className="h-8 w-8 mr-2 bg-blue-700">
                        <FaRobot />
                      </Avatar>
                      <div className="p-3 rounded-lg bg-gray-800 text-white">
                        <FaSpinner className="animate-spin" />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="pt-4 border-t border-gray-800">
              <form onSubmit={sendMessage} className="flex items-center">
                <Button
                  type="button"
                  onClick={clearChat}
                  className="mr-2 bg-red-900 hover:bg-red-800"
                >
                  <MdOutlineClear className="text-xl text-white" />
                </Button>
                <Input
                  className="mx-2 bg-gray-800 border-gray-700 text-white"
                  placeholder="Type your medical question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(e)}
                />
                <Button
                  type="submit"
                  className="bg-blue-700 hover:bg-blue-600"
                  disabled={loading || !input.trim()}
                >
                  <GrSend className="text-xl text-white" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalAssistant;
