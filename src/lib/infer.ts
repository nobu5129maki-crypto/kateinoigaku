import {
  mustNotMissIds,
  specialtyById,
  type FeverBand,
  type OnsetType,
  type RedFlag,
  type RedFlagId,
  type SkinSensation,
  type SkinSite,
  redFlags,
} from '../data/clinical'
import {
  type AgeGroup,
  type Condition,
  type HistoryId,
  type Sex,
  type SymptomId,
  type Urgency,
  conditions,
} from '../data/conditions'
import { scoreVisualMatch, skinVisualProfiles } from '../data/skinProfiles'
import type { ImageAnalysisResult } from './imageAnalysis'

export interface ProfileInput {
  age: number
  sex: Sex
  symptoms: SymptomId[]
  history: HistoryId[]
  durationDays: number
  severity: 1 | 2 | 3 | 4 | 5
  imageAnalysis?: ImageAnalysisResult | null
  redFlagIds?: RedFlagId[]
  onset?: OnsetType
  feverBand?: FeverBand
  skinSite?: SkinSite
  skinSensation?: SkinSensation
  skinSpreading?: boolean
  skinBlisters?: boolean
}

export interface RankedCondition {
  condition: Condition
  score: number
  matchRatio: number
  matchedSymptoms: SymptomId[]
  reasons: string[]
  visualScore?: number
  specialty: string
  likelihood: 'high' | 'moderate' | 'low'
  mustNotMiss: boolean
}

export type Disposition =
  | 'call_119'
  | 'er_today'
  | 'clinic_today'
  | 'clinic_soon'
  | 'home_observe'

export interface TriageResult {
  activeFlags: RedFlag[]
  forcedDisposition: Disposition | null
  message: string
}

const urgencyWeight: Record<Urgency, number> = {
  emergency: 1.25,
  urgent: 1.12,
  soon: 1.04,
  home: 1,
}

export function toAgeGroup(age: number): AgeGroup {
  if (age < 3) return 'infant'
  if (age < 13) return 'child'
  if (age < 20) return 'teen'
  if (age < 65) return 'adult'
  return 'senior'
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export function evaluateTriage(flagIds: RedFlagId[], age: number): TriageResult {
  const activeFlags = redFlags.filter((f) => flagIds.includes(f.id))
  const ageFiltered =
    age >= 5 ? activeFlags.filter((f) => f.id !== 'infant_lethargy') : activeFlags

  if (ageFiltered.length === 0) {
    return {
      activeFlags: [],
      forcedDisposition: null,
      message: '',
    }
  }

  const immediate = ageFiltered.some((f) =>
    [
      'severe_chest_pain',
      'severe_breathlessness',
      'altered_consciousness',
      'stroke_signs',
      'anaphylaxis',
      'severe_bleeding',
      'seizure',
    ].includes(f.id),
  )

  return {
    activeFlags: ageFiltered,
    forcedDisposition: immediate ? 'call_119' : 'er_today',
    message: immediate
      ? '危険な兆候が含まれます。アプリの続きより、救急対応を優先してください。'
      : '至急の医療機関受診が望ましい危険兆候があります。',
  }
}

function toLikelihood(score: number): 'high' | 'moderate' | 'low' {
  if (score >= 62) return 'high'
  if (score >= 42) return 'moderate'
  return 'low'
}

export function likelihoodLabel(level: 'high' | 'moderate' | 'low'): string {
  switch (level) {
    case 'high':
      return '可能性：比較的高い'
    case 'moderate':
      return '可能性：中程度'
    case 'low':
      return '可能性：参考'
  }
}

export function inferConditions(input: ProfileInput): RankedCondition[] {
  const ageGroup = toAgeGroup(input.age)
  const selected = new Set(input.symptoms)
  const history = new Set<HistoryId>(input.history.filter((h) => h !== 'none'))
  const visual = input.imageAnalysis
  const onset = input.onset ?? 'unclear'
  const feverBand = input.feverBand ?? 'unknown'

  if (selected.size === 0 && !visual) return []

  const visualByCondition = new Map<string, { score: number; hint: string }>()
  if (visual) {
    for (const profile of skinVisualProfiles) {
      const score = scoreVisualMatch(visual.features, profile)
      if (score >= 35) {
        visualByCondition.set(profile.conditionId, { score, hint: profile.labelHint })
      }
    }
  }

  const ranked: RankedCondition[] = []

  for (const condition of conditions) {
    if (condition.ages && !condition.ages.includes(ageGroup)) continue
    if (condition.sexes && !condition.sexes.includes(input.sex)) continue

    const matchedSymptoms = condition.symptoms.filter((s) => selected.has(s))
    const visualHit = visualByCondition.get(condition.id)

    if (matchedSymptoms.length === 0 && !visualHit) continue

    const matchRatio =
      condition.symptoms.length === 0
        ? 0
        : matchedSymptoms.length / condition.symptoms.length
    const coverage = selected.size === 0 ? 0 : matchedSymptoms.length / selected.size

    let score = 0
    const reasons: string[] = []

    if (matchedSymptoms.length > 0) {
      score += matchedSymptoms.length * 12 + matchRatio * 28 + coverage * 18
      reasons.push(`症状の一致 ${matchedSymptoms.length}/${condition.symptoms.length}`)
    } else if (visualHit) {
      score += visualHit.score * 0.55
      reasons.push('写真所見からの候補')
    }

    if (visualHit) {
      score += visualHit.score * 0.38
      reasons.push(`写真: ${visualHit.hint}`)
    }

    if (condition.historyBoost) {
      const boostHits = condition.historyBoost.filter((h) => history.has(h))
      if (boostHits.length > 0) {
        score += boostHits.length * 8
        reasons.push('既往・体質が関連')
      }
    }

    if (input.severity >= 4 && (condition.urgency === 'urgent' || condition.urgency === 'emergency')) {
      score += 6
      reasons.push('自覚が強い')
    }

    if (input.durationDays >= 7 && condition.urgency !== 'emergency') {
      score += 4
      reasons.push('経過がやや長い')
    }

    if (
      input.durationDays <= 2 &&
      ['influenza', 'gastroenteritis', 'common_cold', 'covid_like', 'urticaria', 'impetigo'].includes(
        condition.id,
      )
    ) {
      score += 3
      reasons.push('急性経過と一致')
    }

    // 発症様式
    if (onset === 'sudden') {
      if (['angina_acs', 'appendicitis_suspect', 'urticaria', 'migraine', 'stroke_like'].includes(condition.id)) {
        score += 7
        reasons.push('突然発症は本症の典型経過に近い')
      }
      if (['tension_headache', 'ibs', 'psoriasis', 'tinea'].includes(condition.id)) {
        score -= 4
      }
    }
    if (onset === 'gradual') {
      if (['tension_headache', 'gerd', 'ibs', 'dermatitis', 'psoriasis', 'tinea'].includes(condition.id)) {
        score += 4
        reasons.push('徐々進行と一致しやすい')
      }
    }

    // 熱
    if (feverBand === 'high' || feverBand === 'moderate') {
      if (
        [
          'influenza',
          'covid_like',
          'gastroenteritis',
          'uti',
          'cellulitis',
          'impetigo',
          'otitis_media',
          'appendicitis_suspect',
        ].includes(condition.id)
      ) {
        score += feverBand === 'high' ? 8 : 5
        reasons.push('発熱が感染症・炎症疾患を示唆')
      }
      if (['tension_headache', 'anxiety_disorder', 'gerd', 'acne'].includes(condition.id)) {
        score -= 5
      }
    }
    if (feverBand === 'none') {
      if (['influenza', 'cellulitis', 'impetigo'].includes(condition.id)) {
        score -= 4
      }
    }

    // 皮膚問診
    const skinRelated = [
      'dermatitis',
      'urticaria',
      'tinea',
      'acne',
      'impetigo',
      'herpes_zoster',
      'bruise',
      'cellulitis',
      'psoriasis',
      'pigmented_lesion',
      'burn_erythema',
      'allergic_contact',
    ]
    if (skinRelated.includes(condition.id)) {
      if (input.skinSensation === 'itchy' && ['dermatitis', 'urticaria', 'tinea', 'allergic_contact', 'psoriasis'].includes(condition.id)) {
        score += 6
        reasons.push('かゆみが本症と一致')
      }
      if (input.skinSensation === 'painful' && ['herpes_zoster', 'cellulitis', 'burn_erythema', 'impetigo'].includes(condition.id)) {
        score += 7
        reasons.push('痛みが本症と一致')
      }
      if (input.skinSensation === 'both' && ['impetigo', 'herpes_zoster', 'cellulitis'].includes(condition.id)) {
        score += 4
      }
      if (input.skinBlisters && ['herpes_zoster', 'burn_erythema', 'impetigo', 'urticaria'].includes(condition.id)) {
        score += 8
        reasons.push('水疱所見が重要')
      }
      if (input.skinSpreading && ['cellulitis', 'impetigo', 'urticaria', 'allergic_contact'].includes(condition.id)) {
        score += 5
        reasons.push('拡大傾向あり')
      }
      if (input.skinSite === 'face' && ['acne', 'herpes_zoster', 'allergic_contact', 'dermatitis'].includes(condition.id)) {
        score += 3
      }
      if (input.skinSite === 'groin' && ['tinea', 'allergic_contact'].includes(condition.id)) {
        score += 5
        reasons.push('間擦部位は真菌・接触皮膚炎が多い')
      }
      if (input.skinSite === 'widespread' && condition.id === 'urticaria') {
        score += 5
        reasons.push('広範な発疹')
      }
    }

    // 年齢特異リスク
    if (ageGroup === 'senior') {
      if (condition.redFlag || mustNotMissIds.has(condition.id)) {
        score += 6
        reasons.push('高齢：非典型経過・重症化に注意')
      }
      if (selected.has('chest_pain') && condition.id === 'angina_acs') {
        score += 8
        reasons.push('高齢＋胸痛は虚血を優先除外')
      }
    }
    if ((ageGroup === 'infant' || ageGroup === 'child') && (feverBand === 'high' || feverBand === 'moderate')) {
      if (['otitis_media', 'impetigo', 'gastroenteritis', 'influenza'].includes(condition.id)) {
        score += 4
        reasons.push('小児の発熱では感染源検索が重要')
      }
    }

    if (history.has('pregnancy') && ['uti', 'gastroenteritis', 'influenza', 'dehydration'].includes(condition.id)) {
      score += 5
      reasons.push('妊娠中は閾値を下げて受診')
    }

    if (history.has('heart_disease') || history.has('diabetes') || history.has('smoking')) {
      if (condition.id === 'angina_acs' && selected.has('chest_pain')) {
        score += 8
        reasons.push('動脈硬化リスク因子あり')
      }
    }

    if (visual && visualHit && visualHit.score >= 60) {
      if (['pigmented_lesion', 'cellulitis', 'herpes_zoster', 'urticaria'].includes(condition.id)) {
        score += 6
        reasons.push('見た目の要注意所見')
      }
    }

    score *= urgencyWeight[condition.urgency]
    score = clamp(score, 0, 100)

    ranked.push({
      condition,
      score: Math.round(score * 10) / 10,
      matchRatio,
      matchedSymptoms,
      reasons,
      visualScore: visualHit ? Math.round(visualHit.score) : undefined,
      specialty: specialtyById[condition.id] ?? '内科',
      likelihood: toLikelihood(score),
      mustNotMiss: mustNotMissIds.has(condition.id) || Boolean(condition.redFlag),
    })
  }

  return ranked
    .sort((a, b) => b.score - a.score || b.matchRatio - a.matchRatio)
    .slice(0, 7)
}

export function highestUrgency(results: RankedCondition[]): Urgency {
  const order: Urgency[] = ['emergency', 'urgent', 'soon', 'home']
  for (const level of order) {
    if (results.some((r) => r.condition.urgency === level)) return level
  }
  return 'home'
}

export function resolveDisposition(
  results: RankedCondition[],
  triage: TriageResult,
  input: ProfileInput,
): Disposition {
  if (triage.forcedDisposition) return triage.forcedDisposition

  const urgency = highestUrgency(results)
  const ageGroup = toAgeGroup(input.age)

  if (urgency === 'emergency') return 'call_119'
  if (urgency === 'urgent') return 'er_today'

  if (
    (ageGroup === 'infant' || ageGroup === 'senior') &&
    (input.feverBand === 'high' || input.severity >= 4)
  ) {
    return 'clinic_today'
  }

  if (input.skinSpreading && input.skinSensation === 'painful' && input.feverBand !== 'none') {
    return 'clinic_today'
  }

  if (urgency === 'soon') return 'clinic_soon'
  return 'home_observe'
}

export function dispositionCopy(d: Disposition): {
  title: string
  body: string
  contacts: string[]
} {
  switch (d) {
    case 'call_119':
      return {
        title: '今すぐ救急要請（119）を優先',
        body: '危険な組み合わせ、または救急疾患の可能性が否定できません。アプリより救急対応を優先してください。',
        contacts: ['119（救急）', '地域の救急相談 #7119（対応地域）'],
      }
    case 'er_today':
      return {
        title: '本日中の救急外来・至急受診',
        body: '経過観察で帰宅判断するには材料が不足、または悪化リスクがあります。今日中に医療機関へ。',
        contacts: ['救急外来', '救急相談 #7119', '小児は #8000'],
      }
    case 'clinic_today':
      return {
        title: '本日〜明日の診療所／病院受診',
        body: '重症の可能性は相対的に低い一方、年齢・発熱・拡大などのため早めの評価が望ましいです。',
        contacts: ['かかりつけ医', '内科・皮膚科など結果の推奨科', '夜間は #7119'],
      }
    case 'clinic_soon':
      return {
        title: '数日以内の受診を推奨',
        body: 'まず自宅ケアと経過観察が可能ですが、改善しない・悪化するなら受診してください。',
        contacts: ['かかりつけ医', '推奨の診療科'],
      }
    case 'home_observe':
    default:
      return {
        title: '自宅で経過観察（悪化時は受診）',
        body: '現時点では危険兆候が目立たず、対症療法と安静が中心です。下記の再受診基準に注意。',
        contacts: ['悪化時はかかりつけ医', '迷う場合は #7119'],
      }
  }
}

export function urgencyLabel(u: Urgency): string {
  switch (u) {
    case 'emergency':
      return '救急対応を検討'
    case 'urgent':
      return 'できるだけ早く受診'
    case 'soon':
      return '近日中の受診を推奨'
    case 'home':
    default:
      return '自宅ケアで経過観察可'
  }
}

export function buildVisitSummary(input: {
  age: number
  sexLabel: string
  symptoms: string[]
  history: string[]
  durationDays: number
  severity: number
  onset: OnsetType
  feverBand: FeverBand
  redFlags: string[]
  results: RankedCondition[]
  dispositionTitle: string
  photoFindings?: string[]
  skinNote?: string
}): string {
  const onsetLabel =
    input.onset === 'sudden' ? '突然' : input.onset === 'gradual' ? '徐々に' : '不明'
  const feverLabel =
    {
      none: '発熱なし',
      low: '微熱',
      moderate: '中等度発熱',
      high: '高熱',
      unknown: '体温不明',
    }[input.feverBand]

  const lines = [
    '【家庭の医学アプリ 受診メモ】※診断ではありません',
    `年齢/性別: ${input.age}歳・${input.sexLabel}`,
    `主訴・症状: ${input.symptoms.join('、') || '（記載なし）'}`,
    `発症: ${onsetLabel} / 経過: ${input.durationDays}日 / つらさ: ${input.severity}/5 / ${feverLabel}`,
    `既往・体質: ${input.history.join('、') || '特記なし'}`,
  ]

  if (input.redFlags.length) {
    lines.push(`危険兆候の申告: ${input.redFlags.join('、')}`)
  }
  if (input.photoFindings?.length) {
    lines.push(`写真所見（参考）: ${input.photoFindings.join('、')}`)
  }
  if (input.skinNote) {
    lines.push(`皮膚の追加情報: ${input.skinNote}`)
  }

  lines.push(`推奨アクション: ${input.dispositionTitle}`)
  lines.push('鑑別候補（参考）:')
  input.results.slice(0, 5).forEach((r, i) => {
    lines.push(
      `  ${i + 1}. ${r.condition.name}（${likelihoodLabel(r.likelihood)} / ${r.specialty}${r.mustNotMiss ? ' / 要除外' : ''}）`,
    )
  })
  lines.push('※確定診断・処方は医師の診察に基づいてください。')
  return lines.join('\n')
}

export function recheckCriteria(results: RankedCondition[]): string[] {
  const base = [
    '呼吸が苦しくなった',
    '胸の痛みや冷や汗が出た',
    '意識がはっきりしない',
    '水分が取れない・尿が半日ほぼ出ない',
    '発疹が急速に広がる／喉が腫れる',
  ]
  if (results.some((r) => r.condition.id === 'appendicitis_suspect')) {
    base.push('腹痛が限局・増強し、歩行で痛い')
  }
  if (results.some((r) => r.condition.symptoms.includes('rash'))) {
    base.push('水疱・化膿・強い痛みを伴う皮膚変化')
  }
  return [...new Set(base)].slice(0, 6)
}
