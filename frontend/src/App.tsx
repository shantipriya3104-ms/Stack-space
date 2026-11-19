import { useEffect, useState } from 'react'
import {
  Activity, ArrowRight, CheckCircle2, Cloud, Cpu, History, Loader2,
  RefreshCw, ShieldCheck, Trash2, Zap, CircleHelp, X,MessageCircle
} from 'lucide-react'

type Assessment = {
  id: number
  project_name: string
  project_type: string
  stack: string
  score: number
  level: string
  categories: Record<string, number>
  recommendations: string[]
  ai_summary: string
  created_at: string
}

const checks = [
  ['has_tests', 'Automated tests', 'Catch regressions before deployment'],
  ['has_ci', 'CI pipeline', 'Build and test changes automatically'],
  ['has_docker', 'Docker containerization', 'Package the app consistently'],
  ['has_https', 'HTTPS enabled', 'Encrypt traffic in transit'],
  ['has_secrets_management', 'Secrets management', 'Keep keys out of source code'],
  ['has_monitoring', 'Application monitoring', 'Detect failures and performance issues'],
  ['has_logging', 'Centralized logging', 'Make production issues easier to investigate'],
  ['has_health_checks', 'Health checks', 'Allow platforms to detect unhealthy instances'],
  ['has_backups', 'Database backups', 'Prepare for accidental data loss'],
  ['has_scaling_plan', 'Scaling plan', 'Plan how the app handles growing demand'],
] as const

const initial = Object.fromEntries(checks.map(([key]) => [key, false])) as Record<string, boolean>

const emptyForm = () => ({
  project_name: '',
  project_type: 'Web application',
  stack: '',
  ...initial,
})
const api = async (path: string, options?: RequestInit) => {
  const response = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.detail || 'Something went wrong')
  }

  return response.json()
}

export default function App() {
  const [form, setForm] = useState(emptyForm)
  const [result, setResult] = useState<Assessment | null>(null)
  const [history, setHistory] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'new' | 'history'>('new')
  const [showGuide, setShowGuide] = useState(false)
  const [showAssistant, setShowAssistant] = useState(false)
  const [assistantInput, setAssistantInput] = useState('')
  const [assistantLoading, setAssistantLoading] = useState(false)
const [assistantMessages, setAssistantMessages] = useState<
  { role: 'user' | 'assistant'; content: string }[]
>([])
const startNewChat = () => {
  setAssistantMessages([])
  setAssistantInput('')
}
const sendAssistantMessage = async (question?: string) => {
  const content = (question ?? assistantInput).trim()

  if (!content || assistantLoading) return

  const userMessage = {
    role: 'user' as const,
    content,
  }

  const updatedMessages = [...assistantMessages, userMessage].slice(-20)

  setAssistantMessages(updatedMessages)
  setAssistantInput('')
  setAssistantLoading(true)

  try {
    const data = await api('/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: updatedMessages,
      }),
    })

    setAssistantMessages([
      ...updatedMessages,
      {
        role: 'assistant',
        content: data.reply,
      },
    ])
  } catch (error) {
    setAssistantMessages([
      ...updatedMessages,
      {
        role: 'assistant',
        content: error instanceof Error
          ? error.message
          : 'Unable to connect to StackSpace AI.',
      },
    ])
  } finally {
    setAssistantLoading(false)
  }
}
  const refresh = async () => {
    try {
      setHistory(await api('/assessments'))
    } catch {
      // The backend may still be starting.
    }
  }

  useEffect(() => {
    void refresh()
  }, [])
  const startNewAssessment = () => {
    setForm(emptyForm())
    setResult(null)
    setError('')
    setTab('new')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const data = await api('/assessments', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      setResult(data)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }
  const openItem = async (id: number) => {
    try {
      setResult(await api(`/assessments/${id}`))
      setError('')
      setTab('new')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load')
    }
  }

  const removeItem = async (id: number) => {
    try {
      await api(`/assessments/${id}`, { method: 'DELETE' })
      await refresh()
      if (result?.id === id) setResult(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete')
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
  <a className="brand" href="#">
    <span className="brand-icon"><Cloud size={21} /></span>
    Stack<span>Space</span>
  </a>

  <div className="topbar-actions">
    <div className="top-status">
      <i /> API workspace <span className="version">v1.0</span>
    </div>

    <button
      className="guide-btn"
      type="button"
      onClick={() => setShowGuide(true)}
      title="How to use StackSpace"
      aria-label="How to use StackSpace"
    >
      <CircleHelp size={19} />
      <span>Guide</span>
    </button>

    <button
  className="assistant-btn"
  type="button"
  onClick={() => setShowAssistant(true)}
  title="Ask StackSpace AI"
>
  <MessageCircle size={18} />
  <span>Ask AI</span>
</button>

    <button
      className="new-assessment-btn"
      type="button"
      onClick={startNewAssessment}
      disabled={loading}
      title="Clear the current form and start a fresh assessment"
    >
      <RefreshCw size={15} />
      New assessment
    </button>
  </div>
</header>

      <main className="layout">
        <section className="hero">
          <div className="eyebrow"><Zap size={14} /> ENGINEERING READINESS, MADE CLEAR</div>
          <h1>Ship with <em>confidence.</em></h1>
          <p>Understand how prepared your software is for the cloud. Get a practical score, identify gaps, and prioritize what to improve next.</p>
          <div className="hero-stats">
            <div><ShieldCheck /><span><b>10</b><small>readiness checks</small></span></div>
            <div><Cpu /><span><b>AI-assisted</b><small>recommendations</small></span></div>
            <div><Activity /><span><b>Actionable</b><small>engineering insights</small></span></div>
          </div>
        </section>
        <nav className="tabs">
          <button className={tab === 'new' ? 'active' : ''} onClick={() => setTab('new')}>
            <Zap size={16} /> New assessment
          </button>
          <button className={tab === 'history' ? 'active' : ''} onClick={() => { setTab('history'); void refresh() }}>
            <History size={16} /> Assessment history <span className="count">{history.length}</span>
          </button>
        </nav>

        {error && <div className="error" role="alert">{error}</div>}

        {tab === 'new' ? (
          <div className="content-grid">
            <form className="panel form-panel" onSubmit={submit}>
              <div className="panel-heading">
                <div>
                  <span className="step">01 / PROJECT PROFILE</span>
                  <h2>Tell us about your project</h2>
                  <p>A few details help us evaluate your deployment practices.</p>
                </div>
                <span className="panel-icon"><Cloud /></span>
              </div>

              <label>
                Project name
                <input
                  required
                  minLength={2}
                  maxLength={150}
                  placeholder="e.g. My SaaS platform"
                  value={form.project_name}
                  onChange={e => setForm({ ...form, project_name: e.target.value })}
                />
                 </label>

              <div className="field-row">
                <label>
                  Project type
                  <select value={form.project_type} onChange={e => setForm({ ...form, project_type: e.target.value })}>
                    {['Web application', 'API / Backend', 'Mobile application', 'Data / AI platform', 'Other'].map(x => <option key={x}>{x}</option>)}
                  </select>
                </label>
                <label>
                  Technology stack
                  <input
                    placeholder="e.g. React, FastAPI, PostgreSQL"
                    value={form.stack}
                    onChange={e => setForm({ ...form, stack: e.target.value })}
                  />
                </label>
              </div>
               <div className="divider" />

              <div className="checks-title">
                <div>
                  <span className="step">02 / READINESS CHECKLIST</span>
                  <h2>What have you implemented?</h2>
                </div>
                <span className="check-count">{checks.filter(([k]) => form[k]).length}/10 complete</span>
              </div>

              <div className="check-list">
                {checks.map(([key, title, desc]) => (
                  <label className="check-item" key={key}>
                    <input
                      type="checkbox"
                      checked={form[key]}
                      onChange={e => setForm({ ...form, [key]: e.target.checked })}
                    />
                    <span className="custom-check"><CheckCircle2 size={16} /></span>
                    <span className="check-copy"><b>{title}</b><small>{desc}</small></span>
                  </label>
                ))}
              </div>

              <button className="primary-btn" disabled={loading}>
                {loading
                  ? <><Loader2 className="spin" size={18} /> Analyzing project...</>
                  : <>Generate readiness report <ArrowRight size={18} /></>}
              </button>
              <p className="fine-print">Your answers are stored locally in the app database. This checklist is a heuristic, not a formal security audit.</p>
            </form>
            <aside className="side-column">
              <div className="side-card accent-card">
                <div className="side-icon"><Zap /></div>
                <h3>From checklist to clarity</h3>
                <p>StackSpace turns engineering practices into a clear snapshot of your cloud deployment readiness.</p>
                <div className="mini-line"><span /><span /><span /><span /><span /></div>
                <small>Assess · Understand · Improve</small>
              </div>

              {result ? (
                <div className="panel result-card">
                  <span className="step">LATEST ASSESSMENT</span>
                  <div className="score-wrap">
                    <div className="score">{result.score}<small>/100</small></div>
                    <span className={`level ${result.level === 'Strong' ? 'good' : ''}`}>{result.level}</span>
                  </div>
                  <h3>{result.project_name}</h3>
                  <div className="category-bars">
                    {Object.entries(result.categories).map(([name, value]) => (
                      <div key={name}>
                        <div><span>{name}</span><b>{value}%</b></div>
                        <div className="bar"><i style={{ width: `${value}%` }} /></div>
                      </div>
                    ))}
                  </div>
                  <div className="summary">
                    <b><Cpu size={15} /> AI insight</b>
                    <p>{result.ai_summary}</p>
                     </div>
                  <h4>Priority actions</h4>
                  <ul>{result.recommendations.slice(0, 4).map(x => <li key={x}>{x}</li>)}</ul>
                </div>
              ) : (
                <div className="side-card tip-card">
                  <span className="step">WHY IT MATTERS</span>
                  <h3>Good software is more than code.</h3>
                  <p>Reliable delivery, secure configuration, observability, and recovery planning are what help applications survive in production.</p>
                </div>
              )}
            </aside>
          </div>
        ) : (
          <section className="panel history-panel">
            <div className="panel-heading">
              <div>
                <span className="step">YOUR WORKSPACE</span>
                <h2>Assessment history</h2>
                <p>Open a previous report or remove an assessment.</p>
              </div>
              <History className="history-big" />
            </div>

            {history.length === 0 ? (
              <div className="empty">No assessments yet. Create your first project assessment.</div>
            ) : (
              <div className="history-list">
                {history.map(item => (
                  <div className="history-row" key={item.id}>
                    <div className="history-main">
                      <b>{item.project_name}</b>
                       <small>{item.project_type} · {new Date(item.created_at).toLocaleString()}</small>
                    </div>
                    <div className="history-score">{item.score}<small>/100</small></div>
                    <button className="icon-btn" onClick={() => void openItem(item.id)} aria-label="Open assessment">
                      <ArrowRight size={17} />
                    </button>
                    <button className="icon-btn danger" onClick={() => void removeItem(item.id)} aria-label="Delete assessment">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

            <footer>
        <span>© 2026 StackSpace</span>
        <span>Built for developers who ship.</span>
        <span>FastAPI · React · Cloud-ready</span>
      </footer>
      {showAssistant && (
  <div
    className="assistant-overlay"
    onClick={() => setShowAssistant(false)}
  >
    <section
      className="assistant-window"
      role="dialog"
      aria-modal="true"
      aria-label="StackSpace AI Assistant"
      onClick={(event) => event.stopPropagation()}
    >
      {/* HEADER */}
      <div className="assistant-header">
        <div className="assistant-heading">
          <div className="assistant-avatar">
            <MessageCircle size={21} />
          </div>
          <div>
            <h2>StackSpace AI</h2>
            <span><i /> Your development assistant</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            className="icon-btn"
            type="button"
            onClick={startNewChat}
            disabled={assistantLoading}
            title="Start a new chat"
            aria-label="Start a new chat"
          >
            <RefreshCw size={17} />
          </button>

          <button
            className="icon-btn"
            type="button"
            onClick={() => setShowAssistant(false)}
            aria-label="Close assistant"
            title="Close assistant"
          >
            <X size={19} />
          </button>
        </div>
      </div>

      {/* CHAT MESSAGES */}
      <div className="assistant-chat">
        {assistantMessages.length === 0 ? (
          <div className="assistant-welcome">
            <div className="assistant-welcome-icon">
              <Zap size={25} />
            </div>

            <h3>Hey, developer! 👋</h3>

            <p>
              I'm your StackSpace AI assistant. Ask me anything
              about software development, cloud readiness,
              DevOps, CI/CD, Docker, or deployment.
            </p>

            <span className="suggestion-label">TRY ASKING</span>

            <div className="suggestion-list">
              {[
                'What is CI/CD?',
                'Explain Docker containers',
                'How do I deploy my project?',
                'How can I improve cloud readiness?'
              ].map((question) => (
                <button
                  type="button"
                  key={question}
                  onClick={() => setAssistantInput(question)}
                >
                  {question}
                  <ArrowRight size={14} />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="assistant-messages">
            {assistantMessages.map((message, index) => (
              <div
                key={index}
                className={`assistant-message ${message.role}`}
              >
                <p>{message.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* INPUT AREA */}
      <form
  className="assistant-input-area"
  onSubmit={(event) => {
    event.preventDefault()
    void sendAssistantMessage()
  }}
>
        <input
          type="text"
          placeholder="Ask anything about development..."
          value={assistantInput}
          onChange={(event) => setAssistantInput(event.target.value)}
        />

        <button
  type="submit"
  disabled={!assistantInput.trim() || assistantLoading}
  aria-label="Send message"
>
  {assistantLoading ? (
    <Loader2 size={19} className="assistant-spinner" />
  ) : (
    <ArrowRight size={19} />
  )}
</button>
      </form>

      <div className="assistant-disclaimer">
        AI responses can occasionally be inaccurate. Verify important information.
      </div>
    </section>
  </div>
)}
      {showGuide && (
        <div
          className="guide-overlay"
          onClick={() => setShowGuide(false)}
        >
          <section
            className="guide-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="guide-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="guide-modal-header">
              <div>
                <span className="step">STACKSPACE USER GUIDE</span>
                <h2 id="guide-title">How to use StackSpace</h2>
                <p>Your quick guide to assessing project readiness.</p>
              </div>

              <button
                className="icon-btn"
                type="button"
                onClick={() => setShowGuide(false)}
                aria-label="Close guide"
              >
                <X size={19} />
              </button>
            </div>

            <div className="guide-content">
              <div className="guide-item">
                <span>01</span>
                <div>
                  <h3>Create an assessment</h3>
                  <p>Enter your project name, select its type, and provide the requested project details.</p>
                </div>
              </div>

              <div className="guide-item">
                <span>02</span>
                <div>
                  <h3>Complete the readiness checklist</h3>
                  <p>Review the checklist and select the practices your project has implemented, such as automated testing, CI/CD, and Docker.</p>
                </div>
              </div>

              <div className="guide-item">
                <span>03</span>
                <div>
                  <h3>Generate your assessment</h3>
                  <p>Submit your project details to receive a readiness score and assessment report.</p>
                </div>
              </div>

              <div className="guide-item">
                <span>04</span>
                <div>
                  <h3>Understand your results</h3>
                  <p>Review your score, identify areas that need improvement, and explore the recommendations.</p>
                </div>
              </div>

              <div className="guide-item">
                <span>05</span>
                <div>
                  <h3>View assessment history</h3>
                  <p>Open the History section to revisit previous assessments or delete reports you no longer need.</p>
                </div>
              </div>

              <div className="guide-item">
                <span>06</span>
                <div>
                  <h3>Start fresh anytime</h3>
                  <p>Click New Assessment to clear the current form and begin evaluating another project.</p>
                </div>
              </div>
            </div>

            <div className="guide-footer">
              <span>Build better. Deploy smarter.</span>
              <button
                className="new-assessment-btn"
                type="button"
                onClick={() => setShowGuide(false)}
              >
                Got it
                <ArrowRight size={15} />
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}