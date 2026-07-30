import { useEffect, useMemo, useState } from 'react'
import type { ConfirmQuestion } from '../data/confirmQuestions'
import type { ConfirmAgendaItem } from '../lib/confirmAgenda'
import { formatConfirmAnswers } from '../lib/confirmInterview'

interface ConfirmInterviewProps {
  agendaItems: ConfirmAgendaItem[]
  questions: ConfirmQuestion[]
  answers: Record<string, string>
  onAnswer: (questionId: string, optionId: string) => void
}

export function ConfirmInterview({
  agendaItems,
  questions,
  answers,
  onAnswer,
}: ConfirmInterviewProps) {
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
        setFocusIndex((i) => Math.min(Math.max(questions.length - 1, 0), i + 1))
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
  const summaryLines = useMemo(
    () =>
      formatConfirmAnswers(
        questions
          .filter((q) => answers[q.id])
          .map((q) => ({
            prompt: q.prompt,
            answerLabel: q.options.find((o) => o.id === answers[q.id])?.label ?? '',
          })),
      ),
    [questions, answers],
  )

  return (
    <div className="confirm-panel">
      <section className="confirm-agenda" aria-label="これまでの問診で確認したいこと">
        <h3 className="confirm-agenda-title">これまでの問診で確認したいこと</h3>
        {agendaItems.map((item) => (
          <article key={item.title} className="confirm-agenda-item">
            <h4>{item.title}</h4>
            <pre className="confirm-agenda-body">{item.detail}</pre>
          </article>
        ))}
      </section>

      {questions.length === 0 ? (
        <p className="confirm-empty">
          追加の選択式確認は少なめです。内容を確認したら次へ進み、経過の詳細と医師回答を見てください。
        </p>
      ) : (
        <>
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
            <p className="field-label">確認項目への回答</p>
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
            <p className="confirm-memo-hint">回答は鑑別と、次の「医師に聞きたいこと」への回答に反映されます。</p>
          )}
        </>
      )}
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
