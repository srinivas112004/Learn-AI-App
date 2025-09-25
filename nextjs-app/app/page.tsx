"use client"

import React, { useEffect, useState, useCallback, useRef } from 'react'

interface Flashcard {
  front: string
  back: string
  difficulty?: 'easy' | 'med' | 'hard'
  lastSeenAt?: number
  successCount?: number
  failCount?: number
}

interface QuizQuestion {
  question: string
  options: string[]
  correct: number
  explanation: string
}

// Simple toast system
interface Toast { id: string; message: string; type?: 'info' | 'success' | 'error'; }

export default function LearnAI() {
  const [activeTab, setActiveTab] = useState('flashcards')
  const [loading, setLoading] = useState(false)
  const [dark, setDark] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4200)
  }, [])

  // Flashcard states
  const [notes, setNotes] = useState('')
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentCard, setCurrentCard] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // Quiz states
  const [quizText, setQuizText] = useState('')
  const [quiz, setQuiz] = useState<QuizQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  // Study Buddy states
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [chatHistory, setChatHistory] = useState<{ question: string; answer: string }[]>([])

  useEffect(() => {
    // keyboard nav for cards and quiz
    const handler = (e: KeyboardEvent) => {
      if (activeTab === 'flashcards') {
        if (e.key === 'ArrowRight') nextCard()
        if (e.key === 'ArrowLeft') prevCard()
        if (e.key === ' ') setFlipped((f) => !f)
      }
      if (activeTab === 'quiz' && quiz.length > 0 && selectedAnswer === null) {
        if (e.key >= '1' && e.key <= '9') {
          const idx = parseInt(e.key, 10) - 1
          if (idx < (quiz[currentQuestion]?.options.length ?? 0)) selectAnswer(idx)
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeTab, quiz, currentQuestion, selectedAnswer, flashcards.length])

  const generateFlashcards = async () => {
    if (!notes.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      })

      const data = await response.json()
      if (data.flashcards) {
        const enriched: Flashcard[] = data.flashcards.map((c: Flashcard) => ({
          ...c,
          difficulty: 'med',
          successCount: 0,
          failCount: 0,
        }))
        setFlashcards(enriched)
        setCurrentCard(0)
        setFlipped(false)
        addToast('Flashcards generated ✅', 'success')
      }
    } catch (error) {
      console.error('Error generating flashcards:', error)
      addToast('Failed to generate flashcards', 'error')
    }
    setLoading(false)
  }

  const generateQuiz = async () => {
    if (!quizText.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: quizText })
      })

      const data = await response.json()
      if (data.quiz) {
        setQuiz(data.quiz)
        setCurrentQuestion(0)
        setSelectedAnswer(null)
        setShowResults(false)
        setScore(0)
        addToast('Quiz ready! 🧠', 'success')
      }
    } catch (error) {
      console.error('Error generating quiz:', error)
      addToast('Quiz generation failed', 'error')
    }
    setLoading(false)
  }

  const askStudyBuddy = async () => {
    if (!question.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/study-buddy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      })

      const data = await response.json()
      if (data.answer) {
        const newChat = { question, answer: data.answer }
        setChatHistory((prev) => [...prev, newChat])
        setAnswer(data.answer)
        setQuestion('')
        addToast('Answer received 🤖', 'success')
      }
    } catch (error) {
      console.error('Error asking study buddy:', error)
      addToast('Error getting answer', 'error')
    }
    setLoading(false)
  }

  const nextCard = () => {
    if (currentCard < flashcards.length - 1) {
      setCurrentCard((c) => c + 1)
      setFlipped(false)
    }
  }

  const prevCard = () => {
    if (currentCard > 0) {
      setCurrentCard((c) => c - 1)
      setFlipped(false)
    }
  }

  const selectAnswer = (answerIndex: number) => {
    if (!quiz.length) return
    setSelectedAnswer(answerIndex)

    if (answerIndex === quiz[currentQuestion].correct) {
      setScore((s) => s + 1)
    }

    setTimeout(() => {
      if (currentQuestion < quiz.length - 1) {
        setCurrentQuestion((q) => q + 1)
        setSelectedAnswer(null)
      } else {
        setShowResults(true)
      }
    }, 900)
  }

  // Update flashcard difficulty
  const updateDifficulty = (level: Flashcard['difficulty']) => {
    setFlashcards(cards => cards.map((c,i) => i === currentCard ? { ...c, difficulty: level } : c))
  }

  // Record recall result
  const recordRecall = (correct: boolean) => {
    setFlashcards(cards => cards.map((c,i) => i === currentCard ? {
      ...c,
      lastSeenAt: Date.now(),
      successCount: (c.successCount||0) + (correct ? 1 : 0),
      failCount: (c.failCount||0) + (!correct ? 1 : 0)
    } : c))
    addToast(correct ? 'Marked as remembered ✅' : 'Marked for review 🔁', correct ? 'success' : 'info')
  }

  // Export deck in various formats
  const exportDeck = async (format: 'json' | 'csv' | 'anki') => {
    if (!flashcards.length) return addToast('No cards to export', 'error')
    setExporting(true)
    try {
      let blob: Blob
      if (format === 'json') {
        blob = new Blob([JSON.stringify(flashcards, null, 2)], { type: 'application/json' })
      } else if (format === 'csv') {
        const header = 'front,back,difficulty,successCount,failCount\n'
        const rows = flashcards.map(c => [c.front.replace(/"/g,'""'), c.back.replace(/"/g,'""'), c.difficulty||'', c.successCount||0, c.failCount||0].map(v => `"${v}"`).join(',')).join('\n')
        blob = new Blob([header + rows], { type: 'text/csv' })
      } else { // anki-style TSV
        const rows = flashcards.map(c => `${c.front}\t${c.back}`).join('\n')
        blob = new Blob([rows], { type: 'text/tab-separated-values' })
      }
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `learnai_deck_${format}.${format === 'anki' ? 'txt' : format}`
      a.click()
      URL.revokeObjectURL(url)
      addToast(`Exported as ${format.toUpperCase()}`,'success')
    } catch {
      addToast('Export failed','error')
    }
    setExporting(false)
  }

  // Persistence hydration
  useEffect(() => {
    try {
      const theme = localStorage.getItem('learnai.theme')
      if (theme) setDark(theme === 'dark')
      const savedCards = localStorage.getItem('learnai.flashcards')
      if (savedCards) setFlashcards(JSON.parse(savedCards))
      const savedQuiz = localStorage.getItem('learnai.quiz')
      if (savedQuiz) setQuiz(JSON.parse(savedQuiz))
      const savedChat = localStorage.getItem('learnai.chat')
      if (savedChat) setChatHistory(JSON.parse(savedChat))
    } catch {/* ignore */}
    setHydrated(true)
  }, [])
  useEffect(() => { if (hydrated) localStorage.setItem('learnai.theme', dark ? 'dark' : 'light') }, [dark, hydrated])
  useEffect(() => { if (hydrated) localStorage.setItem('learnai.flashcards', JSON.stringify(flashcards)) }, [flashcards, hydrated])
  useEffect(() => { if (hydrated) localStorage.setItem('learnai.quiz', JSON.stringify(quiz)) }, [quiz, hydrated])
  useEffect(() => { if (hydrated) localStorage.setItem('learnai.chat', JSON.stringify(chatHistory)) }, [chatHistory, hydrated])

  const stats = React.useMemo(() => {
    const total = flashcards.length
    const byDiff = { easy: 0, med: 0, hard: 0 }
    let totalSuccess = 0, totalFail = 0
    flashcards.forEach(c => {
      if (c.difficulty) (byDiff as any)[c.difficulty]++
      totalSuccess += c.successCount || 0
      totalFail += c.failCount || 0
    })
    return { total, byDiff, totalSuccess, totalFail }
  }, [flashcards])

  // Apply dark class to <html> so global .dark body styles work
  useEffect(() => {
    const root = document.documentElement
    if (dark) root.classList.add('dark')
    else root.classList.remove('dark')
  }, [dark])

  return (
    <div>
      <div className="min-h-screen relative overflow-hidden transition-colors duration-500">
        {/* Animated decorative orbs */}
        <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen">
          <div className="absolute w-72 h-72 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-400 rounded-full blur-3xl top-[-80px] left-[-60px] animate-float-slow" />
          <div className="absolute w-80 h-80 bg-gradient-to-br from-indigo-500 via-sky-500 to-teal-400 rounded-full blur-3xl bottom-[-120px] right-[-80px] animate-float-slow" style={{ animationDelay: '1.2s' }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-5 py-8 md:py-12">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur shadow-glow">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold gradient-brand-text tracking-tight">LearnAI</h1>
                <p className="text-xs md:text-sm text-white/70 max-w-xs">Flashcards • Quizzes • Study Buddy — AI that adapts to your learning</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowShortcuts(true)} className="hidden md:inline-flex px-3 py-2 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/20 text-white transition card-hover">⌨️ Shortcuts</button>
              <button onClick={() => setDark(d => !d)} className="w-11 h-11 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition" aria-label="Toggle theme" title="Toggle theme">{dark ? '🌙' : '🌞'}</button>
              <button onClick={() => addToast('Coming soon: user profiles')} className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold shadow-lg hover:shadow-2xl transition card-hover">Beta</button>
            </div>
          </div>

          {/* Nav */}
            <nav className="flex flex-wrap gap-2 mb-8 bg-white/10 backdrop-blur p-2 rounded-2xl border border-white/10">
              {[
                { id: 'flashcards', label: '🃏 Flashcards', hint: 'Generate study decks' },
                { id: 'quiz', label: '📝 Quiz Maker', hint: 'Adaptive questioning' },
                { id: 'study-buddy', label: '🤖 Study Buddy', hint: 'Conversational help' }
              ].map(tab => {
                const active = activeTab === tab.id
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} aria-pressed={active} className={`group relative px-5 py-3 rounded-xl text-sm font-medium transition overflow-hidden ${active ? 'bg-gradient-to-r from-white to-white/80 text-purple-600 shadow-glow' : 'text-white/80 hover:text-white hover:bg-white/10'} focus:outline-none focus-visible:ring-2 ring-white/40`}> 
                    <span className="relative z-10 flex items-center gap-2">{tab.label}</span>
                    {active && <span className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10" />}
                    {!active && <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-r from-white/5 to-white/0" />}
                  </button>
                )
              })}
            </nav>

          {/* Hero (only when no data yet) */}
          {flashcards.length === 0 && quiz.length === 0 && chatHistory.length === 0 && (
            <section className="mb-10 grid gap-6 md:grid-cols-3">
              <div className="glass rounded-2xl p-5 md:col-span-2 flex flex-col justify-between card-hover">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">Turn any notes into smart study assets ✨</h2>
                  <p className="text-white/70 mb-5 max-w-lg text-sm md:text-base">Drop in your class notes, textbook extracts, or concepts. Get structured flashcards, adaptive quizzes, and conversational explanations instantly.</p>
                  <div className="flex flex-wrap gap-3 text-xs md:text-sm">
                    <span className="px-3 py-1 rounded-full bg-white/10 text-white/80">No signup needed</span>
                    <span className="px-3 py-1 rounded-full bg-white/10 text-white/80">Keyboard friendly</span>
                    <span className="px-3 py-1 rounded-full bg-white/10 text-white/80">Copy & Export</span>
                    <span className="px-3 py-1 rounded-full bg-white/10 text-white/80">Dark mode</span>
                  </div>
                </div>
                <div className="mt-6 flex gap-4">
                  <button onClick={() => setActiveTab('flashcards')} className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow-lg hover:shadow-xl transition">Create Flashcards</button>
                  <button onClick={() => setActiveTab('quiz')} className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition">Generate Quiz</button>
                </div>
              </div>
              <div className="space-y-5">
                <div className="glass rounded-2xl p-4 text-white card-hover">
                  <h3 className="font-semibold mb-2">⚡ Fast & Simple</h3>
                  <p className="text-sm text-white/70">Type, paste, learn. Minimal friction design keeps you in the flow.</p>
                </div>
                <div className="glass rounded-2xl p-4 text-white card-hover">
                  <h3 className="font-semibold mb-2">🧠 Smart Formatting</h3>
                  <p className="text-sm text-white/70">Generated content stays concise and exam-focused.</p>
                </div>
                <div className="glass rounded-2xl p-4 text-white card-hover">
                  <h3 className="font-semibold mb-2">📎 Portable</h3>
                  <p className="text-sm text-white/70">Copy JSON or raw text for Anki or study groups.</p>
                </div>
              </div>
            </section>
          )}

          <main className="space-y-10">
          {/* FLASHCARDS */}
          {activeTab === 'flashcards' && (
            <section className="glass rounded-2xl p-6 border border-white/10 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">🃏 Flashcard Maker <span className="text-xs font-normal px-2 py-1 rounded-full bg-white/10">Beta</span></h2>
                <div className="text-white/80">{flashcards.length ? `${currentCard + 1}/${flashcards.length}` : 'No cards yet'}</div>
              </div>
              {flashcards.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 text-xs items-center">
                  <span className="px-2 py-1 rounded-md bg-white/10 text-white/70">Difficulty: <strong className="text-white">{flashcards[currentCard]?.difficulty}</strong></span>
                  <span className="px-2 py-1 rounded-md bg-white/10 text-white/70">Success: <strong className="text-emerald-300">{flashcards[currentCard]?.successCount || 0}</strong></span>
                  <span className="px-2 py-1 rounded-md bg-white/10 text-white/70">Errors: <strong className="text-rose-300">{flashcards[currentCard]?.failCount || 0}</strong></span>
                  <div className="flex gap-1">
                    {['easy','med','hard'].map(l => (
                      <button key={l} onClick={() => updateDifficulty(l as any)} className={`px-2 py-1 rounded-md capitalize ${flashcards[currentCard]?.difficulty===l ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-white/10 text-white/60 hover:text-white'}`}>{l}</button>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => recordRecall(true)} className="px-2 py-1 rounded-md bg-emerald-600/70 hover:bg-emerald-600 text-white">I knew it</button>
                    <button onClick={() => recordRecall(false)} className="px-2 py-1 rounded-md bg-rose-600/70 hover:bg-rose-600 text-white">Need review</button>
                  </div>
                  <div className="ml-auto flex gap-1">
                    <button onClick={() => exportDeck('json')} disabled={exporting} className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white/80 text-[11px]">JSON</button>
                    <button onClick={() => exportDeck('csv')} disabled={exporting} className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white/80 text-[11px]">CSV</button>
                    <button onClick={() => exportDeck('anki')} disabled={exporting} className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white/80 text-[11px]">Anki</button>
                  </div>
                </div>
              )}

              {flashcards.length === 0 ? (
                <div>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Paste your study notes here and I'll create flashcards for you..."
                    className="w-full h-44 p-4 rounded-xl border border-white/10 bg-white/5 focus:bg-white/10 text-white placeholder-white/50 focus:ring-2 focus:ring-purple-300/40 outline-none transition"
                  />

                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={generateFlashcards}
                      disabled={loading || !notes.trim()}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-medium shadow hover:shadow-lg disabled:opacity-50 disabled:saturate-50"
                    >
                      {loading ? 'Generating...' : 'Generate Flashcards'}
                    </button>

                    <button
                      onClick={() => { setNotes('') }}
                      className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex flex-col items-center">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setFlipped((f) => !f)}
                      onKeyDown={(e) => e.key === 'Enter' && setFlipped((f) => !f)}
                      className={`w-full md:w-3/4 lg:w-2/3 aspect-[3/2] relative perspective mb-6 cursor-pointer select-none`}
                      aria-label="Flashcard - click to flip"
                    >
                      <div className={`flashcard-inner ${flipped ? 'is-flipped' : ''}`}>
                        <div className="flashcard-face flashcard-front p-6 rounded-2xl shadow-2xl flex items-center justify-center border border-white/10">
                          <p className="text-xl font-semibold text-white text-center leading-snug whitespace-pre-wrap">{flashcards[currentCard]?.front}</p>
                        </div>
                        <div className="flashcard-face flashcard-back p-6 rounded-2xl shadow-2xl flex items-center justify-center border border-white/10">
                          <p className="text-lg text-white/95 text-center leading-relaxed whitespace-pre-wrap">{flashcards[currentCard]?.back}</p>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-3/4 lg:w-2/3 flex items-center justify-between gap-3">
                      <button onClick={prevCard} disabled={currentCard === 0} className="px-4 py-2 bg-white/10 rounded-xl text-white disabled:opacity-50 hover:bg-white/20 transition">Previous</button>
                      <div className="flex gap-2">
                        <button onClick={() => setFlashcards([])} className="px-4 py-2 bg-red-500 rounded-xl text-white hover:brightness-110 transition">New</button>
                        <button onClick={() => { navigator.clipboard?.writeText(JSON.stringify(flashcards, null, 2)); addToast('Copied deck to clipboard','success') }} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition">Copy JSON</button>
                      </div>
                      <button onClick={nextCard} disabled={currentCard === flashcards.length - 1} className="px-4 py-2 bg-white/10 rounded-xl text-white disabled:opacity-50 hover:bg-white/20 transition">Next</button>
                    </div>

                    <div className="w-full md:w-3/4 lg:w-2/3 mt-3">
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-white/40 rounded-full transition-all" style={{ width: `${((currentCard + 1) / flashcards.length) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </section>
          )}

          {/* QUIZ */}
          {activeTab === 'quiz' && (
            <section className="glass rounded-2xl p-6 border border-white/10 animate-fade-in relative">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">📝 Quiz Maker <span className="text-xs font-normal px-2 py-1 rounded-full bg-white/10">Auto</span></h2>
                <div className="text-white/80">{quiz.length ? `${currentQuestion + 1}/${quiz.length}` : 'No quiz yet'}</div>
              </div>
              {quiz.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-3 text-xs text-white/60 items-center">
                  <span className="px-2 py-1 rounded-md bg-white/10">Score: <strong className="text-white">{score}</strong></span>
                  <button onClick={() => setShowStats(s => !s)} className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/20">{showStats ? 'Hide Stats' : 'Show Stats'}</button>
                </div>
              )}

              {quiz.length === 0 && !showResults ? (
                <div>
                  <textarea
                    value={quizText}
                    onChange={(e) => setQuizText(e.target.value)}
                    placeholder="Paste text here and I'll create a quiz for you..."
                    className="w-full h-44 p-4 rounded-xl border border-white/10 bg-white/5 focus:bg-white/10 text-white placeholder-white/50 focus:ring-2 focus:ring-purple-300/40 outline-none transition"
                  />
                  <div className="mt-4 flex gap-3">
                    <button onClick={generateQuiz} disabled={loading || !quizText.trim()} className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-500 text-white font-medium shadow hover:shadow-lg disabled:opacity-50 disabled:saturate-50">{loading ? 'Creating...' : 'Create Quiz'}</button>
                    <button onClick={() => setQuizText('')} className="px-5 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition">Clear</button>
                  </div>
                </div>
              ) : showResults ? (
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-white mb-4">Quiz Complete!</h3>
                  <p className="text-xl text-white mb-6">You scored {score} out of {quiz.length} ({Math.round((score / quiz.length) * 100)}%)</p>
                  <button onClick={() => { setQuiz([]); setShowResults(false); setScore(0) }} className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-medium shadow hover:shadow-lg">Take Another Quiz</button>
                </div>
              ) : (
                <div>
                  <div className="mb-4 text-white">Question {currentQuestion + 1} of {quiz.length}</div>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-4">{quiz[currentQuestion]?.question}</h3>

                    <div className="space-y-3">
                      {quiz[currentQuestion]?.options.map((option, index) => {
                        const isSelected = selectedAnswer === index
                        const isCorrect = index === quiz[currentQuestion].correct

                        let classes = 'w-full p-4 text-left rounded-xl transition-all card-hover border border-white/10 ';
                        if (selectedAnswer === null) classes += 'bg-white/5 text-white hover:bg-white/15'
                        else if (isSelected && isCorrect) classes += 'bg-green-600 text-white'
                        else if (isSelected && !isCorrect) classes += 'bg-red-600 text-white'
                        else if (!isSelected && isCorrect) classes += 'bg-green-500/30 text-white'
                        else classes += 'bg-white/5 text-white/60'

                        return (
                          <button key={index} onClick={() => selectAnswer(index)} disabled={selectedAnswer !== null} className={classes}>
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">{index + 1}</div>
                              <div>{option}</div>
                            </div>
                          </button>
                        )
                      })}
                    </div>

                    {selectedAnswer !== null && (
                      <div className="mt-4 p-4 bg-white/10 rounded-xl border border-white/10">
                        <p className="text-white font-medium">Explanation:</p>
                        <p className="text-white/90">{quiz[currentQuestion]?.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* STUDY BUDDY */}
          {activeTab === 'study-buddy' && (
            <section className="glass rounded-2xl p-6 border border-white/10 animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-4">🤖 Ask-Me Study Buddy</h2>

              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask me anything you want to learn about..."
                  className="flex-1 p-4 rounded-xl border border-white/10 bg-white/5 focus:bg-white/10 text-white placeholder-white/50 focus:ring-2 focus:ring-purple-300/40 outline-none transition"
                  onKeyDown={(e) => e.key === 'Enter' && askStudyBuddy()}
                />
                <button onClick={askStudyBuddy} disabled={loading || !question.trim()} className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow hover:shadow-lg disabled:opacity-50">{loading ? 'Thinking...' : 'Ask'}</button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {chatHistory.length === 0 ? (
                  <div className="text-center text-white/60 py-8">Ask me anything and I'll help you learn!</div>
                ) : (
                  chatHistory.map((chat, index) => (
                    <div key={index} className="space-y-2">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-white font-medium">You:</p>
                        <p className="text-white/90 whitespace-pre-wrap leading-relaxed">{chat.question}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
                        <p className="text-white font-medium">Study Buddy:</p>
                        <p className="text-white/90 whitespace-pre-wrap leading-relaxed">{chat.answer}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          </main>

          {/* Footer */}
          <footer className="mt-16 pt-8 pb-6 text-center text-xs text-white/50 space-y-2">
            <p>Built with Next.js + Tailwind • Enhance your learning workflow</p>
            {flashcards.length > 0 && (
              <p className="text-white/40">Deck: {stats.total} cards • Easy {stats.byDiff.easy} • Med {stats.byDiff.med} • Hard {stats.byDiff.hard} • Correct {stats.totalSuccess} • Missed {stats.totalFail}</p>
            )}
          </footer>
        </div>

        {/* Shortcuts Modal */}
        {showShortcuts && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowShortcuts(false)} />
            <div className="relative z-10 w-full max-w-lg glass rounded-2xl p-6 text-white border border-white/10 animate-fade-in">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
                <button onClick={() => setShowShortcuts(false)} className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/20">✕</button>
              </div>
              <ul className="space-y-2 text-sm">
                <li><code className="px-1.5 py-0.5 rounded bg-white/10">Space</code> Flip flashcard</li>
                <li><code className="px-1.5 py-0.5 rounded bg-white/10">← / →</code> Navigate flashcards</li>
                <li><code className="px-1.5 py-0.5 rounded bg-white/10">1-9</code> Answer quiz option</li>
                <li><code className="px-1.5 py-0.5 rounded bg-white/10">Enter</code> Send Study Buddy question</li>
              </ul>
            </div>
          </div>
        )}

        {/* Toasts */}
        <div className="fixed bottom-4 right-4 z-50 space-y-2 w-[260px]">
          {toasts.map(t => (
            <div key={t.id} className={`p-4 rounded-xl text-sm font-medium animate-fade-in shadow-lg border border-white/10 backdrop-blur-md ${t.type === 'success' ? 'bg-emerald-500/20 text-emerald-200' : t.type === 'error' ? 'bg-rose-500/25 text-rose-200' : 'bg-white/15 text-white'}`}>{t.message}</div>
          ))}
        </div>

        {/* Inline styles retained for flipping */}
        <style>{`
          .perspective { perspective: 1200px; }
          .flashcard-inner { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; transition: transform 0.6s; }
          .flashcard-inner.is-flipped { transform: rotateY(180deg); }
          .flashcard-face { backface-visibility: hidden; position: absolute; inset: 0; display: flex; }
          .flashcard-back { transform: rotateY(180deg); }
        `}</style>
      </div>
    </div>
  )
}
