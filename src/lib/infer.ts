import {
  mustNotMissIds,
  specialtyById,
  clinicalPearlsById,
  type FeverBand,
  type OnsetType,
  type RedFlag,
  type RedFlagId,
  type SkinSensation,
  type SkinSite,
  redFlags,
} from '../data/clinical'
import {
  type CourseTrend,
  type ContextFlagId,
  type PainQuality,
} from '../data/clinicalQuestions'
import { conditionPrecision } from '../data/conditionPrecision'
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
  courseTrend?: CourseTrend
  painQuality?: PainQuality
  contextFlags?: ContextFlagId[]
  doctorQuestions?: string
  freeText?: string
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
  pearl?: string
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
      'testicular_acute_pain',
      'sudden_vision_loss',
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

function buildSymptomIdf(): Map<SymptomId, number> {
  const df = new Map<SymptomId, number>()
  for (const c of conditions) {
    for (const s of new Set(c.symptoms)) {
      df.set(s, (df.get(s) ?? 0) + 1)
    }
  }
  const n = Math.max(conditions.length, 1)
  const idf = new Map<SymptomId, number>()
  for (const [s, count] of df) {
    idf.set(s, Math.log((n + 1) / (count + 1)) + 1)
  }
  return idf
}

const symptomIdf = buildSymptomIdf()

function textMatchesKeywords(freeText: string, keywords?: string[]): boolean {
  if (!freeText.trim() || !keywords?.length) return false
  return keywords.some((k) => freeText.includes(k.normalize('NFKC').toLowerCase()))
}

function toLikelihood(score: number): 'high' | 'moderate' | 'low' {
  if (score >= 68) return 'high'
  if (score >= 48) return 'moderate'
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
  const courseTrend = input.courseTrend ?? 'unknown'
  const painQuality = input.painQuality ?? 'unknown'
  const flags = new Set(input.contextFlags ?? [])
  const freeText = (input.freeText ?? '').normalize('NFKC').toLowerCase()

  if (selected.size === 0 && !visual && !freeText.trim()) return []

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
  const rankScores = new Map<string, number>()

  for (const condition of conditions) {
    if (condition.ages && !condition.ages.includes(ageGroup)) continue
    if (condition.sexes && !condition.sexes.includes(input.sex)) continue

    const precision = conditionPrecision[condition.id] ?? {}
    const specificity = precision.specificity ?? 2
    const keySymptoms = precision.keySymptoms ?? []
    const againstSymptoms = precision.againstSymptoms ?? []
    const minMatch = precision.minMatch ?? 1

    const matchedSymptoms = condition.symptoms.filter((s) => selected.has(s))
    const keyMatched = keySymptoms.filter((s) => selected.has(s))
    const againstMatched = againstSymptoms.filter((s) => selected.has(s))
    const visualHit = visualByCondition.get(condition.id)
    const textHint = textMatchesKeywords(freeText, precision.textKeywords)

    // 核症状の過半数（2つ以下なら全部）が無いと、決め手（文章・写真）なしでは出さない
    const keyNeed =
      keySymptoms.length === 0 ? 0 : keySymptoms.length <= 2 ? keySymptoms.length : keySymptoms.length - 1
    if (keySymptoms.length > 0 && keyMatched.length < keyNeed && !textHint && !visualHit) {
      continue
    }

    if (
      matchedSymptoms.length === 0 &&
      keyMatched.length === 0 &&
      !visualHit &&
      !textHint
    ) {
      continue
    }

    if (!textHint && !visualHit && matchedSymptoms.length < minMatch && keyMatched.length === 0) {
      continue
    }

    // 発疹だけの特異皮膚疾患は、文章／写真／足病変の問診がないとノイズになるので抑制
    if (
      specificity >= 4 &&
      !textHint &&
      !visualHit &&
      matchedSymptoms.length > 0 &&
      matchedSymptoms.every((s) => s === 'rash' || s === 'itch')
    ) {
      const footLike =
        (condition.id === 'corn_clavus' || condition.id === 'plantar_wart') &&
        input.skinSite === 'limbs' &&
        (input.skinSensation === 'painful' || input.skinSensation === 'both')
      if (!footLike) continue
    }

    const matchRatio =
      condition.symptoms.length === 0
        ? 0
        : matchedSymptoms.length / condition.symptoms.length
    const coverage = selected.size === 0 ? 0 : matchedSymptoms.length / selected.size

    let score = 0
    const reasons: string[] = []

    // 希少な症状ほど高得点（IDF）→「だるい」だけでは広がらず、特異症状が効く
    let idfSum = 0
    for (const s of matchedSymptoms) {
      idfSum += symptomIdf.get(s) ?? 1
    }
    if (matchedSymptoms.length > 0) {
      score += idfSum * 8 + matchRatio * 14 + coverage * 8
      reasons.push(`症状の一致 ${matchedSymptoms.length}/${condition.symptoms.length}`)
    }

    if (keyMatched.length > 0) {
      const keyRatio = keyMatched.length / Math.max(keySymptoms.length, 1)
      score += keyMatched.length * 14 + keyRatio * 18
      reasons.push(`核となる症状 ${keyMatched.length}/${keySymptoms.length}`)
    } else if (keySymptoms.length > 0 && textHint) {
      score += 8
    } else if (keySymptoms.length > 0) {
      score -= 12
    }

    if (againstMatched.length > 0) {
      score -= againstMatched.length * 14
      reasons.push(`合わない症状あり（−${againstMatched.length}）`)
    }

    if (textHint) {
      score += 28 + specificity * 5
      reasons.push('症状の文章が本症の典型表現に近い')
    }

    // ざっくり疾患は「一致が薄い」と下げる／特異疾患は上げる
    score += (specificity - 2) * (textHint || keyMatched.length >= keyNeed ? 6 : 1)
    if (specificity <= 2 && matchRatio < 0.45 && !textHint) {
      score -= 10
    }

    // 選んだ症状のうち、本症で説明できない割合が大きいと減点（寄せ集め一致を抑制）
    if (selected.size >= 3) {
      const unexplained = [...selected].filter((s) => !condition.symptoms.includes(s)).length
      const unexplainedRatio = unexplained / selected.size
      if (unexplainedRatio >= 0.6 && specificity <= 3 && !textHint) {
        score -= unexplainedRatio * 14
      }
    }

    if (matchedSymptoms.length === 0 && visualHit && !textHint) {
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
      ['influenza', 'gastroenteritis', 'common_cold', 'covid_like', 'urticaria', 'impetigo', 'strep_pharyngitis'].includes(
        condition.id,
      )
    ) {
      score += 3
      reasons.push('急性経過と一致')
    }

    // 慢性皮膚・足病変は長い経過を支持
    if (input.durationDays >= 14 && ['corn_clavus', 'plantar_wart', 'tinea', 'psoriasis', 'plantar_fasciitis'].includes(condition.id)) {
      score += 6
      reasons.push('比較的長い経過が本症と一致')
    }

    // 発症様式
    if (onset === 'sudden') {
      if (
        [
          'angina_acs',
          'appendicitis_suspect',
          'urticaria',
          'migraine',
          'stroke_tia',
          'pneumothorax_suspect',
          'pe_suspect',
          'urolithiasis',
          'testicular_torsion',
          'ectopic_pregnancy',
          'ovarian_torsion_suspect',
          'sudden_hearing_loss',
          'acute_glaucoma',
          'retinal_detachment_suspect',
          'panic_attack',
          'gout_attack',
        ].includes(condition.id)
      ) {
        score += 7
        reasons.push('突然発症は本症の典型経過に近い')
      }
      if (['tension_headache', 'ibs', 'psoriasis', 'tinea', 'depression_episode', 'corn_clavus', 'plantar_wart'].includes(condition.id)) {
        score -= 4
      }
    }
    if (onset === 'gradual') {
      if (
        [
          'tension_headache',
          'gerd',
          'ibs',
          'dermatitis',
          'psoriasis',
          'tinea',
          'heart_failure',
          'ra_flare',
          'corn_clavus',
          'plantar_wart',
          'plantar_fasciitis',
          'scabies',
        ].includes(condition.id)
      ) {
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
          'pneumonia_suspect',
          'pyelonephritis',
          'meningitis_suspect',
          'sepsis_suspect',
          'tonsillitis',
          'strep_pharyngitis',
          'cholecystitis_suspect',
          'kawasaki_suspect',
        ].includes(condition.id)
      ) {
        score += feverBand === 'high' ? 8 : 5
        reasons.push('発熱が感染症・炎症疾患を示唆')
      }
      if (['tension_headache', 'anxiety_disorder', 'gerd', 'acne', 'panic_attack', 'corn_clavus', 'plantar_wart', 'plantar_fasciitis'].includes(condition.id)) {
        score -= 8
      }
    }
    if (feverBand === 'none') {
      if (['influenza', 'cellulitis', 'impetigo', 'sepsis_suspect', 'pyelonephritis', 'strep_pharyngitis'].includes(condition.id)) {
        score -= 4
      }
      if (['corn_clavus', 'plantar_wart', 'tension_headache', 'allergic_rhinitis'].includes(condition.id)) {
        score += 3
      }
    }

    // 経過トレンド
    if (courseTrend === 'worsening') {
      if (condition.urgency === 'urgent' || condition.urgency === 'emergency' || condition.redFlag) {
        score += 5
        reasons.push('悪化傾向は要除外疾患を優先')
      }
    }
    if (courseTrend === 'improving' && condition.urgency === 'home') {
      score += 3
    }

    // 痛みの性状
    if (painQuality === 'pressure' || painQuality === 'tight') {
      if (condition.id === 'angina_acs') {
        score += 8
        reasons.push('圧迫・締めつけは虚血を示唆')
      }
      if (condition.id === 'tension_headache' && selected.has('headache')) {
        score += 4
      }
    }
    if (painQuality === 'throbbing' && condition.id === 'migraine') {
      score += 6
      reasons.push('拍動性頭痛は片頭痛らしい')
    }
    if (painQuality === 'burning' && ['gerd', 'peptic_ulcer', 'herpes_zoster'].includes(condition.id)) {
      score += 5
      reasons.push('灼熱感が本症と一致しやすい')
    }
    if (painQuality === 'sharp' && ['pneumothorax_suspect', 'urolithiasis', 'fracture_suspect'].includes(condition.id)) {
      score += 4
    }

    // コンテキストフラグ（スーパードクター問診）
    if (flags.has('cold_sweat') || flags.has('radiation_arm_jaw') || flags.has('on_exertion')) {
      if (condition.id === 'angina_acs') {
        score += 10
        reasons.push('冷汗・放散・労作誘発はACSを強く示唆')
      }
    }
    if (flags.has('at_rest') && condition.id === 'angina_acs' && selected.has('chest_pain')) {
      score += 4
      reasons.push('安静時胸痛は不安定性を意識')
    }
    if (flags.has('cannot_lie_flat') && condition.id === 'heart_failure') {
      score += 10
      reasons.push('起座呼吸は心不全を強く示唆')
    }
    if (flags.has('one_sided_leg_swelling')) {
      if (condition.id === 'dvt_suspect' || condition.id === 'pe_suspect') {
        score += 10
        reasons.push('片側下肢腫脹は血栓症を優先')
      }
    }
    if (flags.has('worst_headache') || flags.has('photophobia') || flags.has('neck_stiffness')) {
      if (['meningitis_suspect', 'stroke_tia', 'migraine'].includes(condition.id)) {
        score += condition.id === 'migraine' ? 3 : 9
        reasons.push('最悪頭痛・項部硬直・光過敏は二次性頭痛を警戒')
      }
    }
    if (flags.has('speech_change') || flags.has('leg_weakness')) {
      if (condition.id === 'stroke_tia') {
        score += 12
        reasons.push('言語・麻痺の変化は脳卒中を最優先')
      }
    }
    if (flags.has('blood_stool') && ['peptic_ulcer', 'ibd_flare', 'gastroenteritis'].includes(condition.id)) {
      score += 7
      reasons.push('血便は消化管出血・炎症を示唆')
    }
    if (flags.has('blood_urine') && ['urolithiasis', 'uti', 'pyelonephritis'].includes(condition.id)) {
      score += 6
      reasons.push('血尿が尿路疾患を支持')
    }
    if (flags.has('blood_sputum') && ['pneumonia_suspect', 'pe_suspect', 'acute_bronchitis'].includes(condition.id)) {
      score += 6
      reasons.push('血痰は精査が必要')
    }
    if (flags.has('after_meal') && ['cholecystitis_suspect', 'gerd', 'peptic_ulcer', 'pancreatitis_suspect'].includes(condition.id)) {
      score += 5
      reasons.push('食後悪化が消化器疾患を支持')
    }
    if (flags.has('on_exertion') && ['angina_acs', 'heart_failure', 'anemia_suspect'].includes(condition.id)) {
      score += 4
    }
    if (flags.has('at_night') && ['asthma_attack', 'gerd', 'gout_attack', 'croup_suspect'].includes(condition.id)) {
      score += 4
      reasons.push('夜間悪化が本症と一致しやすい')
    }
    if (flags.has('sick_contact') && ['influenza', 'covid_like', 'gastroenteritis', 'common_cold'].includes(condition.id)) {
      score += 5
      reasons.push('周囲の流行・接触歴あり')
    }
    if (flags.has('travel') && ['pe_suspect', 'dvt_suspect', 'covid_like'].includes(condition.id)) {
      score += 6
      reasons.push('長時間移動は血栓・感染リスク')
    }
    if (flags.has('injury') && ['fracture_suspect', 'bruise', 'sciatica'].includes(condition.id)) {
      score += 7
      reasons.push('外傷歴が支持')
    }
    if (flags.has('new_medication') && ['urticaria', 'allergic_contact', 'hepatitis_suspect'].includes(condition.id)) {
      score += 5
      reasons.push('新規薬剤は発疹・肝障害の手がかり')
    }
    if (flags.has('alcohol') && ['pancreatitis_suspect', 'hepatitis_suspect', 'gout_attack', 'afib_suspect'].includes(condition.id)) {
      score += 5
      reasons.push('飲酒との関連が疑われる')
    }
    if (flags.has('fasting_or_skipped_meal') && condition.id === 'hypoglycemia') {
      score += 8
      reasons.push('食事抜けは低血糖を支持')
    }
    if (flags.has('pregnancy_possible')) {
      if (['ectopic_pregnancy', 'ovarian_torsion_suspect', 'uti', 'pyelonephritis', 'pe_suspect'].includes(condition.id)) {
        score += 8
        reasons.push('妊娠関連の緊急疾患を優先除外')
      }
    }
    if (flags.has('urine_retention') && ['sciatica', 'urolithiasis'].includes(condition.id)) {
      score += 8
      reasons.push('尿閉は神経・閉塞の緊急サイン')
    }
    if (flags.has('stress') && ['anxiety_disorder', 'panic_attack', 'tension_headache', 'ibs', 'depression_episode'].includes(condition.id)) {
      score += 4
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
      'corn_clavus',
      'plantar_wart',
      'scabies',
    ]
    if (skinRelated.includes(condition.id)) {
      if (input.skinSensation === 'painful' && ['herpes_zoster', 'cellulitis', 'burn_erythema', 'impetigo', 'corn_clavus', 'plantar_wart'].includes(condition.id)) {
        score += 7
        reasons.push('痛みが本症と一致')
      }
      if (input.skinSensation === 'itchy' && ['dermatitis', 'urticaria', 'tinea', 'allergic_contact', 'psoriasis', 'scabies'].includes(condition.id)) {
        score += 6
        reasons.push('かゆみが本症と一致')
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
      if (input.skinSite === 'limbs' && ['corn_clavus', 'plantar_wart', 'tinea'].includes(condition.id)) {
        score += condition.id === 'corn_clavus' || condition.id === 'plantar_wart' ? 8 : 4
        reasons.push('手足の病変として矛盾しない')
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
      if (selected.has('confusion') && ['stroke_tia', 'sepsis_suspect', 'hypoglycemia', 'pneumonia_suspect'].includes(condition.id)) {
        score += 5
        reasons.push('高齢者の意識変化は重症疾患を広く疑う')
      }
    }
    if ((ageGroup === 'infant' || ageGroup === 'child') && (feverBand === 'high' || feverBand === 'moderate')) {
      if (['otitis_media', 'impetigo', 'gastroenteritis', 'influenza', 'kawasaki_suspect', 'croup_suspect'].includes(condition.id)) {
        score += 4
        reasons.push('小児の発熱では感染源検索が重要')
      }
    }

    if (history.has('pregnancy') && ['uti', 'gastroenteritis', 'influenza', 'dehydration', 'ectopic_pregnancy', 'pe_suspect', 'pyelonephritis'].includes(condition.id)) {
      score += 5
      reasons.push('妊娠中は閾値を下げて受診')
    }

    if (history.has('heart_disease') || history.has('diabetes') || history.has('smoking')) {
      if (condition.id === 'angina_acs' && selected.has('chest_pain')) {
        score += 8
        reasons.push('動脈硬化リスク因子あり')
      }
    }

    if (history.has('copd') && ['copd_exacerbation', 'pneumonia_suspect'].includes(condition.id)) {
      score += 6
      reasons.push('COPD既往が増悪リスク')
    }
    if (history.has('dvt_pe_history') && ['pe_suspect', 'dvt_suspect'].includes(condition.id)) {
      score += 8
      reasons.push('血栓既往は再発を警戒')
    }
    if (history.has('stroke') && condition.id === 'stroke_tia') {
      score += 6
    }
    if (history.has('immunosuppressed') && ['sepsis_suspect', 'pneumonia_suspect', 'cellulitis'].includes(condition.id)) {
      score += 6
      reasons.push('免疫低下では重症感染を広く疑う')
    }

    if (visual && visualHit && visualHit.score >= 60) {
      if (['pigmented_lesion', 'cellulitis', 'herpes_zoster', 'urticaria'].includes(condition.id)) {
        score += 6
        reasons.push('見た目の要注意所見')
      }
    }

    // 紛らわしい疾患ペア：相手の決め手ワードがある側を優先
    const rivalGroups: string[][] = [
      ['corn_clavus', 'plantar_wart', 'plantar_fasciitis'],
      ['common_cold', 'strep_pharyngitis', 'tonsillitis', 'allergic_rhinitis'],
      ['migraine', 'tension_headache'],
      ['uti', 'pyelonephritis', 'urolithiasis'],
      ['otitis_media', 'otitis_externa'],
      ['dermatitis', 'scabies', 'urticaria', 'allergic_contact'],
    ]
    for (const group of rivalGroups) {
      if (!group.includes(condition.id)) continue
      for (const rivalId of group) {
        if (rivalId === condition.id) continue
        const rivalKeys = conditionPrecision[rivalId]?.textKeywords
        if (textMatchesKeywords(freeText, rivalKeys) && !textHint) {
          score -= 22
          reasons.push('より特異的な別候補の表現あり')
        }
      }
      if (textHint) score += 8
    }

    let rankScore = score * urgencyWeight[condition.urgency] + specificity * 1.5
    if (textHint) rankScore += 12
    const displayScore = clamp(rankScore, 0, 100)

    ranked.push({
      condition,
      score: Math.round(displayScore * 10) / 10,
      matchRatio,
      matchedSymptoms,
      reasons,
      visualScore: visualHit ? Math.round(visualHit.score) : undefined,
      specialty: specialtyById[condition.id] ?? '内科',
      likelihood: toLikelihood(displayScore),
      mustNotMiss: mustNotMissIds.has(condition.id) || Boolean(condition.redFlag),
      pearl: condition.pearl ?? clinicalPearlsById[condition.id],
    })
    rankScores.set(condition.id, rankScore)
  }

  return ranked
    .sort(
      (a, b) =>
        (rankScores.get(b.condition.id) ?? b.score) - (rankScores.get(a.condition.id) ?? a.score) ||
        (conditionPrecision[b.condition.id]?.specificity ?? 2) -
          (conditionPrecision[a.condition.id]?.specificity ?? 2) ||
        b.matchRatio - a.matchRatio,
    )
    .slice(0, 10)
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

  const flags = new Set(input.contextFlags ?? [])
  if (
    flags.has('cold_sweat') ||
    flags.has('speech_change') ||
    flags.has('worst_headache') ||
    (flags.has('pregnancy_possible') && input.symptoms.includes('abdominal_pain'))
  ) {
    return 'er_today'
  }
  if (input.courseTrend === 'worsening' && input.severity >= 4) {
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
  courseTrend?: string
  painQuality?: string
  contextNotes?: string[]
  doctorQuestions?: string
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

  if (input.courseTrend) lines.push(`経過の勢い: ${input.courseTrend}`)
  if (input.painQuality) lines.push(`痛みの性状: ${input.painQuality}`)
  if (input.contextNotes?.length) lines.push(`追加問診: ${input.contextNotes.join('、')}`)
  if (input.doctorQuestions?.trim()) lines.push(`患者からの質問: ${input.doctorQuestions.trim()}`)

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
    if (r.pearl) lines.push(`     専門知見: ${r.pearl}`)
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
