/**
 * Server-side AI Agent System - Routes user prompts to appropriate AI models
 * Supports both local Hugging Face Spaces and OpenRouter models
 */

// OpenRouter free models with priority order
const OPENROUTER_MODELS = [
  'moonshotai/kimi-k2:free',
  'moonshotai/kimi-dev-72b:free', 
  'mistralai/mixtral-8x7b-instruct:free',
  'gryphe/mythomax-l2-13b:free',
  'nousresearch/nous-capybara-7b:free',
  'moonshotai/kimi-vl-a3b-thinking:free',
  'meta-llama/llama-3.3-70b-instruct:free'
];

class ServerAIAgent {
  private currentModelIndex: number = 0;
  private fallbackAttempts: number = 0;
  private maxFallbackAttempts: number = OPENROUTER_MODELS.length;

  /**
   * Analyzes prompt complexity to determine routing strategy
   */
  analyzeComplexity(prompt: string): boolean {
    if (!prompt || typeof prompt !== 'string') return false;
    
    const wordCount = prompt.trim().split(/\s+/).length;
    const charCount = prompt.length;
    
    // Complexity indicators
    const complexKeywords = [
      'analyze', 'complex', 'detailed', 'comprehensive', 'explain',
      'research', 'compare', 'evaluate', 'strategy', 'algorithm',
      'architecture', 'design', 'implement', 'optimize', 'refactor',
      'debug', 'troubleshoot', 'performance', 'security', 'scalability'
    ];
    
    const hasComplexKeywords = complexKeywords.some(keyword => 
      prompt.toLowerCase().includes(keyword)
    );
    
    // Decision logic: use OpenRouter for complex prompts
    return (
      wordCount > 50 ||           // Long prompts
      charCount > 300 ||          // Detailed prompts  
      hasComplexKeywords ||       // Complex terminology
      prompt.includes('```') ||   // Code blocks
      prompt.split('\n').length > 5  // Multi-line prompts
    );
  }

  /**
   * Routes prompt to appropriate AI service
   */
  async routePrompt(prompt: string, userId: string): Promise<any> {
    const isComplex = this.analyzeComplexity(prompt);
    
    try {
      if (isComplex) {
        return await this.callOpenRouter(prompt, userId);
      } else {
        return await this.callHuggingFace(prompt, userId);
      }
    } catch (error) {
      console.error('Primary routing failed:', error);
      
      // Fallback strategy
      if (isComplex) {
        console.log('Falling back to Hugging Face...');
        return await this.callHuggingFace(prompt, userId);
      } else {
        console.log('Falling back to OpenRouter...');
        return await this.callOpenRouter(prompt, userId);
      }
    }
  }

  /**
   * Call Hugging Face Spaces model
   */
  async callHuggingFace(prompt: string, userId: string): Promise<any> {
    const HF_LOCAL_URL = process.env.HF_LOCAL_URL || 'http://localhost:7860/api/generate';
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(HF_LOCAL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HF Spaces API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        content: this.formatResponse(data.generated_text || data.output || data.response || 'No response generated'),
        model: 'Local Model',
        source: 'huggingface',
        userId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Hugging Face API call failed:', error);
      throw error;
    }
  }

  /**
   * Call OpenRouter API with fallback support
   */
  async callOpenRouter(prompt: string, userId: string): Promise<any> {
    const OPENROUTER_KEY = process.env.OPENROUTER_KEY;
    
    if (!OPENROUTER_KEY) {
      throw new Error('OpenRouter API key not configured');
    }

    // Try each model in sequence until one works
    for (let i = 0; i < this.maxFallbackAttempts; i++) {
      const modelIndex = (this.currentModelIndex + i) % OPENROUTER_MODELS.length;
      const model = OPENROUTER_MODELS[modelIndex];
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000);

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://flamgio.ai',
            'X-Title': 'Flamgio AI Chat'
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 4000,
            temperature: 0.7,
            top_p: 0.9,
            frequency_penalty: 0,
            presence_penalty: 0
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.status === 429) {
          console.log(`Rate limit hit for ${model}, trying next model...`);
          continue;
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`OpenRouter API error for ${model}:`, response.status, errorText);
          continue;
        }

        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          console.error(`Invalid response structure from ${model}:`, data);
          continue;
        }

        // Success! Update current model index for next request
        this.currentModelIndex = modelIndex;
        this.fallbackAttempts = 0;

        return {
          content: this.formatResponse(data.choices[0].message.content),
          model: this.getModelDisplayName(model),
          source: 'openrouter',
          modelId: model,
          userId,
          timestamp: new Date().toISOString()
        };

      } catch (error) {
        console.error(`Error with model ${model}:`, error);
        continue;
      }
    }

    throw new Error('All OpenRouter models failed or hit rate limits');
  }

  /**
   * Format AI response with embedded styling
   */
  formatResponse(content: string): string {
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

  /**
   * Get user-friendly model display name
   */
  getModelDisplayName(modelId: string): string {
    const modelNames: Record<string, string> = {
      'moonshotai/kimi-k2:free': 'OpenRouter – Kimi-K2',
      'moonshotai/kimi-dev-72b:free': 'OpenRouter – Kimi-Dev-72B',
      'mistralai/mixtral-8x7b-instruct:free': 'OpenRouter – Mixtral-8x7B',
      'gryphe/mythomax-l2-13b:free': 'OpenRouter – MythoMax-L2',
      'nousresearch/nous-capybara-7b:free': 'OpenRouter – Nous-Capybara',
      'moonshotai/kimi-vl-a3b-thinking:free': 'OpenRouter – Kimi-VL-A3B',
      'meta-llama/llama-3.3-70b-instruct:free': 'OpenRouter – Llama-3.3-70B'
    };
    
    return modelNames[modelId] || `OpenRouter – ${modelId.split('/')[1]}`;
  }

  /**
   * Reset fallback state (call this periodically)
   */
  resetFallbackState(): void {
    this.currentModelIndex = 0;
    this.fallbackAttempts = 0;
  }
}

export default new ServerAIAgent();