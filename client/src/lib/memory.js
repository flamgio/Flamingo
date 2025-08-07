/**
 * Memory System - Manages user conversation history and context
 * Integrates with PostgreSQL database for persistent storage
 */

class MemorySystem {
  constructor() {
    this.cache = new Map(); // In-memory cache for recent conversations
    this.maxCacheSize = 100;
    this.maxMemoryLength = 10; // Keep last 10 conversation turns
  }

  /**
   * Load user's conversation memory from database
   * @param {string} userId - User identifier
   * @param {string} conversationId - Current conversation ID
   * @returns {Promise<Array>} - Array of message objects
   */
  async loadMemory(userId, conversationId) {
    try {
      // Check cache first
      const cacheKey = `${userId}:${conversationId}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      // Fetch from database via API
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          // New conversation, return empty memory
          return [];
        }
        throw new Error(`Failed to load memory: ${response.status}`);
      }

      const messages = await response.json();
      
      // Process and format messages for AI context
      const formattedMemory = this.formatMessagesForContext(messages);
      
      // Cache the result
      this.updateCache(cacheKey, formattedMemory);
      
      return formattedMemory;
    } catch (error) {
      console.error('Error loading memory:', error);
      return []; // Return empty memory on error
    }
  }

  /**
   * Save new message to user's memory
   * @param {string} userId - User identifier
   * @param {string} conversationId - Conversation ID
   * @param {Object} message - Message object to save
   * @returns {Promise<Object>} - Saved message with ID
   */
  async saveMessage(userId, conversationId, message) {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: message.role,
          content: message.content,
          selectedModel: message.model || 'unknown'
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to save message: ${response.status}`);
      }

      const savedMessage = await response.json();
      
      // Update cache
      const cacheKey = `${userId}:${conversationId}`;
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        cached.push(this.formatMessageForContext(savedMessage));
        this.trimMemory(cached);
        this.cache.set(cacheKey, cached);
      }

      return savedMessage;
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  /**
   * Create a new conversation for the user
   * @param {string} userId - User identifier  
   * @param {string} title - Conversation title
   * @returns {Promise<Object>} - Created conversation object
   */
  async createConversation(userId, title) {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title || 'New Chat'
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create conversation: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  /**
   * Get user's conversation list
   * @param {string} userId - User identifier
   * @returns {Promise<Array>} - Array of conversation objects
   */
  async getConversations(userId) {
    try {
      const response = await fetch('/api/conversations', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load conversations: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error loading conversations:', error);
      return [];
    }
  }

  /**
   * Format messages for AI context window
   * @param {Array} messages - Raw message objects from database
   * @returns {Array} - Formatted messages for AI
   */
  formatMessagesForContext(messages) {
    if (!Array.isArray(messages)) return [];
    
    const formatted = messages
      .filter(msg => msg.role && msg.content)
      .map(msg => this.formatMessageForContext(msg))
      .slice(-this.maxMemoryLength); // Keep only recent messages
    
    return formatted;
  }

  /**
   * Format single message for AI context
   * @param {Object} message - Message object
   * @returns {Object} - Formatted message
   */
  formatMessageForContext(message) {
    return {
      role: message.role,
      content: message.content,
      model: message.selectedModel,
      timestamp: message.createdAt,
      id: message.id
    };
  }

  /**
   * Build context string for AI from conversation memory
   * @param {Array} memory - Array of formatted messages
   * @param {number} maxTokens - Maximum tokens to include (approximate)
   * @returns {string} - Context string for AI
   */
  buildContextString(memory, maxTokens = 2000) {
    if (!Array.isArray(memory) || memory.length === 0) {
      return '';
    }

    let context = 'Previous conversation context:\n\n';
    let totalLength = context.length;
    const maxLength = maxTokens * 4; // Rough token estimation (4 chars per token)

    // Add messages from most recent backwards until we hit the limit
    for (let i = memory.length - 1; i >= 0; i--) {
      const message = memory[i];
      const messageText = `${message.role}: ${message.content}\n\n`;
      
      if (totalLength + messageText.length > maxLength) {
        break;
      }
      
      context = `${message.role}: ${message.content}\n\n` + context.slice(context.indexOf('\n\n') + 2);
      totalLength += messageText.length;
    }

    return context + '\nCurrent conversation:\n';
  }

  /**
   * Generate conversation title from first message
   * @param {string} firstMessage - User's first message
   * @returns {string} - Generated title
   */
  generateConversationTitle(firstMessage) {
    if (!firstMessage || typeof firstMessage !== 'string') {
      return 'New Chat';
    }

    // Take first 50 characters and clean up
    let title = firstMessage.slice(0, 50).trim();
    
    // Remove code blocks and markdown
    title = title.replace(/```[\s\S]*?```/g, '[code]');
    title = title.replace(/`([^`]+)`/g, '$1');
    title = title.replace(/[*_~]/g, '');
    
    // Clean up and truncate
    title = title.replace(/\s+/g, ' ').trim();
    
    if (title.length > 30) {
      title = title.slice(0, 30) + '...';
    }
    
    return title || 'New Chat';
  }

  /**
   * Trim memory to maximum length
   * @param {Array} memory - Memory array to trim
   */
  trimMemory(memory) {
    if (memory.length > this.maxMemoryLength) {
      memory.splice(0, memory.length - this.maxMemoryLength);
    }
  }

  /**
   * Update cache with size management
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   */
  updateCache(key, value) {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, value);
  }

  /**
   * Clear cache for a specific user/conversation
   * @param {string} userId - User identifier
   * @param {string} conversationId - Conversation ID (optional)
   */
  clearCache(userId, conversationId = null) {
    if (conversationId) {
      const cacheKey = `${userId}:${conversationId}`;
      this.cache.delete(cacheKey);
    } else {
      // Clear all cache entries for user
      for (const key of this.cache.keys()) {
        if (key.startsWith(`${userId}:`)) {
          this.cache.delete(key);
        }
      }
    }
  }

  /**
   * Get memory statistics for debugging
   * @returns {Object} - Memory stats
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      maxCacheSize: this.maxCacheSize,
      maxMemoryLength: this.maxMemoryLength,
      cachedConversations: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export default new MemorySystem();