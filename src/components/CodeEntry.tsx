import { useState } from 'react'
import { motion } from 'framer-motion'

interface CodeEntryProps {
  onSuccess: () => void
  onValidate: (code: string) => Promise<{ success: boolean; error?: string }>
  content: {
    title: string
    subtitle: string
    placeholder: string
    button: string
    loading: string
    error: string
    hint: string
  }
}

export const CodeEntry = ({ onSuccess, onValidate, content }: CodeEntryProps) => {
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!code.trim()) {
      setError(content.error)
      return
    }

    setIsLoading(true)
    setError(null)

    const result = await onValidate(code.trim())

    if (result.success) {
      onSuccess()
    } else {
      setError(result.error || content.error)
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="code-entry-overlay"
    >
      <div className="code-entry-bg" />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="code-entry-card"
      >
        <div className="code-entry-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>

        <h1 className="code-entry-title">{content.title}</h1>
        <p className="code-entry-subtitle">{content.subtitle}</p>

        <form onSubmit={handleSubmit} className="code-entry-form">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder={content.placeholder}
            className="code-entry-input"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            disabled={isLoading}
          />

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="code-entry-error"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            className="code-entry-button"
            disabled={isLoading || !code.trim()}
          >
            {isLoading ? content.loading : content.button}
          </button>
        </form>

        <p className="code-entry-hint">{content.hint}</p>
      </motion.div>
    </motion.div>
  )
}
