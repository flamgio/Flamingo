# 🔥 Flamgio AI

Flamgio AI is a **privacy-first, full-stack AI chat platform** that seamlessly integrates **local Hugging Face models** and **OpenRouter-powered agents** into a unified, mobile-friendly interface. Designed for developers, researchers, and everyday users, it delivers lightning-fast, intelligent conversations — all while respecting your privacy.

---

## 🚀 Features

- 🧠 **Agent Routing System**: Routes prompts based on complexity to local or OpenRouter models.
- 🗂️ **Conversation Memory**: Saves user chat history via PostgreSQL (per-user basis).
- 💬 **Dynamic Chat UI**: Perplexity-style responsive layout with Light/Dark modes.
- 🔄 **Model Failover System**: Automatically switches models on error or rate limit.
- 📦 **Modular Backend API**: Clean `/api/agent` structure with markdown-enhanced responses.
- 🎨 **Animated UI Design**: Smooth scrolling, modern gradients, and mobile-first design.
- 🌐 **Deploy-Ready**: Optimized for Vercel deployment and 100% API key-ready.

---

## 🧠 Models Used

Supports the following **7 free OpenRouter models**:

1. `moonshotai/kimi-k2`  
2. `moonshotai/kimi-dev-72b`  
3. `mistralai/mixtral-8x7b-instruct`  
4. `gryphe/mythomax-l2-13b`  
5. `nousresearch/nous-capybara-7b`  
6. `moonshotai/kimi-vl-a3b-thinking`  
7. `meta-llama/llama-3.3-70b-instruct`

---

## 🧩 Tech Stack

- **Frontend**: Next.js, Tailwind CSS, Framer Motion  
- **Backend**: Node.js, PostgreSQL, REST API  
- **AI**: Hugging Face Spaces, OpenRouter  
- **Hosting**: Replit, Vercel, GitHub  

---

## 📦 Installation

```bash
git clone https://github.com/YOUR_USERNAME/flamgio.git
cd flamgio
npm install
```

Set up your `.env` file (see `.env.example`) and run:

```bash
npm run dev
```

---

## 📄 Environment Variables

```env
HF_LOCAL_URL=your_huggingface_local_url
OPENROUTER_KEY=your_openrouter_api_key
DATABASE_URL=your_postgresql_connection
```

---

## 🛠 Project Structure

```
/lib
  ├─ agent.js        → Handles AI routing logic
  ├─ memory.js       → Loads/saves chat memory
/pages
  ├─ api/agent.js    → Main backend endpoint
/components
  ├─ ChatUI.jsx      → unique chat layout
.env.example
```

---

## 👤 Author

Created by [@Ghanist.]

---

## 📝 License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.
