# 📚 LearnAI

An AI‑powered learning workspace built with **Next.js 14**, **TypeScript**, and **Tailwind CSS**. It turns raw study notes into structured learning assets: smart flashcards, adaptive quizzes, and a conversational study buddy. Recently enhanced with deck analytics, difficulty tagging, exports, persistence, and dark mode.

## ✨ Core Features

### 🃏 Flashcard Maker
- Paste notes → Generate a full deck automatically
- Click to flip cards (Space / ← → navigation)
- Difficulty tagging (Easy / Med / Hard)
- Recall tracking (I knew it / Need review)
- Progress bar + per‑card stats
- Export: **JSON**, **CSV**, **Anki-style TSV**

### 📝 Quiz Maker
- Automatic multiple‑choice quiz generation
- Keyboard answering (1–9) with instant feedback
- Inline explanations after answering
- Score tracking + results summary

### 🤖 Study Buddy
- Conversational Q&A for any topic
- Follows your context and lets you refine understanding
- Lightweight chat history persistence

### 🎛 Experience & UI
- Dark / Light theme toggle (persistent)
- Glassmorphism gradients + animated background orbs
- LocalStorage persistence (theme, decks, quizzes, chat)
- Toast notifications (success/error/info)
- Keyboard shortcuts modal
- Accessible focus & semantic structure

### 📦 Coming Soon (Planned)
- True spaced repetition intervals
- Import decks (JSON / CSV / Anki)
- Advanced analytics dashboard (retention curves)
- Markdown + KaTeX rendering

## 🚀 Getting Started

### Installation

1. Navigate to the nextjs-app directory:
```bash
cd nextjs-app
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

```
nextjs-app/
├── app/
│   ├── api/
│   │   ├── flashcards/
│   │   │   └── route.ts          # Flashcard generation endpoint
│   │   ├── quiz/
│   │   │   └── route.ts          # Quiz generation endpoint
│   │   └── study-buddy/
│   │       └── route.ts          # Study buddy chat endpoint
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout component
│   └── page.tsx                  # Main interface with all features
├── package.json                  # Dependencies and scripts
└── tsconfig.json                 # TypeScript configuration
```

## 🎯 How to Use

### Flashcard Maker
1. Open the Flashcards tab
2. Paste any notes (lecture, textbook, summary)
3. Generate → Flip with mouse or press Space
4. Adjust difficulty or mark recall to build retention stats
5. Export if needed (JSON / CSV / Anki TSV)

### Quiz Maker
1. Go to Quiz tab
2. Paste source content
3. Generate quiz
4. Answer using mouse or number keys (1–9)
5. Read explanation before auto‑advancing

### Study Buddy
1. Open Study Buddy tab
2. Ask a question (Enter to send)
3. Use answers to refine follow‑ups

## 🤖 AI Model

Back‑end API routes expect a local Ollama runtime (adjust as needed). Default model suggestion: `llama3.2:1b` (lightweight) or upgrade to `llama3` / `mistral` depending on accuracy vs. speed.

Pull example:
```bash
ollama pull llama3
```

## 🎨 Customization Guide

| Area | File | Notes |
|------|------|-------|
| UI Layout | `app/page.tsx` | Main interface (consider extracting components) |
| Global Styles | `app/globals.css` | Theme tokens, utilities, glass, animations |
| API (Flashcards) | `app/api/flashcards/route.ts` | Adjust prompt / parsing |
| API (Quiz) | `app/api/quiz/route.ts` | Tune question count / difficulty |
| API (Study Buddy) | `app/api/study-buddy/route.ts` | Conversation style |
| Tailwind Config | `tailwind.config.js` | Animations, dark mode, scanning |

Suggested cleanups if scaling:
- Extract components into `app/components/` (FlashcardView, QuizPanel, ChatPanel, Toasts)
- Introduce state management (Zustand or Context) for deck & quiz state
- Add unit tests for prompt formatting (Jest / Vitest)

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + custom utility classes |
| AI Runtime | Ollama (local models) |
| State Persistence | LocalStorage (theme, decks, quiz, chat) |
| Animations | Tailwind keyframes + CSS gradients |

## 📖 Use Cases

- Students: Summarize lectures into decks
- Instructors: Generate formative quizzes
- Self‑learners: Explore topics conversationally
- Rapid revision: Difficulty‑tag and focus on weak areas

## 🔐 Environment & Secrets
If you integrate remote LLM providers (OpenAI, Anthropic, etc.), create an `.env.local`:
```
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
```
Never commit real keys—`.env*` is ignored by Git.

## 🧪 Testing (Suggested)
Add a minimal test setup:
```
devDependencies: jest / ts-jest / @testing-library/react
```
Potential targets:
- Prompt construction functions
- Flashcard export utilities
- Difficulty update logic

## 🗺 Roadmap (Short List)
- [ ] Spaced repetition scheduling
- [ ] Deck import (JSON/CSV/Anki TSV)
- [ ] Analytics dashboard with charts
- [ ] Markdown + math rendering
- [ ] Offline PWA mode

## 🤝 Contributing
PRs welcome. Suggested workflow:
1. Fork & branch (`feat/your-feature`)
2. Update docs & tests if applicable
3. Run lint/build locally
4. Open PR with clear description / screenshots


Enjoy faster learning. If this helps you, consider starring the repo or sharing with classmates! 🚀
