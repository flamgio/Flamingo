import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { aiCoordinator } from "./ai-coordinator";
import { insertConversationSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";

// Format AI response with embedded styling
function formatResponseWithEmbedding(content: string): string {
  if (!content || typeof content !== 'string') return '';
  
  // Apply embedded formatting for greetings and important keywords
  let formatted = content
    // Format greetings
    .replace(/\b(Hello|Hi|Hey|Greetings)\b/gi, '**__$1__**')
    // Format important keywords
    .replace(/\b(Important|Note|Warning|Key|Critical|Essential|Crucial)\b/gi, '**__$1__**')
    // Format technical terms
    .replace(/\b(API|Database|Server|Client|Authentication|Security)\b/gi, '**__$1__**')
    // Format action words
    .replace(/\b(Install|Configure|Setup|Deploy|Build|Test|Debug)\b/gi, '**__$1__**');
  
  return formatted;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Conversation routes
  app.get("/api/conversations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(userId, validatedData);
      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid conversation data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create conversation" });
      }
    }
  });

  // Message routes
  app.get("/api/conversations/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversationId = req.params.id;
      const messages = await storage.getMessages(conversationId, userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/conversations/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversationId = req.params.id;
      const { content, role, selectedModel } = req.body;
      
      // Verify conversation belongs to user
      const conversation = await storage.getConversation(conversationId, userId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      const validatedData = insertMessageSchema.parse({
        content,
        role,
        conversationId,
        selectedModel: selectedModel || "coordinator",
      });

      // Create user message
      const userMessage = await storage.createMessage(validatedData);

      // Generate AI response if user message
      if (role === "user") {
        try {
          // Determine the best AI model for this prompt
          const bestModel = aiCoordinator.selectBestModel(content, selectedModel);
          
          // Generate AI response
          const aiResponse = await aiCoordinator.generateResponse(content, bestModel);
          
          // Create AI message
          const aiMessage = await storage.createMessage({
            conversationId,
            content: aiResponse,
            role: "assistant",
            selectedModel: bestModel,
          });

          res.json({ userMessage, aiMessage });
        } catch (aiError) {
          console.error("Error generating AI response:", aiError);
          res.json({ userMessage });
        }
      } else {
        res.json({ userMessage });
      }
    } catch (error) {
      console.error("Error creating message:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid message data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create message" });
      }
    }
  });

  // Get available AI models
  app.get("/api/ai-models", (req, res) => {
    res.json(aiCoordinator.getAvailableModels());
  });

  // New AI Agent Route with Memory Integration
  app.post("/api/agent", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { prompt, conversationId } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ message: "Prompt is required" });
      }

      // Load user memory for context
      let messages: any[] = [];
      if (conversationId) {
        try {
          messages = await storage.getMessages(conversationId, userId);
        } catch (error) {
          console.warn("Could not load conversation memory:", error);
        }
      }

      // Build context from memory (last 5 messages)
      const recentMessages = messages.slice(-5);
      let contextPrompt = prompt;
      
      if (recentMessages.length > 0) {
        const context = recentMessages
          .map(msg => `${msg.role}: ${msg.content}`)
          .join('\n');
        contextPrompt = `Previous context:\n${context}\n\nCurrent message: ${prompt}`;
      }

      // Route prompt to appropriate AI service  
      const aiAgent = await import('./lib/agent-server');
      const response = await aiAgent.default.routePrompt(contextPrompt, userId);

      // Format response with embedded styling
      const formattedContent = formatResponseWithEmbedding(response.content);

      // Save user message if conversation exists
      if (conversationId) {
        try {
          await storage.createMessage({
            conversationId,
            content: prompt,
            role: "user",
            selectedModel: "user-input"
          });

          // Save AI response
          await storage.createMessage({
            conversationId,
            content: formattedContent,
            role: "assistant", 
            selectedModel: response.model
          });
        } catch (saveError) {
          console.warn("Could not save messages:", saveError);
        }
      }

      res.json({
        content: formattedContent,
        model: response.model,
        source: response.source,
        timestamp: response.timestamp
      });

    } catch (error: any) {
      console.error("Error in AI agent route:", error);
      res.status(500).json({ 
        message: "AI service temporarily unavailable",
        error: error?.message || "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
