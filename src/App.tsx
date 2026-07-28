import { useMemo, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CameraCapture } from './components/CameraCapture'
import { InstallPrompt } from './components/InstallPrompt'
import {
  feverOptions,
  onsetOptions,
  redFlags,
  skinSensationOptions,
  skinSiteOptions,
  type FeverBand,
  type OnsetType,
  type RedFlagId,
  type SkinSensation,
  type SkinSite,
} from './data/clinical'
import {
  contextFlagOptions,
  contextGroups,
  courseTrendOptions,
  painQualityOptions,
  type ContextFlagId,
  type CourseTrend,
  type PainQuality,
} from './data/clinicalQuestions'
import {
  historyOptions,
  symptoms,
  type HistoryId,
  type Sex,
  type SymptomId,
} from './data/conditions'
import {
  buildVisitSummary,
  dispositionCopy,
  evaluateTriage,
  highestUrgency,
  inferConditions,
  likelihoodLabel,
  recheckCriteria,
  resolveDisposition,
} from './lib/infer'
import type { ImageAnalysisResult } from './lib/imageAnalysis'
import { parseSymptomsFromText } from './lib/parseSymptoms'
import './App.css'

type Step =
  | 'landing'
  | 'profile'
  | 'triage'
  | 'emergency'
  | 'symptoms'
  | 'photo'
  | 'history'
  | 'detail'
  | 'result'
type Mode = 'standard' | 'camera'

const sexOptions: { id: Sex; label: string }[] = [
  { id: 'female', label: '女性' },
  { id: 'male', label: '男性' },
  { id: 'other', label: 'その他 / 回答しない' },
]

const categories = [...new Set(symptoms.map((s) => s.category))]

function App() {
  const [step, setStep] = useState<Step>('landing')
  const [mode, setMode] = useState<Mode>('standard')
  const [age, setAge] = useState(35)
  const [sex, setSex] = useState<Sex>('female')
  const [symptomText, setSymptomText] = useState('')
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomId[]>([])
  const [history, setHistory] = useState<HistoryId[]>([])
  const [durationDays, setDurationDays] = useState(2)
  const [severity, setSeverity] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysisResult | null>(null)
  const [redFlagIds, setRedFlagIds] = useState<RedFlagId[]>([])
  const [onset, setOnset] = useState<OnsetType>('unclear')
  const [feverBand, setFeverBand] = useState<FeverBand>('unknown')
  const [skinSite, setSkinSite] = useState<SkinSite>('unknown')
  const [skinSensation, setSkinSensation] = useState<SkinSensation>('neither')
  const [skinSpreading, setSkinSpreading] = useState(false)
  const [skinBlisters, setSkinBlisters] = useState(false)
  const [courseTrend, setCourseTrend] = useState<CourseTrend>('unknown')
  const [painQuality, setPainQuality] = useState<PainQuality>('unknown')
  const [contextFlags, setContextFlags] = useState<ContextFlagId[]>([])
  const [doctorQuestions, setDoctorQuestions] = useState('')
  const [copied, setCopied] = useState(false)

  const triage = useMemo(() => evaluateTriage(redFlagIds, age), [redFlagIds, age])

  const results = useMemo(() => {
    if (step !== 'result') return []
    return inferConditions({
      age,
      sex,
      symptoms: selectedSymptoms,
      history,
      durationDays,
      severity,
      imageAnalysis,
      redFlagIds,
      onset,
      feverBand,
      skinSite,
      skinSensation,
      skinSpreading,
      skinBlisters,
      courseTrend,
      painQuality,
      contextFlags,
      doctorQuestions,
      freeText: symptomText,
    })
  }, [
    step,
    age,
    sex,
    selectedSymptoms,
    history,
    durationDays,
    severity,
    imageAnalysis,
    redFlagIds,
    onset,
    feverBand,
    skinSite,
    skinSensation,
    skinSpreading,
    skinBlisters,
    courseTrend,
    painQuality,
    contextFlags,
    doctorQuestions,
    symptomText,
  ])

  const urgency = highestUrgency(results)
  const disposition = useMemo(
    () =>
      resolveDisposition(results, triage, {
        age,
        sex,
        symptoms: selectedSymptoms,
        history,
        durationDays,
        severity,
        imageAnalysis,
        redFlagIds,
        onset,
        feverBand,
        skinSite,
        skinSensation,
        skinSpreading,
        skinBlisters,
        courseTrend,
        painQuality,
        contextFlags,
        doctorQuestions,
        freeText: symptomText,
      }),
    [
      results,
      triage,
      age,
      sex,
      selectedSymptoms,
      history,
      durationDays,
      severity,
      imageAnalysis,
      redFlagIds,
      onset,
      feverBand,
      skinSite,
      skinSensation,
      skinSpreading,
      skinBlisters,
      courseTrend,
      painQuality,
      contextFlags,
      doctorQuestions,
      symptomText,
    ],
  )
  const dispositionText = dispositionCopy(disposition)
  const mustNotMiss = results.filter((r) => r.mustNotMiss)
  const sexLabel = sexOptions.find((s) => s.id === sex)?.label ?? ''
  const showSkinQuestions =
    mode === 'camera' ||
    selectedSymptoms.some((s) => ['rash', 'itch', 'swelling'].includes(s)) ||
    Boolean(imageAnalysis)

  const visitSummary = useMemo(() => {
    const skinNote = showSkinQuestions
      ? [
          skinSiteOptions.find((s) => s.id === skinSite)?.label,
          skinSensationOptions.find((s) => s.id === skinSensation)?.label,
          skinSpreading ? '拡大あり' : null,
          skinBlisters ? '水疱あり' : null,
        ]
          .filter(Boolean)
          .join(' / ')
      : undefined

    const symptomLabels = selectedSymptoms.map(
      (id) => symptoms.find((s) => s.id === id)?.label ?? id,
    )

    return buildVisitSummary({
      age,
      sexLabel,
      symptoms: symptomText.trim()
        ? [
            symptomText.trim() +
              (symptomLabels.length ? `（${symptomLabels.join('、')}）` : ''),
          ]
        : symptomLabels,
      history: history
        .filter((h) => h !== 'none')
        .map((id) => historyOptions.find((h) => h.id === id)?.label ?? id),
      durationDays,
      severity,
      onset,
      feverBand,
      redFlags: triage.activeFlags.map((f) => f.label),
      results,
      dispositionTitle: dispositionText.title,
      photoFindings: imageAnalysis?.findings.map((f) => f.label),
      skinNote,
      courseTrend: courseTrendOptions.find((c) => c.id === courseTrend)?.label,
      painQuality: painQualityOptions.find((p) => p.id === painQuality)?.label,
      contextNotes: contextFlags.map(
        (id) => contextFlagOptions.find((c) => c.id === id)?.label ?? id,
      ),
      doctorQuestions,
    })
  }, [
    age,
    sexLabel,
    symptomText,
    selectedSymptoms,
    history,
    durationDays,
    severity,
    onset,
    feverBand,
    triage.activeFlags,
    results,
    dispositionText.title,
    imageAnalysis,
    showSkinQuestions,
    skinSite,
    skinSensation,
    skinSpreading,
    skinBlisters,
    courseTrend,
    painQuality,
    contextFlags,
    doctorQuestions,
  ])

  function toggleSymptom(id: SymptomId) {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    )
  }

  function onSymptomTextChange(value: string) {
    setSymptomText(value)
    const parsed = parseSymptomsFromText(value)
    if (parsed.length === 0) return
    setSelectedSymptoms((prev) => [...new Set([...prev, ...parsed])])
  }

  function toggleHistory(id: HistoryId) {
    if (id === 'none') {
      setHistory(['none'])
      return
    }
    setHistory((prev) => {
      const withoutNone = prev.filter((h) => h !== 'none')
      return withoutNone.includes(id)
        ? withoutNone.filter((h) => h !== id)
        : [...withoutNone, id]
    })
  }

  function toggleRedFlag(id: RedFlagId) {
    setRedFlagIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function toggleContextFlag(id: ContextFlagId) {
    setContextFlags((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function clearPhoto() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setImageAnalysis(null)
  }

  function onPhotoCaptured(url: string, analysis: ImageAnalysisResult) {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(url)
    setImageAnalysis(analysis)
    setSelectedSymptoms((prev) => {
      const next = new Set(prev)
      for (const s of analysis.suggestedSymptoms) next.add(s)
      return [...next]
    })
  }

  function startStandard() {
    setMode('standard')
    setStep('profile')
  }

  function startCamera() {
    setMode('camera')
    setStep('profile')
  }

  function reset() {
    clearPhoto()
    setStep('landing')
    setMode('standard')
    setSymptomText('')
    setSelectedSymptoms([])
    setHistory([])
    setDurationDays(2)
    setSeverity(3)
    setRedFlagIds([])
    setOnset('unclear')
    setFeverBand('unknown')
    setSkinSite('unknown')
    setSkinSensation('neither')
    setSkinSpreading(false)
    setSkinBlisters(false)
    setCourseTrend('unknown')
    setPainQuality('unknown')
    setContextFlags([])
    setDoctorQuestions('')
    setCopied(false)
  }

  function proceedFromTriage() {
    const t = evaluateTriage(redFlagIds, age)
    if (t.forcedDisposition) {
      setStep('emergency')
      return
    }
    setStep(mode === 'camera' ? 'photo' : 'symptoms')
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(visitSummary)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const visibleRedFlags =
    age < 5 ? redFlags : redFlags.filter((f) => f.id !== 'infant_lethargy')

  const canProceedFromSymptoms =
    symptomText.trim().length > 0 || selectedSymptoms.length > 0 || Boolean(imageAnalysis)

  const showPainQuestions = selectedSymptoms.some((s) =>
    [
      'headache',
      'chest_pain',
      'abdominal_pain',
      'back_pain',
      'joint_pain',
      'muscle_pain',
      'ear_pain',
      'eye_pain',
      'sore_throat',
      'urinary_pain',
      'flank_pain',
      'neck_pain',
      'calf_pain',
      'tooth_pain',
      'testicular_pain',
      'menstrual_pain',
    ].includes(s),
  )

  return (
    <div className="app">
      <div className="atmosphere" aria-hidden="true">
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="grain" />
      </div>

      <header className="topbar">
        <button type="button" className="brand-mark" onClick={reset}>
          <span className="brand-mark-kanji">家</span>
          <span className="brand-mark-text">家庭の医学</span>
        </button>
        {step !== 'landing' && (
          <p className="topbar-note">診断ではなく、受診判断の参考です</p>
        )}
      </header>

      <InstallPrompt />

      <main className="stage">
        <AnimatePresence mode="wait">
          {step === 'landing' && (
            <motion.section
              key="landing"
              className="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45 }}
            >
              <div className="hero-copy">
                <motion.p
                  className="hero-eyebrow"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  家庭でひらく、からだの地図
                </motion.p>
                <motion.h1
                  className="hero-title"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.55 }}
                >
                  家庭の医学
                </motion.h1>
                <motion.p
                  className="hero-lead"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  危険兆候の確認から、全科の専門知見に基づく症状・写真・経過・質問まで。受診の優先度と鑑別の手がかりを整理します。
                </motion.p>
                <motion.div
                  className="hero-actions"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.48 }}
                >
                  <div className="hero-cta-row">
                    <button type="button" className="btn btn-primary" onClick={startStandard}>
                      症状を相談する
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={startCamera}>
                      カメラで皮膚を診る
                    </button>
                  </div>
                  <p className="hero-disclaimer">
                    本アプリは医療行為ではありません。写真解析も参考情報です。緊急時は119番へ。
                  </p>
                </motion.div>
              </div>

              <motion.div
                className="hero-visual"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                aria-hidden="true"
              >
                <div className="anatomy-plate">
                  <svg viewBox="0 0 480 640" className="anatomy-svg">
                    <defs>
                      <linearGradient id="bodyFill" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#d8ebe3" />
                        <stop offset="100%" stopColor="#9fbfb3" />
                      </linearGradient>
                      <radialGradient id="glow" cx="50%" cy="40%" r="50%">
                        <stop offset="0%" stopColor="#f4f7f2" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#f4f7f2" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    <ellipse cx="240" cy="300" rx="180" ry="240" fill="url(#glow)" />
                    <path
                      d="M240 70c38 0 68 30 68 68v36c28 14 46 44 46 78v120c0 54-34 100-82 118v74c0 18-14 32-32 32h-0c-18 0-32-14-32-32v-74c-48-18-82-64-82-118V252c0-34 18-64 46-78v-36c0-38 30-68 68-68z"
                      fill="url(#bodyFill)"
                      opacity="0.85"
                    />
                    <circle cx="240" cy="108" r="42" fill="#e8f2ed" />
                    <path
                      className="pulse-line"
                      d="M120 290h48l18-36 28 72 22-48 18 24h106"
                      fill="none"
                      stroke="#1f5c4d"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle className="pulse-dot" cx="240" cy="250" r="8" fill="#c45c3a" />
                  </svg>
                  <div className="hero-caption">
                    <span>Triage → Differential</span>
                    <strong>まず危険を除外し、次に可能性を並べる</strong>
                  </div>
                </div>
              </motion.div>
            </motion.section>
          )}

          {step === 'profile' && (
            <WizardFrame
              key="profile"
              stepIndex={1}
              totalSteps={6}
              title="はじめに、あなたのこと"
              subtitle="年齢と性別は、重症化リスクと鑑別の絞り込みに使います。"
              onBack={() => setStep('landing')}
              onNext={() => setStep('triage')}
              nextLabel="次へ：危険兆候の確認"
            >
              <div className="field-grid">
                <label className="field">
                  <span className="field-label">年齢</span>
                  <div className="age-row">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                    />
                    <strong className="age-value">{age}歳</strong>
                  </div>
                </label>

                <fieldset className="field">
                  <legend className="field-label">性別</legend>
                  <div className="chip-row">
                    {sexOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        className={`chip ${sex === opt.id ? 'is-on' : ''}`}
                        onClick={() => setSex(opt.id)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>
            </WizardFrame>
          )}

          {step === 'triage' && (
            <WizardFrame
              key="triage"
              stepIndex={2}
              totalSteps={6}
              title="いま、次の危険兆候はありますか？"
              subtitle="医師が最初に除外する所見です。ひとつでもあれば救急を優先します。なければ「該当なし」のまま次へ。"
              onBack={() => setStep('profile')}
              onNext={proceedFromTriage}
              nextLabel={redFlagIds.length ? '救急の案内を見る' : '該当なし・次へ'}
            >
              <div className="triage-list">
                {visibleRedFlags.map((flag) => (
                  <button
                    key={flag.id}
                    type="button"
                    className={`triage-item ${redFlagIds.includes(flag.id) ? 'is-on' : ''}`}
                    onClick={() => toggleRedFlag(flag.id)}
                  >
                    <span className="triage-check" aria-hidden="true" />
                    <span>
                      <strong>{flag.label}</strong>
                      <small>{flag.detail}</small>
                    </span>
                  </button>
                ))}
              </div>
            </WizardFrame>
          )}

          {step === 'emergency' && (
            <motion.section
              key="emergency"
              className="result-panel emergency-panel"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="urgency-banner urgency-emergency">
                <p className="urgency-kicker">緊急トリアージ</p>
                <h2>{dispositionCopy(triage.forcedDisposition ?? 'call_119').title}</h2>
                <p>{triage.message}</p>
              </div>

              <div className="emergency-actions-block">
                <a className="btn btn-primary btn-call" href="tel:119">
                  119に電話する
                </a>
                <p className="contact-line">救急相談（地域により）: #7119 ／ 小児救急相談: #8000</p>
              </div>

              <ul className="emergency-flag-list">
                {triage.activeFlags.map((f) => (
                  <li key={f.id}>
                    <strong>{f.label}</strong>
                    <span>{f.action}</span>
                  </li>
                ))}
              </ul>

              <aside className="legal-note">
                <strong>医師からの注意</strong>
                <p>
                  危険兆候がある場合、アプリで疾患名を探すより救急要請・救急外来が先です。
                  症状が軽く感じても、急変の前兆であることがあります。
                </p>
              </aside>

              <div className="result-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setStep('triage')}>
                  選択を見直す
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStep(mode === 'camera' ? 'photo' : 'symptoms')}
                >
                  それでも参考情報を続ける
                </button>
              </div>
            </motion.section>
          )}

          {step === 'symptoms' && (
            <WizardFrame
              key="symptoms"
              stepIndex={3}
              totalSteps={6}
              title="いまの症状は？"
              subtitle={
                mode === 'camera'
                  ? '写真から推定した症状を先に入れています。文章でも詳しく書いてください。'
                  : 'いつから、どこが、どうつらいかを文章で書いてください。キーワードから症状を自動で拾います。'
              }
              onBack={() => setStep(mode === 'camera' ? 'photo' : 'triage')}
              onNext={() => setStep(mode === 'camera' ? 'history' : 'photo')}
              nextDisabled={!canProceedFromSymptoms}
              nextLabel={mode === 'camera' ? '次へ：病歴を選ぶ' : '次へ：写真（任意）'}
            >
              <label className="field symptom-text-field">
                <span className="field-label">症状を文章で書く</span>
                <textarea
                  className="symptom-textarea"
                  value={symptomText}
                  onChange={(e) => onSymptomTextChange(e.target.value)}
                  rows={5}
                  placeholder="例）昨日の夕方から熱っぽく、のどが痛くて咳が出ます。少しだるさもあり、食欲はあまりありません。"
                  autoComplete="off"
                />
              </label>

              {selectedSymptoms.length > 0 && (
                <div className="detected-symptoms">
                  <p className="field-label">拾えた症状（不要なら外してください）</p>
                  <div className="chip-row wrap">
                    {selectedSymptoms.map((id) => {
                      const label = symptoms.find((s) => s.id === id)?.label ?? id
                      return (
                        <button
                          key={id}
                          type="button"
                          className="chip is-on"
                          onClick={() => toggleSymptom(id)}
                        >
                          {label} ×
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {symptomText.trim().length > 0 && selectedSymptoms.length === 0 && (
                <p className="symptom-hint">
                  まだ症状を拾えていません。下の一覧から選ぶか、発熱・咳・腹痛など具体的な言葉を入れてください。
                </p>
              )}

              <details className="symptom-picker">
                <summary>一覧から追加で選ぶ</summary>
                <div className="symptom-board">
                  {categories.map((cat) => (
                    <div key={cat} className="symptom-group">
                      <h3>{cat}</h3>
                      <div className="chip-row wrap">
                        {symptoms
                          .filter((s) => s.category === cat)
                          .map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              className={`chip ${selectedSymptoms.includes(s.id) ? 'is-on' : ''}`}
                              onClick={() => toggleSymptom(s.id)}
                            >
                              {s.label}
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
              <p className="selection-count">
                {symptomText.trim()
                  ? `文章 ${symptomText.trim().length} 文字`
                  : '文章未入力'}
                {selectedSymptoms.length > 0 ? ` ・整理 ${selectedSymptoms.length} 件` : ''}
              </p>
            </WizardFrame>
          )}

          {step === 'photo' && (
            <WizardFrame
              key="photo"
              stepIndex={mode === 'camera' ? 3 : 4}
              totalSteps={6}
              title={mode === 'camera' ? '皮膚・患部を撮影' : '写真があれば追加（任意）'}
              subtitle="色調解析は参考です。診断の代替にはなりません。"
              onBack={() => setStep(mode === 'camera' ? 'triage' : 'symptoms')}
              onNext={() => setStep(mode === 'camera' ? 'symptoms' : 'history')}
              nextDisabled={mode === 'camera' && !imageAnalysis}
              nextLabel={
                mode === 'camera'
                  ? '次へ：症状を確認'
                  : imageAnalysis
                    ? '次へ：病歴を選ぶ'
                    : 'スキップして病歴へ'
              }
            >
              <CameraCapture
                analysis={imageAnalysis}
                previewUrl={previewUrl}
                onCaptured={onPhotoCaptured}
                onClear={clearPhoto}
              />
            </WizardFrame>
          )}

          {step === 'history' && (
            <WizardFrame
              key="history"
              stepIndex={5}
              totalSteps={6}
              title="病歴・体質はありますか？"
              subtitle="心疾患・糖尿病・COPD・血栓・免疫抑制・妊娠などは、同じ症状でも緊急度と鑑別が変わります。"
              onBack={() => setStep(mode === 'camera' ? 'symptoms' : 'photo')}
              onNext={() => setStep('detail')}
              nextLabel="次へ：経過の詳細"
            >
              <div className="chip-row wrap">
                {historyOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`chip ${history.includes(opt.id) ? 'is-on' : ''}`}
                    onClick={() => toggleHistory(opt.id)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </WizardFrame>
          )}

          {step === 'detail' && (
            <WizardFrame
              key="detail"
              stepIndex={6}
              totalSteps={6}
              title="スーパードクター問診"
              subtitle="発症・熱・経過に加え、痛みの性状・誘因・要注意サイン、そして医師への質問を整理します。"
              onBack={() => setStep('history')}
              onNext={() => setStep('result')}
              nextLabel="鑑別と受診方針を見る"
            >
              <div className="field-grid">
                <fieldset className="field">
                  <legend className="field-label">どう始まりましたか？</legend>
                  <div className="chip-row wrap">
                    {onsetOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        className={`chip ${onset === opt.id ? 'is-on' : ''}`}
                        onClick={() => setOnset(opt.id)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="field">
                  <legend className="field-label">熱はありますか？</legend>
                  <div className="chip-row wrap">
                    {feverOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        className={`chip ${feverBand === opt.id ? 'is-on' : ''}`}
                        onClick={() => setFeverBand(opt.id)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="field">
                  <legend className="field-label">ここ数日の勢い（経過）</legend>
                  <div className="chip-row wrap">
                    {courseTrendOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        className={`chip ${courseTrend === opt.id ? 'is-on' : ''}`}
                        onClick={() => setCourseTrend(opt.id)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <label className="field">
                  <span className="field-label">続いて何日くらい？</span>
                  <div className="age-row">
                    <input
                      type="range"
                      min={1}
                      max={30}
                      value={durationDays}
                      onChange={(e) => setDurationDays(Number(e.target.value))}
                    />
                    <strong className="age-value">
                      {durationDays === 30 ? '30日以上' : `${durationDays}日`}
                    </strong>
                  </div>
                </label>

                <fieldset className="field">
                  <legend className="field-label">つらさ（1＝軽い / 5＝かなりつらい）</legend>
                  <div className="chip-row">
                    {([1, 2, 3, 4, 5] as const).map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={`chip severity ${severity === n ? 'is-on' : ''}`}
                        onClick={() => setSeverity(n)}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </fieldset>

                {showPainQuestions && (
                  <fieldset className="field">
                    <legend className="field-label">痛みの感じ方（専門医が必ず聞く）</legend>
                    <div className="chip-row wrap">
                      {painQualityOptions.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          className={`chip ${painQuality === opt.id ? 'is-on' : ''}`}
                          onClick={() => setPainQuality(opt.id)}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                )}

                <div className="field clinical-questions">
                  <p className="field-label">きっかけ・誘因・要注意サイン（当てはまるもの）</p>
                  {contextGroups.map((group) => (
                    <div key={group} className="context-group">
                      <h3 className="context-group-title">{group}</h3>
                      <div className="chip-row wrap">
                        {contextFlagOptions
                          .filter((opt) => opt.group === group)
                          .map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              className={`chip ${contextFlags.includes(opt.id) ? 'is-on' : ''} ${group === '要注意' ? 'chip-warn' : ''}`}
                              onClick={() => toggleContextFlag(opt.id)}
                            >
                              {opt.label}
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>

                {showSkinQuestions && (
                  <>
                    <fieldset className="field">
                      <legend className="field-label">皮膚の場所</legend>
                      <div className="chip-row wrap">
                        {skinSiteOptions.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            className={`chip ${skinSite === opt.id ? 'is-on' : ''}`}
                            onClick={() => setSkinSite(opt.id)}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </fieldset>

                    <fieldset className="field">
                      <legend className="field-label">かゆみ・痛み</legend>
                      <div className="chip-row wrap">
                        {skinSensationOptions.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            className={`chip ${skinSensation === opt.id ? 'is-on' : ''}`}
                            onClick={() => setSkinSensation(opt.id)}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </fieldset>

                    <div className="chip-row wrap">
                      <button
                        type="button"
                        className={`chip ${skinSpreading ? 'is-on' : ''}`}
                        onClick={() => setSkinSpreading((v) => !v)}
                      >
                        広がってきている
                      </button>
                      <button
                        type="button"
                        className={`chip ${skinBlisters ? 'is-on' : ''}`}
                        onClick={() => setSkinBlisters((v) => !v)}
                      >
                        水ぶくれがある
                      </button>
                    </div>
                  </>
                )}

                <label className="field">
                  <span className="field-label">医師への質問・伝えたいこと</span>
                  <textarea
                    className="symptom-textarea doctor-questions"
                    value={doctorQuestions}
                    onChange={(e) => setDoctorQuestions(e.target.value)}
                    rows={4}
                    placeholder="例）仕事は休んだ方がいいですか？／市販薬は何がよいですか？／検査は必要ですか？／再診の目安は？"
                  />
                </label>
              </div>
            </WizardFrame>
          )}

          {step === 'result' && (
            <motion.section
              key="result"
              className="result-panel"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className={`urgency-banner urgency-${disposition === 'call_119' || disposition === 'er_today' ? (disposition === 'call_119' ? 'emergency' : 'urgent') : urgency}`}>
                <p className="urgency-kicker">受診の優先度（医師視点の disposition）</p>
                <h2>{dispositionText.title}</h2>
                <p>{dispositionText.body}</p>
                <div className="contact-chips">
                  {dispositionText.contacts.map((c) => (
                    <span key={c} className="contact-chip">
                      {c}
                    </span>
                  ))}
                </div>
                {(disposition === 'call_119' || disposition === 'er_today') && (
                  <a className="btn btn-primary btn-call-inline" href="tel:119">
                    119に電話する
                  </a>
                )}
              </div>

              {mustNotMiss.length > 0 && (
                <section className="clinical-block warn-block">
                  <h3>まず頭に置く（見逃したくない疾患）</h3>
                  <p className="clinical-lead">
                    頻度が低くても、外すと重大な候補です。否定する材料が揃うまで残します。
                  </p>
                  <ul className="must-list">
                    {mustNotMiss.map((r) => (
                      <li key={r.condition.id}>
                        <strong>{r.condition.name}</strong>
                        <span>{r.specialty}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {(previewUrl || imageAnalysis) && (
                <div className="result-photo-block">
                  {previewUrl && (
                    <img src={previewUrl} alt="解析に使った写真" className="result-photo" />
                  )}
                  <div>
                    <h3>写真所見（参考）</h3>
                    <p>{imageAnalysis?.summary}</p>
                    <div className="finding-chips">
                      {imageAnalysis?.findings.map((f) => (
                        <span key={f.id} className="finding-chip" title={f.detail}>
                          {f.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="result-header">
                <h2>鑑別候補（可能性の高い順）</h2>
                <p>
                  {age}歳・{sexLabel}
                  {selectedSymptoms.length > 0 ? `・症状${selectedSymptoms.length}件` : ''}
                  {imageAnalysis ? '・写真解析あり' : ''}
                  。確定診断ではなく、診察前の整理です。
                </p>
                {symptomText.trim() && (
                  <blockquote className="complaint-quote">「{symptomText.trim()}」</blockquote>
                )}
              </div>

              {results.length === 0 ? (
                <div className="empty-result">
                  <p>一致する候補が見つかりませんでした。症状の選び直し、または直接受診をご検討ください。</p>
                  <button type="button" className="btn btn-secondary" onClick={() => setStep('symptoms')}>
                    症状を選び直す
                  </button>
                </div>
              ) : (
                <ol className="result-list">
                  {results.map((r, index) => (
                    <motion.li
                      key={r.condition.id}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.07 }}
                      className={`result-item ${r.mustNotMiss ? 'is-flag' : ''}`}
                    >
                      <div className="result-rank">
                        <span>{index + 1}</span>
                        <div
                          className="score-bar"
                          style={{ ['--score' as string]: `${Math.min(100, r.score)}%` }}
                        />
                      </div>
                      <div className="result-body">
                        <div className="result-title-row">
                          <h3>{r.condition.name}</h3>
                          <span className={`badge badge-${r.likelihood}`}>
                            {likelihoodLabel(r.likelihood)}
                          </span>
                          {r.mustNotMiss && <span className="badge badge-emergency">要除外</span>}
                          {r.visualScore !== undefined && (
                            <span className="badge badge-visual">写真一致 {r.visualScore}</span>
                          )}
                        </div>
                        <p className="specialty-line">受診科の目安：{r.specialty}</p>
                        <p className="result-summary">{r.condition.summary}</p>
                        {r.pearl && (
                          <p className="clinical-pearl">
                            <strong>専門医の視点</strong>
                            {r.pearl}
                          </p>
                        )}
                        <ul className="reason-list">
                          {r.reasons.map((reason) => (
                            <li key={reason}>{reason}</li>
                          ))}
                        </ul>
                        <div className="advice-grid">
                          <div>
                            <h4>家庭でのケア</h4>
                            <ul>
                              {r.condition.homeCare.map((line) => (
                                <li key={line}>{line}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4>こんなときは受診</h4>
                            <ul>
                              {r.condition.seeDoctorWhen.map((line) => (
                                <li key={line}>{line}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ol>
              )}

              <section className="clinical-block">
                <h3>再受診・救急の目安</h3>
                <ul className="recheck-list">
                  {recheckCriteria(results).map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </section>

              {doctorQuestions.trim() && (
                <section className="clinical-block">
                  <h3>あなたが医師に聞きたいこと</h3>
                  <p className="doctor-q-preview">{doctorQuestions.trim()}</p>
                </section>
              )}

              <section className="clinical-block summary-block">
                <div className="summary-head">
                  <h3>医師に渡すメモ</h3>
                  <button type="button" className="btn btn-secondary" onClick={copySummary}>
                    {copied ? 'コピーしました' : 'テキストをコピー'}
                  </button>
                </div>
                <pre className="visit-summary">{visitSummary}</pre>
              </section>

              <aside className="legal-note">
                <strong>重要</strong>
                <p>
                  本結果は一般的な臨床推論の枠組みに基づく参考情報です。問診・診察・検査なしに診断は確定できません。
                  呼吸困難、胸の強い痛み、意識障害、急な麻痺、アナフィラキシー疑いでは直ちに救急要請してください。
                </p>
              </aside>

              <div className="result-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setStep('detail')}>
                  入力を見直す
                </button>
                <button type="button" className="btn btn-primary" onClick={reset}>
                  はじめから
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

function WizardFrame({
  stepIndex,
  totalSteps = 4,
  title,
  subtitle,
  children,
  onBack,
  onNext,
  nextLabel,
  nextDisabled,
}: {
  stepIndex: number
  totalSteps?: number
  title: string
  subtitle: string
  children: ReactNode
  onBack: () => void
  onNext: () => void
  nextLabel: string
  nextDisabled?: boolean
}) {
  return (
    <motion.section
      className="wizard"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35 }}
    >
      <div className="wizard-progress" aria-hidden="true">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((n) => (
          <span key={n} className={`dot ${n <= stepIndex ? 'is-on' : ''}`} />
        ))}
      </div>
      <p className="wizard-step">
        Step {stepIndex} / {totalSteps}
      </p>
      <h2>{title}</h2>
      <p className="wizard-sub">{subtitle}</p>
      <div className="wizard-body">{children}</div>
      <div className="wizard-actions">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          戻る
        </button>
        <button type="button" className="btn btn-primary" onClick={onNext} disabled={nextDisabled}>
          {nextLabel}
        </button>
      </div>
    </motion.section>
  )
}

export default App
