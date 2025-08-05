import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertConversationSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";

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
      
      // Verify conversation belongs to user
      const conversation = await storage.getConversation(conversationId, userId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      const validatedData = insertMessageSchema.parse({
        ...req.body,
        conversationId,
      });

      // Create user message
      const userMessage = await storage.createMessage(validatedData);

      // AI Coordination Logic
      const aiResponses = await coordinateAIResponse(validatedData.content, conversationId);
      
      res.json({ userMessage, aiResponses });
    } catch (error) {
      console.error("Error creating message:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid message data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create message" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// AI Coordination System
async function coordinateAIResponse(userMessage: string, conversationId: string) {
  // Coordinator AI analyzes the message and determines which specialists to involve
  const coordinatorResponse = await analyzeMessage(userMessage);
  
  const responses = [];
  
  // Create coordinator message
  const coordinatorMessage = await storage.createMessage({
    conversationId,
    role: "coordinator",
    content: coordinatorResponse.analysis,
    specialist: "coordinator",
    metadata: { specialists: coordinatorResponse.specialists },
  });
  responses.push(coordinatorMessage);

  // Delegate to specialists
  for (const specialist of coordinatorResponse.specialists) {
    const specialistResponse = await getSpecialistResponse(specialist, userMessage, coordinatorResponse.context);
    const specialistMessage = await storage.createMessage({
      conversationId,
      role: "assistant",
      content: specialistResponse.content,
      specialist: specialist,
      metadata: specialistResponse.metadata,
    });
    responses.push(specialistMessage);
  }

  return responses;
}

async function analyzeMessage(message: string) {
  // Simple keyword-based analysis (in real app, this would use AI)
  const specialists = [];
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('code') || lowerMessage.includes('react') || lowerMessage.includes('javascript') || lowerMessage.includes('component')) {
    specialists.push('code_ai');
  }
  
  if (lowerMessage.includes('design') || lowerMessage.includes('ui') || lowerMessage.includes('ux') || lowerMessage.includes('style')) {
    specialists.push('design_ai');
  }
  
  if (lowerMessage.includes('write') || lowerMessage.includes('content') || lowerMessage.includes('documentation')) {
    specialists.push('writing_ai');
  }
  
  if (lowerMessage.includes('analyze') || lowerMessage.includes('performance') || lowerMessage.includes('optimize')) {
    specialists.push('analysis_ai');
  }

  // Default to code_ai if no specific specialist identified
  if (specialists.length === 0) {
    specialists.push('code_ai');
  }

  return {
    analysis: `I'll coordinate with our specialists to help you: ${specialists.map(s => s.replace('_', ' ')).join(', ')}`,
    specialists,
    context: { originalMessage: message }
  };
}

async function getSpecialistResponse(specialist: string, message: string, context: any) {
  // Simulated specialist responses (in real app, this would call actual AI models)
  const responses = {
    code_ai: {
      content: `I'll help you with the code implementation. Based on your request, I recommend creating a React component with TypeScript for better type safety and maintainability.`,
      metadata: { type: 'code', language: 'javascript' }
    },
    design_ai: {
      content: `For the UI/UX design, I suggest following modern design principles with proper spacing, typography, and accessibility considerations. The design should be responsive and user-friendly.`,
      metadata: { type: 'design', recommendations: ['responsive', 'accessible', 'modern'] }
    },
    writing_ai: {
      content: `I'll help you with clear, concise content that communicates effectively with your users. The writing should be professional yet approachable.`,
      metadata: { type: 'writing', tone: 'professional' }
    },
    analysis_ai: {
      content: `From an analysis perspective, I recommend considering performance implications, scalability, and best practices for long-term maintenance.`,
      metadata: { type: 'analysis', focus: ['performance', 'scalability'] }
    }
  };

  return responses[specialist as keyof typeof responses] || responses.code_ai;
}
