import { useEffect, useMemo, useState } from 'react'
import {
  pickConfirmQuestions,
  type ConfirmQuestion,
} from '../data/confirmQuestions'
import type { Sex, SymptomId } from '../data/conditions'
import { formatConfirmAnswers } from '../lib/confirmInterview'

interface ConfirmInterviewProps {
  symptoms: SymptomId[]
  sex: Sex
  age: number
  answers: Record<string, string>
  onAnswer: (questionId: string, optionId: string) => void
  freeText: string
  onFreeTextChange: (value: string) => void
}

export function ConfirmInterview({
  symptoms,
  sex,
  age,
  answers,
  onAnswer,
  freeText,
  onFreeTextChange,
}: ConfirmInterviewProps) {
  const questions = useMemo(
    () => pickConfirmQuestions({ symptoms, sex, age, max: 8 }),
    [symptoms, sex, age],
  )
  const [focusIndex, setFocusIndex] = useState(0)

  const active = questions[focusIndex] ?? questions[0]

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!active) return
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'TEXTAREA' || tag === 'INPUT') return

      if (e.key >= '1' && e.key <= '9') {
        const idx = Number(e.key) - 1
        const opt = active.options[idx]
        if (opt) {
          e.preventDefault()
          onAnswer(active.id, opt.id)
        }
      }
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault()
        setFocusIndex((i) => Math.min(questions.length - 1, i + 1))
      }
      if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault()
        setFocusIndex((i) => Math.max(0, i - 1))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, onAnswer, questions.length])

  const answeredCount = questions.filter((q) => answers[q.id]).length
  const summaryLines = formatConfirmAnswers(
    questions
      .filter((q) => answers[q.id])
      .map((q) => ({
        prompt: q.prompt,
        answerLabel: q.options.find((o) => o.id === answers[q.id])?.label ?? '',
      })),
  )

  if (questions.length === 0) {
    return (
      <div className="confirm-panel">
        <p className="confirm-empty">
          いまの症状からは追加の確認質問は少なめです。下の自由記入で気になる点を書いてください（パソコンのキーボードでも入力できます）。
        </p>
        <FreeTextField value={freeText} onChange={onFreeTextChange} />
      </div>
    )
  }

  return (
    <div className="confirm-panel">
      <div className="confirm-progress-line">
        <span>
          確認 {answeredCount} / {questions.length}
        </span>
        <span className="confirm-kbd-hint">PC：数字キーで回答 · ↑↓で質問移動</span>
      </div>

      <ol className="confirm-nav">
        {questions.map((q, i) => (
          <li key={q.id}>
            <button
              type="button"
              className={`confirm-nav-dot ${i === focusIndex ? 'is-active' : ''} ${answers[q.id] ? 'is-done' : ''}`}
              onClick={() => setFocusIndex(i)}
              aria-label={`質問${i + 1}`}
            >
              {i + 1}
            </button>
          </li>
        ))}
      </ol>

      {active && (
        <QuestionCard
          question={active}
          index={focusIndex}
          total={questions.length}
          selectedId={answers[active.id]}
          onSelect={(optionId) => {
            onAnswer(active.id, optionId)
            if (focusIndex < questions.length - 1 && !answers[questions[focusIndex + 1]?.id]) {
              setFocusIndex((i) => i + 1)
            }
          }}
        />
      )}

      <div className="confirm-all-list">
        <p className="field-label">すべての確認質問</p>
        {questions.map((q, i) => (
          <button
            key={q.id}
            type="button"
            className={`confirm-summary-row ${i === focusIndex ? 'is-active' : ''}`}
            onClick={() => setFocusIndex(i)}
          >
            <span className="confirm-summary-q">{q.prompt}</span>
            <span className="confirm-summary-a">
              {q.options.find((o) => o.id === answers[q.id])?.label ?? '未回答'}
            </span>
          </button>
        ))}
      </div>

      {summaryLines.length > 0 && (
        <p className="confirm-memo-hint">回答は鑑別スコアと受診メモに反映されます。</p>
      )}

      <FreeTextField value={freeText} onChange={onFreeTextChange} />
    </div>
  )
}

function QuestionCard({
  question,
  index,
  total,
  selectedId,
  onSelect,
}: {
  question: ConfirmQuestion
  index: number
  total: number
  selectedId?: string
  onSelect: (optionId: string) => void
}) {
  return (
    <article className="confirm-card" aria-live="polite">
      <p className="confirm-doctor-label">スーパードクター確認 #{index + 1}/{total}</p>
      <h3 className="confirm-prompt">{question.prompt}</h3>
      <p className="confirm-why">{question.why}</p>
      <div className="confirm-options" role="group" aria-label={question.prompt}>
        {question.options.map((opt, i) => (
          <button
            key={opt.id}
            type="button"
            className={`confirm-option ${selectedId === opt.id ? 'is-on' : ''}`}
            onClick={() => onSelect(opt.id)}
          >
            <kbd className="confirm-key">{i + 1}</kbd>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    </article>
  )
}

function FreeTextField({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="field confirm-freetext">
      <span className="field-label">追加で伝えたいこと（パソコンからも自由入力）</span>
      <textarea
        className="symptom-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        placeholder="例）昨日の夜から悪化。市販の解熱剤を飲んだ。仕事で長時間座っている。右足だけむくむ気がする——"
      />
    </label>
  )
}
