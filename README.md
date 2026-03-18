# AI Competitive Programming Coach

A lightweight web app for logging practice problems, running code (Python/Java), and getting AI-powered feedback on your solutions.

## ✅ Features

- **Run code locally** for Python and Java (captures stdout/stderr and compilation/runtime errors).
- **AI analysis** of submitted code (Deepseek-first) that provides:
  - feedback based on actual execution output/errors
  - a numeric score (0–100)
  - actionable improvement suggestions
- **Per-user history** (past submissions, scores, topics, and dates)
- **Interview practice** and AI coaching (recommendations, hints, performance analysis)

## 🚀 Getting Started

### 1) Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2) Configure environment variables

Copy and edit the `.env` file in `backend/`:

```env
MONGO_URI=mongodb://localhost:27017/cpcoach
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
DEEPSEEK_API_KEY=your_deepseek_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_google_gemini_api_key_here
LLM_PROVIDER=deepseek
NODE_ENV=production
```

For frontend, the `.env` file is already configured with:

```env
VITE_API_BASE_URL=http://localhost:5000
```

### 3) Start the app

```bash
# Backend
cd backend
npm run dev  # or npm start for production

# Frontend
cd ../frontend
npm run dev  # or npm run build && npm run preview for production
```

Then open the UI at `http://localhost:5174`.

## 🧪 Using the App

1. Go to **Problems**.
2. Enter a problem name/description, choose a topic, and paste your **Python** or **Java** solution.
3. Submit to run the code and see:
   - execution output or error
   - AI feedback and score
   - pass/fail status

## ✅ Notes

- Java code needs either:
  - `public class Main { ... }`, or
  - `public class <YourName>` (the runner will detect the class and compile it accordingly)

- AI feedback is based on both your code and the actual runtime output (stdout/stderr) so it reflects real performance.

---

## 🚀 Deployment

### Backend Deployment

1. Set up a Node.js server (e.g., Heroku, Vercel, AWS, DigitalOcean).
2. Copy `.env.example` to `.env` and fill with production values.
3. Run `npm start` (uses PM2 or similar for production).

### Frontend Deployment

1. Build the app: `npm run build`
2. Deploy the `dist/` folder to a static host (e.g., Vercel, Netlify, GitHub Pages).
3. Update `VITE_API_BASE_URL` in `.env` to point to your backend URL.

### Example: Deploy to Vercel

- Backend: Deploy to Vercel with Node.js runtime.
- Frontend: Deploy to Vercel, set `VITE_API_BASE_URL` to backend URL.

---

## 🧩 Project Structure

- `backend/` – Express API, code execution, AI integration, MongoDB storage
- `frontend/` – React UI (Vite)

---

If you want to improve the AI feedback further (e.g., add linting, more structured test cases, or a custom difficulty-based rubric), just ask!