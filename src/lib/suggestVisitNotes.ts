import type { OnsetType } from '../data/clinical'
import type { ContextFlagId } from '../data/clinicalQuestions'
import type { HistoryId, Sex, SymptomId } from '../data/conditions'
import type { Disposition, RankedCondition } from './infer'

export interface VisitNoteSuggestions {
  /** 医師に聞きたいこと（提案） */
  askDoctor: string[]
  /** 追加で伝えたいこと（受診時に伝える要点） */
  tellDoctor: string[]
  askDoctorText: string
  tellDoctorText: string
}

interface SuggestInput {
  age: number
  sex: Sex
  symptoms: SymptomId[]
  history: HistoryId[]
  durationDays: number
  severity: 1 | 2 | 3 | 4 | 5
  onset?: OnsetType
  contextFlags: ContextFlagId[]
  results: RankedCondition[]
  disposition: Disposition
  symptomText?: string
  confirmAnswerLines?: string[]
  photoSummary?: string
}

const symptomLabel: Partial<Record<SymptomId, string>> = {
  fever: '発熱',
  cough: '咳',
  chest_pain: '胸痛',
  shortness_of_breath: '息切れ',
  headache: '頭痛',
  abdominal_pain: '腹痛',
  rash: '発疹',
  itch: 'かゆみ',
  dizziness: 'めまい',
  palpitations: '動悸',
  diarrhea: '下痢',
  vomiting: '嘔吐',
  urinary_pain: '排尿痛',
  back_pain: '腰痛',
  joint_pain: '関節痛',
  numbness: 'しびれ',
  confusion: '意識のはっきりしない感じ',
  calf_pain: 'ふくらはぎの痛み',
  wheezing: 'ゼーゼー',
  sore_throat: 'のどの痛み',
  eye_pain: '眼痛',
  ear_pain: '耳痛',
  menstrual_pain: '強い生理痛',
  vaginal_bleeding: '不正出血',
  testicular_pain: '陰嚢・睾丸の痛み',
  depression_mood: '気分の落ち込み',
  anxiety: '不安',
  fatigue: 'だるさ',
}

function uniq(lines: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const line of lines) {
    const t = line.trim()
    if (!t || seen.has(t)) continue
    seen.add(t)
    out.push(t)
  }
  return out
}

/** スーパードクター視点で「聞くこと」「伝えること」を組み立てる */
export function suggestVisitNotes(input: SuggestInput): VisitNoteSuggestions {
  const ask: string[] = []
  const tell: string[] = []
  const top = input.results.slice(0, 3)
  const flags = new Set(input.contextFlags)
  const sx = new Set(input.symptoms)
  const hist = new Set(input.history.filter((h) => h !== 'none'))

  // —— 共通の聞きたいこと ——
  if (input.disposition === 'call_119' || input.disposition === 'er_today') {
    ask.push('今すぐ救急受診でよいですか？　待合で様子を見てよいサインはありますか？')
    ask.push('到着までにやってはいけないこと（食事・鎮痛薬・入浴など）はありますか？')
  } else if (input.disposition === 'clinic_today') {
    ask.push('本日中にどの科を受診すべきですか？')
    ask.push('今日は検査（採血・画像・心電図など）が必要になりそうですか？')
  } else {
    ask.push('どのタイミングで再診・救急受診に切り替えるべきですか？')
  }

  ask.push('市販薬や自宅ケアで試してよいものと、避けた方がよいものは何ですか？')
  ask.push('仕事・学校・運動はどのくらい休む必要がありますか？')

  if (top[0]) {
    ask.push(
      `いちばん疑わしい「${top[0].condition.name}」を、何で裏づけ／否定しますか？`,
    )
  }
  if (top.some((r) => r.mustNotMiss)) {
    const names = top.filter((r) => r.mustNotMiss).map((r) => r.condition.name).join('、')
    ask.push(`見逃したくない疾患（${names}）は、今日の診察でどこまで除外できますか？`)
  }

  // 症状特異の聞きたいこと
  if (sx.has('chest_pain') || sx.has('shortness_of_breath') || sx.has('palpitations')) {
    ask.push('心電図やトロポニンなど、心臓の緊急検査は必要ですか？')
  }
  if (
    sx.has('headache') &&
    (flags.has('worst_headache') ||
      flags.has('neck_stiffness') ||
      flags.has('photophobia') ||
      input.onset === 'sudden')
  ) {
    ask.push('頭部CTや髄液検査など、二次性頭痛の精査は必要ですか？')
  } else if (sx.has('headache')) {
    ask.push('片頭痛の治療薬や予防薬の適応はありますか？')
  }  if (sx.has('abdominal_pain') || sx.has('vomiting') || sx.has('diarrhea')) {
    ask.push('お腹の画像検査や、絶食・点滴は必要ですか？')
  }
  if (sx.has('rash') || sx.has('itch')) {
    ask.push('ステロイド外用や抗ヒスタミン薬は使ってよいですか？　強さの目安は？')
  }
  if (sx.has('urinary_pain') || sx.has('frequent_urination') || sx.has('flank_pain')) {
    ask.push('尿検査や抗菌薬は必要ですか？　飲水の目安は？')
  }
  if (sx.has('depression_mood') || sx.has('anxiety') || sx.has('insomnia')) {
    ask.push('心の不調として、専門家への相談や安全確認（希死念慮など）が必要ですか？')
  }
  if (hist.has('pregnancy') || flags.has('pregnancy_possible')) {
    ask.push('妊娠中・妊娠の可能性を踏まえた、安全な薬と検査は何ですか？')
  }
  if (hist.has('diabetes') || hist.has('heart_disease') || hist.has('immunosuppressed')) {
    ask.push('持病や常用薬との関係で、いつもと違う注意点はありますか？')
  }

  // —— 追加で伝えたいこと（受診メモの要点） ——
  const chief =
    input.symptomText?.trim() ||
    input.symptoms
      .map((id) => symptomLabel[id] ?? id)
      .filter(Boolean)
      .slice(0, 6)
      .join('、')
  if (chief) {
    tell.push(`主訴: ${chief}`)
  }
  tell.push(
    `経過: ${input.durationDays}日くらい / つらさ ${input.severity}/5 / ${input.age}歳`,
  )

  if (input.confirmAnswerLines?.length) {
    tell.push(`確認問診の要点: ${input.confirmAnswerLines.slice(0, 5).join('；')}`)
  }

  const warnBits: string[] = []
  if (flags.has('cold_sweat')) warnBits.push('冷や汗')
  if (flags.has('radiation_arm_jaw')) warnBits.push('腕・あごへの放散痛')
  if (flags.has('worst_headache')) warnBits.push('人生最悪の頭痛')
  if (flags.has('neck_stiffness')) warnBits.push('首の硬さ')
  if (flags.has('speech_change')) warnBits.push('話し方の変化')
  if (flags.has('leg_weakness')) warnBits.push('手足の力の入りにくさ')
  if (flags.has('blood_stool')) warnBits.push('血便・黒色便')
  if (flags.has('blood_urine')) warnBits.push('血尿')
  if (flags.has('blood_sputum')) warnBits.push('血痰')
  if (flags.has('one_sided_leg_swelling')) warnBits.push('片足の腫れ・痛み')
  if (flags.has('cannot_lie_flat')) warnBits.push('横になると息苦しい')
  if (flags.has('urine_retention')) warnBits.push('尿が出にくい')
  if (flags.has('pregnancy_possible')) warnBits.push('妊娠の可能性')
  if (warnBits.length) {
    tell.push(`特に伝えたいサイン: ${warnBits.join('、')}`)
  }

  const triggerBits: string[] = []
  if (flags.has('on_exertion')) triggerBits.push('労作で悪化')
  if (flags.has('at_rest')) triggerBits.push('安静時にも出る')
  if (flags.has('after_meal')) triggerBits.push('食後悪化')
  if (flags.has('at_night')) triggerBits.push('夜間悪化')
  if (flags.has('sick_contact')) triggerBits.push('周囲に同様症状')
  if (flags.has('travel')) triggerBits.push('長時間移動・旅行あり')
  if (flags.has('injury')) triggerBits.push('外傷・転倒あり')
  if (flags.has('new_medication')) triggerBits.push('新しい薬・サプリ')
  if (flags.has('alcohol')) triggerBits.push('飲酒との関連')
  if (flags.has('stress')) triggerBits.push('強いストレス・睡眠不足')
  if (triggerBits.length) {
    tell.push(`きっかけ・誘因: ${triggerBits.join('、')}`)
  }

  if (hist.size) {
    const labels: string[] = []
    const map: Partial<Record<HistoryId, string>> = {
      hypertension: '高血圧',
      diabetes: '糖尿病',
      asthma: '喘息',
      heart_disease: '心臓病',
      copd: 'COPD',
      pregnancy: '妊娠',
      smoking: '喫煙',
      immunosuppressed: '免疫抑制',
      dvt_pe_history: '血栓既往',
      anticoagulant: '抗凝固薬',
      stroke: '脳卒中既往',
      cancer: 'がん',
      allergy: 'アレルギー',
      migraine: '片頭痛',
      depression: 'うつ・不安の既往',
      alcohol_heavy: '飲酒多め',
    }
    for (const h of hist) {
      if (map[h]) labels.push(map[h]!)
    }
    if (labels.length) tell.push(`既往・体質: ${labels.join('、')}`)
  }

  if (input.photoSummary) {
    tell.push(`写真所見（参考）: ${input.photoSummary}`)
  }

  if (top.length) {
    tell.push(
      `家庭アプリの参考鑑別（確定診断ではない）: ${top
        .map((r) => r.condition.name)
        .join('、')}`,
    )
  }

  tell.push(
    'お願い: 上記を踏まえ、今日必要な検査・帰宅可否・再診の目安を教えてください。',
  )

  const askDoctor = uniq(ask).slice(0, 8)
  const tellDoctor = uniq(tell).slice(0, 10)

  return {
    askDoctor,
    tellDoctor,
    askDoctorText: askDoctor.map((q, i) => `${i + 1}. ${q}`).join('\n'),
    tellDoctorText: tellDoctor.map((t) => `・${t}`).join('\n'),
  }
}
