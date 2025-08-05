// AI Coordinator - Intelligently selects the best AI model for each prompt

interface AIModel {
  name: string;
  strengths: string[];
  endpoint?: string;
  apiKey?: string;
}

const AI_MODELS: Record<string, AIModel> = {
  coordinator: {
    name: "Coordinator",
    strengths: ["routing", "task_analysis", "model_selection"],
  },
  qwen: {
    name: "Qwen-2.5",
    strengths: ["coding", "technical_analysis", "mathematics", "reasoning"],
  },
  google: {
    name: "Gemini",
    strengths: ["general_knowledge", "creative_writing", "research", "analysis"],
  },
  deepseek: {
    name: "DeepSeek",
    strengths: ["code_generation", "debugging", "system_design", "algorithms"],
  },
};

export class AICoordinator {
  private models: Record<string, AIModel>;

  constructor() {
    this.models = AI_MODELS;
  }

  /**
   * Analyzes the user prompt and selects the best AI model
   */
  selectBestModel(prompt: string, userSelectedModel?: string): string {
    // If user explicitly selected a model, respect their choice
    if (userSelectedModel && userSelectedModel !== "coordinator" && this.models[userSelectedModel]) {
      return userSelectedModel;
    }

    const lowerPrompt = prompt.toLowerCase();

    // Coding-related keywords
    const codingKeywords = [
      "code", "function", "class", "method", "algorithm", "debug", "error",
      "python", "javascript", "typescript", "react", "node", "sql", "html", "css",
      "programming", "software", "development", "api", "database", "loop", "variable"
    ];

    // Creative/research keywords
    const creativeKeywords = [
      "write", "story", "article", "essay", "creative", "research", "analyze",
      "explain", "summarize", "compare", "review", "opinion", "argument"
    ];

    // Math/reasoning keywords
    const mathKeywords = [
      "calculate", "math", "formula", "equation", "solve", "problem", "logic",
      "reasoning", "proof", "theorem", "statistics", "probability"
    ];

    // Count keyword matches
    const codingScore = codingKeywords.filter(keyword => lowerPrompt.includes(keyword)).length;
    const creativeScore = creativeKeywords.filter(keyword => lowerPrompt.includes(keyword)).length;
    const mathScore = mathKeywords.filter(keyword => lowerPrompt.includes(keyword)).length;

    // Select model based on highest score
    if (codingScore > creativeScore && codingScore > mathScore) {
      // For code-heavy tasks, prefer DeepSeek or Qwen
      return lowerPrompt.includes("debug") || lowerPrompt.includes("error") ? "deepseek" : "qwen";
    } else if (mathScore > creativeScore) {
      return "qwen";
    } else if (creativeScore > 0) {
      return "google";
    }

    // Default to Qwen for general technical queries
    return "qwen";
  }

  /**
   * Generates a response using the mock AI system
   */
  async generateResponse(prompt: string, selectedModel: string): Promise<string> {
    const model = this.models[selectedModel] || this.models.qwen;
    
    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Generate contextual responses based on the selected model and prompt
    return this.generateContextualResponse(prompt, selectedModel);
  }

  private generateContextualResponse(prompt: string, modelId: string): string {
    const lowerPrompt = prompt.toLowerCase();

    // Handle coding requests
    if (lowerPrompt.includes("python") && (lowerPrompt.includes("loop") || lowerPrompt.includes("for"))) {
      return this.generatePythonLoopExample();
    }

    if (lowerPrompt.includes("javascript") && lowerPrompt.includes("function")) {
      return this.generateJavaScriptExample();
    }

    if (lowerPrompt.includes("react") || lowerPrompt.includes("component")) {
      return this.generateReactExample();
    }

    if (lowerPrompt.includes("sql") || lowerPrompt.includes("database")) {
      return this.generateSQLExample();
    }

    // Handle general coding questions
    if (lowerPrompt.includes("code") || lowerPrompt.includes("programming")) {
      return this.generateGeneralCodingResponse(prompt, modelId);
    }

    // Handle explanations and analysis
    if (lowerPrompt.includes("explain") || lowerPrompt.includes("how")) {
      return this.generateExplanationResponse(prompt, modelId);
    }

    // Handle math and calculations
    if (lowerPrompt.includes("calculate") || lowerPrompt.includes("math")) {
      return this.generateMathResponse(prompt, modelId);
    }

    // Default intelligent response
    return this.generateIntelligentResponse(prompt, modelId);
  }

  private generatePythonLoopExample(): string {
    return `Here are several Python loop examples:

**For Loop (most common):**
\`\`\`python
# Loop through a range
for i in range(5):
    print(f"Number: {i}")

# Loop through a list
fruits = ["apple", "banana", "orange"]
for fruit in fruits:
    print(f"I like {fruit}")

# Loop with index and value
for index, value in enumerate(fruits):
    print(f"{index}: {value}")
\`\`\`

**While Loop:**
\`\`\`python
count = 0
while count < 5:
    print(f"Count: {count}")
    count += 1
\`\`\`

**List Comprehension (Pythonic way):**
\`\`\`python
# Create a list of squares
squares = [x**2 for x in range(10)]
print(squares)  # [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
\`\`\`

**Nested Loops:**
\`\`\`python
for i in range(3):
    for j in range(3):
        print(f"({i}, {j})")
\`\`\`

Each loop type has its use case. For loops are great for iterating over sequences, while loops for conditions, and list comprehensions for creating new lists efficiently.`;
  }

  private generateJavaScriptExample(): string {
    return `Here are JavaScript function examples:

**Function Declaration:**
\`\`\`javascript
function greetUser(name) {
    return \`Hello, \${name}! Welcome to our app.\`;
}

console.log(greetUser("Alice")); // Hello, Alice! Welcome to our app.
\`\`\`

**Arrow Function:**
\`\`\`javascript
const calculateArea = (length, width) => {
    return length * width;
};

// Or shorter syntax
const calculateArea = (length, width) => length * width;
\`\`\`

**Function with Default Parameters:**
\`\`\`javascript
function createUser(name, role = "user", isActive = true) {
    return {
        name,
        role,
        isActive,
        createdAt: new Date()
    };
}

const user = createUser("John");
console.log(user);
\`\`\`

**Async Function:**
\`\`\`javascript
async function fetchUserData(userId) {
    try {
        const response = await fetch(\`/api/users/\${userId}\`);
        const userData = await response.json();
        return userData;
    } catch (error) {
        console.error("Error fetching user data:", error);
        throw error;
    }
}
\`\`\`

**Higher-Order Function:**
\`\`\`javascript
function withLogging(fn) {
    return function(...args) {
        console.log(\`Calling function with args: \${args}\`);
        const result = fn(...args);
        console.log(\`Function returned: \${result}\`);
        return result;
    };
}

const loggedAdd = withLogging((a, b) => a + b);
loggedAdd(3, 4); // Logs the call and result
\`\`\`

These patterns cover most JavaScript function use cases!`;
  }

  private generateReactExample(): string {
    return `Here's a complete React component example:

**Functional Component with Hooks:**
\`\`\`jsx
import React, { useState, useEffect } from 'react';

function UserProfile({ userId }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchUser() {
            try {
                setLoading(true);
                const response = await fetch(\`/api/users/\${userId}\`);
                if (!response.ok) throw new Error('Failed to fetch user');
                
                const userData = await response.json();
                setUser(userData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchUser();
    }, [userId]);

    const handleUpdateProfile = async (updatedData) => {
        try {
            const response = await fetch(\`/api/users/\${userId}\`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            
            if (response.ok) {
                const updatedUser = await response.json();
                setUser(updatedUser);
            }
        } catch (err) {
            setError('Failed to update profile');
        }
    };

    if (loading) return <div className="spinner">Loading...</div>;
    if (error) return <div className="error">Error: {error}</div>;
    if (!user) return <div>User not found</div>;

    return (
        <div className="user-profile">
            <h2>{user.name}</h2>
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>
            <button 
                onClick={() => handleUpdateProfile({ isActive: !user.isActive })}
                className={user.isActive ? 'btn-danger' : 'btn-success'}
            >
                {user.isActive ? 'Deactivate' : 'Activate'} User
            </button>
        </div>
    );
}

export default UserProfile;
\`\`\`

**Custom Hook Example:**
\`\`\`jsx
// Custom hook for API calls
function useApi(url) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(url)
            .then(response => response.json())
            .then(setData)
            .catch(setError)
            .finally(() => setLoading(false));
    }, [url]);

    return { data, loading, error };
}

// Usage
function App() {
    const { data: users, loading, error } = useApi('/api/users');
    
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
    
    return (
        <div>
            {users.map(user => (
                <UserProfile key={user.id} userId={user.id} />
            ))}
        </div>
    );
}
\`\`\`

This shows modern React patterns with hooks, error handling, and reusable logic!`;
  }

  private generateSQLExample(): string {
    return `Here are essential SQL examples:

**Basic Queries:**
\`\`\`sql
-- Select all users
SELECT * FROM users;

-- Select specific columns
SELECT name, email, created_at FROM users;

-- With conditions
SELECT * FROM users WHERE age >= 18 AND is_active = true;

-- Ordering
SELECT * FROM users ORDER BY created_at DESC LIMIT 10;
\`\`\`

**Joins:**
\`\`\`sql
-- Inner join - users with their orders
SELECT u.name, u.email, o.total, o.created_at
FROM users u
INNER JOIN orders o ON u.id = o.user_id;

-- Left join - all users, with orders if they exist
SELECT u.name, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name;
\`\`\`

**Aggregations:**
\`\`\`sql
-- Count and group
SELECT role, COUNT(*) as user_count
FROM users
GROUP BY role;

-- Advanced aggregation
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as new_users,
    AVG(age) as avg_age
FROM users
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;
\`\`\`

**Data Modification:**
\`\`\`sql
-- Insert
INSERT INTO users (name, email, age, role)
VALUES ('John Doe', 'john@example.com', 25, 'user');

-- Update
UPDATE users 
SET last_login = NOW()
WHERE id = 123;

-- Delete
DELETE FROM users 
WHERE is_active = false AND last_login < NOW() - INTERVAL '1 year';
\`\`\`

**Advanced Queries:**
\`\`\`sql
-- Subquery
SELECT * FROM users
WHERE id IN (
    SELECT user_id FROM orders
    WHERE total > 1000
);

-- Window function
SELECT 
    name,
    total,
    ROW_NUMBER() OVER (ORDER BY total DESC) as ranking
FROM (
    SELECT u.name, SUM(o.total) as total
    FROM users u
    JOIN orders o ON u.id = o.user_id
    GROUP BY u.id, u.name
) user_totals;
\`\`\`

These queries cover most common database operations!`;
  }

  private generateGeneralCodingResponse(prompt: string, modelId: string): string {
    const model = this.models[modelId];
    return `As ${model.name}, I can help you with coding! 

Based on your question about "${prompt}", here are some key points:

**Best Practices:**
- Write clean, readable code with meaningful variable names
- Follow the DRY principle (Don't Repeat Yourself)
- Add comments for complex logic
- Handle errors gracefully
- Write tests for your code

**Common Patterns:**
1. **Separation of Concerns** - Keep different functionalities separate
2. **Single Responsibility** - Each function should do one thing well
3. **Error Handling** - Always anticipate and handle potential errors
4. **Performance** - Optimize for readability first, then performance

Would you like me to provide specific code examples for any particular language or framework? I can generate working examples for Python, JavaScript, TypeScript, React, SQL, and more!`;
  }

  private generateExplanationResponse(prompt: string, modelId: string): string {
    const model = this.models[modelId];
    return `As ${model.name}, I'll explain this clearly:

"${prompt}"

Let me break this down step by step:

1. **Understanding the Core Concept**: The fundamental principle here involves understanding how different components interact with each other.

2. **Key Components**: 
   - Input/Data layer
   - Processing/Logic layer  
   - Output/Presentation layer

3. **How It Works**:
   - Data flows from input to processing
   - Logic transforms the data according to rules
   - Results are presented in a useful format

4. **Real-World Applications**:
   - This pattern appears in web applications (frontend/backend)
   - Database systems (query/processing/results)
   - Machine learning (data/model/predictions)

5. **Benefits**:
   - Modularity and maintainability
   - Easier testing and debugging
   - Scalability and performance optimization

Would you like me to elaborate on any specific part or provide concrete examples with code?`;
  }

  private generateMathResponse(prompt: string, modelId: string): string {
    const model = this.models[modelId];
    return `As ${model.name}, I'll help you with this mathematical problem:

"${prompt}"

**Step-by-Step Solution:**

1. **Identify the Problem Type**: 
   - This appears to be a [algebra/geometry/calculus/statistics] problem
   - Key variables and relationships need to be identified

2. **Set Up the Equation**:
   \`\`\`
   Let x = unknown value
   Given conditions: [list conditions]
   Formula: [relevant formula]
   \`\`\`

3. **Solution Process**:
   - Step 1: Isolate variables
   - Step 2: Apply mathematical operations
   - Step 3: Solve for the unknown
   - Step 4: Verify the answer

4. **Example Calculation**:
   \`\`\`python
   # Python code to solve this
   import math
   
   def solve_problem():
       # Input values
       x = 10
       y = 5
       
       # Calculation
       result = math.sqrt(x**2 + y**2)
       return result
   
   answer = solve_problem()
   print(f"The answer is: {answer}")
   \`\`\`

5. **Verification**: Always check if the answer makes sense in the context of the original problem.

Would you like me to work through a specific numerical example or explain any mathematical concept in more detail?`;
  }

  private generateIntelligentResponse(prompt: string, modelId: string): string {
    const model = this.models[modelId];
    
    return `Hello! I'm ${model.name}, and I'm here to help you with "${prompt}".

Based on my analysis, I understand you're looking for assistance with this topic. Let me provide you with a comprehensive response:

**Key Points to Consider:**

1. **Context Understanding**: I've analyzed your question and identified the main areas where I can provide value.

2. **Structured Approach**: 
   - Problem identification
   - Solution exploration
   - Implementation guidance
   - Best practices

3. **Practical Applications**: I can help you with:
   - Code examples and programming solutions
   - Step-by-step explanations
   - Best practices and optimization tips
   - Troubleshooting and debugging

4. **Next Steps**: 
   - Ask specific questions for detailed answers
   - Request code examples in any programming language
   - Get explanations for complex concepts
   - Explore related topics and advanced techniques

**My Capabilities Include:**
- Code generation in Python, JavaScript, TypeScript, SQL, and more
- Technical explanations and tutorials
- Problem-solving and debugging assistance
- Architecture and design guidance
- Mathematical calculations and analysis

Feel free to ask more specific questions, and I'll provide detailed, practical answers with working code examples!

What would you like to explore further?`;
  }

  /**
   * Get available models
   */
  getAvailableModels(): Record<string, AIModel> {
    return this.models;
  }
}

export const aiCoordinator = new AICoordinator();