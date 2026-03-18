# Backend - AI Competitive Programming Coach

This backend serves:

- **Code execution** (Python and Java)
- **AI-powered evaluation** (Deepseek-first, with OpenAI fallback)
- **User problem tracking** (MongoDB)

## Setup

1) Install dependencies:

```bash
cd backend
npm install
```

2) Configure environment variables (copy `.env.example` to `.env`):

```env
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=your_key_here

# Optional fallbacks
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_google_api_key

MONGODB_URI=mongodb://localhost:27017/cpcoach
JWT_SECRET=your_jwt_secret
```

3) Run in dev mode:

```bash
npm run dev
```

## How it works

- `src/controllers/problemsController.js` handles submissions:
  - executes Python/Java
  - captures stdout/stderr
  - calls AI eval for feedback and scoring
  - saves results into MongoDB

- `src/config/llm.js` wraps Deepseek/OpenAI/Gemini and formats prompts.

## Notes

- Java compilation automatically detects `public class <Name>` and uses the correct file name.
- AI feedback includes runtime output and aims to give actionable improvement advice.
