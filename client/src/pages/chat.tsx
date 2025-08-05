import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Menu, Settings, Brain, Code, Sparkles } from "lucide-react";
import type { Conversation, Message, User } from "@shared/schema";

// AI Models configuration
const AI_MODELS = {
  coordinator: { name: "Coordinator", icon: Brain, color: "bg-purple-500" },
  qwen: { name: "Qwen-2.5", icon: Code, color: "bg-blue-500" },
  google: { name: "Gemini", icon: Sparkles, color: "bg-green-500" },
  deepseek: { name: "DeepSeek", icon: Code, color: "bg-red-500" },
};

export default function Chat() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth() as { 
    isAuthenticated: boolean; 
    isLoading: boolean; 
    user: User | null; 
  };
  const queryClient = useQueryClient();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("coordinator");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "Redirecting to login...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentConversationId]);

  // Fetch conversations
  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
    enabled: isAuthenticated,
  });

  // Fetch messages for current conversation
  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/conversations", currentConversationId, "messages"],
    enabled: !!currentConversationId && isAuthenticated,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      let conversationId = currentConversationId;
      
      // Create new conversation if none exists
      if (!conversationId) {
        const conversationResponse = await apiRequest("POST", "/api/conversations", {
          title: content.slice(0, 50) + (content.length > 50 ? "..." : "")
        });
        const newConversation = await conversationResponse.json();
        conversationId = newConversation.id;
        setCurrentConversationId(conversationId);
        queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      }

      // Send user message
      const messageResponse = await apiRequest("POST", `/api/conversations/${conversationId}/messages`, {
        content,
        role: "user",
        selectedModel
      });
      
      queryClient.invalidateQueries({ 
        queryKey: ["/api/conversations", conversationId, "messages"] 
      });
      
      return messageResponse.json();
    },
    onSuccess: () => {
      setMessageInput("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Session expired",
          description: "Please sign in again",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!messageInput.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(messageInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your AI workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-600 hover:text-orange-600"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 orange-gradient rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">Flamgio AI</h1>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-orange-600">
                <Settings className="w-5 h-5" />
              </Button>
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.profileImageUrl || undefined} />
                <AvatarFallback className="bg-orange-100 text-orange-700">
                  {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-64 bg-white/90 backdrop-blur-sm border-r border-orange-100 p-4">
            <div className="space-y-4">
              <Button 
                onClick={() => {
                  setCurrentConversationId(null);
                  setSidebarOpen(false);
                }}
                className="w-full orange-gradient text-white"
              >
                New Chat
              </Button>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Recent Chats</h3>
                {conversations.map((conversation) => (
                  <Button
                    key={conversation.id}
                    variant="ghost"
                    className={`w-full justify-start text-left ${
                      currentConversationId === conversation.id ? 'bg-orange-100' : ''
                    }`}
                    onClick={() => {
                      setCurrentConversationId(conversation.id);
                      setSidebarOpen(false);
                    }}
                  >
                    <span className="truncate">{conversation.title}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {!currentConversationId ? (
              <div className="max-w-4xl mx-auto text-center py-20">
                <div className="w-16 h-16 orange-gradient rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Welcome to Flamgio AI
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Your intelligent AI assistant that coordinates multiple models to give you the best answers
                </p>
                
                {/* AI Models showcase */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                  {Object.entries(AI_MODELS).map(([key, model]) => {
                    const IconComponent = model.icon;
                    return (
                      <Card key={key} className="p-4 hover:shadow-md transition-shadow">
                        <div className={`w-10 h-10 ${model.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-sm font-medium text-gray-900">{model.name}</div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-3 max-w-2xl ${
                      message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      {message.role === 'assistant' && (
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Brain className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                      
                      <div className={`px-4 py-3 ${
                        message.role === 'user' 
                          ? 'chat-message-user' 
                          : 'chat-message-assistant'
                      }`}>
                        {message.role === 'assistant' && (
                          <Badge variant="secondary" className="mb-2">
                            {AI_MODELS[message.selectedModel as keyof typeof AI_MODELS]?.name || 'AI Assistant'}
                          </Badge>
                        )}
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                      
                      {message.role === 'user' && (
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarImage src={user?.profileImageUrl || undefined} />
                          <AvatarFallback className="bg-orange-100 text-orange-700">
                            {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                ))}
                
                {sendMessageMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-3 max-w-2xl">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Brain className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="chat-message-assistant px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                          <span className="text-sm text-gray-600">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-orange-100 bg-white/80 backdrop-blur-sm p-4">
            <div className="max-w-4xl mx-auto">
              {/* AI Model Selector */}
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-sm text-gray-600">AI Model:</span>
                {Object.entries(AI_MODELS).map(([key, model]) => {
                  const IconComponent = model.icon;
                  return (
                    <Button
                      key={key}
                      variant={selectedModel === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedModel(key)}
                      className={selectedModel === key ? "orange-gradient text-white" : ""}
                    >
                      <IconComponent className="w-4 h-4 mr-1" />
                      {model.name}
                    </Button>
                  );
                })}
              </div>

              {/* Message Input */}
              <div className="relative">
                <Textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask anything... (Press Enter to send, Shift+Enter for new line)"
                  className="perplexity-input resize-none pr-12 min-h-[60px]"
                  disabled={sendMessageMutation.isPending}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sendMessageMutation.isPending}
                  className="absolute bottom-3 right-3 orange-gradient text-white p-2 h-8 w-8"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}