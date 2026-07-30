import type { OnsetType } from '../data/clinical'
import type { ContextFlagId } from '../data/clinicalQuestions'
import type { HistoryId, Sex, SymptomId } from '../data/conditions'
import type { Disposition, RankedCondition } from './infer'
import { dispositionCopy, likelihoodLabel } from './infer'

export interface DoctorAnswerBlock {
  title: string
  body: string
}

interface AnswerInput {
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
  /** ユーザーが「医師に聞きたいこと」に書いた質問 */
  userQuestions?: string
}

/** これまでの入力に対するスーパードクター回答 */
export function buildDoctorAnswers(input: AnswerInput): {
  blocks: DoctorAnswerBlock[]
  answerText: string
} {
  const top = input.results.slice(0, 3)
  const flags = new Set(input.contextFlags)
  const disp = dispositionCopy(input.disposition)
  const blocks: DoctorAnswerBlock[] = []

  blocks.push({
    title: 'いまの優先度（回答）',
    body: `${disp.title}\n${disp.body}`,
  })

  if (top.length) {
    blocks.push({
      title: '問診からの見立て（参考・確定診断ではない）',
      body: top
        .map((r, i) => {
          const reasons = r.reasons.slice(0, 3).join('／') || r.condition.summary
          return `${i + 1}. ${r.condition.name}（${likelihoodLabel(r.likelihood)}・${r.specialty}）\n　根拠: ${reasons}${r.pearl ? `\n　専門医の視点: ${r.pearl}` : ''}`
        })
        .join('\n'),
    })
  } else {
    blocks.push({
      title: '問診からの見立て',
      body: 'いまの入力だけでは候補を十分に絞れません。症状の具体化、または直接の受診をご検討ください。',
    })
  }

  const must = top.filter((r) => r.mustNotMiss)
  if (must.length) {
    blocks.push({
      title: 'まず除外したいことへの回答',
      body: `頻度が低くても外したくない候補は ${must.map((r) => r.condition.name).join('、')} です。否定材料が揃うまで残し、${input.disposition === 'call_119' || input.disposition === 'er_today' ? '救急での評価を優先' : '必要なら本日〜近日の診察で確認'}してください。`,
    })
  }

  // 危険サインに対する直接回答
  const dangerAnswers: string[] = []
  if (flags.has('speech_change') || flags.has('leg_weakness')) {
    dangerAnswers.push('話し方の変化や片側の力が入りにくい症状は、脳卒中を最優先で考えます。迷わず救急要請してください。')
  }
  if (flags.has('worst_headache') || flags.has('neck_stiffness')) {
    dangerAnswers.push('「人生最悪の頭痛」や首の硬さは、二次性頭痛（くも膜下出血・髄膜炎など）を除外する対象です。救急受診が妥当です。')
  }
  if (flags.has('cold_sweat') || flags.has('radiation_arm_jaw')) {
    dangerAnswers.push('冷や汗や腕・あごへの広がる胸痛は急性冠症候群を強く意識します。救急評価を優先してください。')
  }
  if (flags.has('cannot_lie_flat')) {
    dangerAnswers.push('横になると息が苦しい（起座呼吸）は心不全増悪の古典的サインです。早めの循環器/救急評価が必要です。')
  }
  if (flags.has('one_sided_leg_swelling')) {
    dangerAnswers.push('片足だけの腫れ・痛みは深部静脈血栓を疑います。息切れを伴うなら肺塞栓も同時に考え、急いで受診してください。')
  }
  if (flags.has('blood_stool') || flags.has('blood_urine') || flags.has('blood_sputum')) {
    dangerAnswers.push('血便・血尿・血痰は自己判断で様子を見ず、出血源の評価が必要です。')
  }
  if (flags.has('urine_retention')) {
    dangerAnswers.push('尿が出にくい・出ないは閉塞や神経障害の緊急サインになり得ます。速やかに受診してください。')
  }
  if (flags.has('pregnancy_possible')) {
    dangerAnswers.push('妊娠の可能性がある場合、腹痛・出血・失神では異所性妊娠など緊急疾患を必ず除外します。産婦人科/救急へ相談してください。')
  }
  if (dangerAnswers.length) {
    blocks.push({
      title: '確認サインに対する回答',
      body: dangerAnswers.map((a) => `・${a}`).join('\n'),
    })
  }

  if (input.confirmAnswerLines?.length) {
    blocks.push({
      title: '確認問診の回答の読み取り',
      body: [
        ...input.confirmAnswerLines.slice(0, 6).map((l) => `・${l}`),
        '上記の確認内容は、緊急度と鑑別の重みづけに反映しています。',
      ].join('\n'),
    })
  }

  // 家庭での当面の方針
  const care: string[] = []
  if (input.disposition === 'home_observe' || input.disposition === 'clinic_soon') {
    care.push('水分・休息をとり、症状日記（いつ・何で悪化か）を残してください。')
    care.push('市販薬は症状に合わせて短期間のみ。持病の薬は自己中断しないでください。')
  }
  if (input.severity >= 4) {
    care.push('つらさ4〜5は、我慢せず本日受診の閾値を下げてよいレベルです。')
  }
  if (input.durationDays >= 7 && input.severity >= 3) {
    care.push('1週間以上続く中等度以上の症状は、慢性化や別疾患の混在を考え受診を推奨します。')
  }
  if (top[0]?.condition.homeCare?.length) {
    care.push(`候補「${top[0].condition.name}」に対する一般的な家庭ケア例: ${top[0].condition.homeCare.slice(0, 2).join('／')}`)
  }
  if (top[0]?.condition.seeDoctorWhen?.length) {
    care.push(`こんなときは受診: ${top[0].condition.seeDoctorWhen.slice(0, 3).join('／')}`)
  }
  if (care.length) {
    blocks.push({
      title: 'いまできること・受診の目安',
      body: care.map((c) => `・${c}`).join('\n'),
    })
  }

  // ユーザーの質問への回答
  const q = input.userQuestions?.trim()
  if (q) {
    blocks.push({
      title: 'あなたの質問への回答',
      body: answerUserQuestions(q, input, top, disp.title),
    })
  } else {
    blocks.push({
      title: 'よくある質問への回答',
      body: [
        `Q. どの科？ → 目安は ${top[0]?.specialty ?? 'まずかかりつけまたは内科'} です（確定ではありません）。`,
        `Q. 検査は必要？ → ${input.disposition === 'call_119' || input.disposition === 'er_today' ? '救急でのバイタル・必要検査を優先' : top.some((r) => r.mustNotMiss) ? '見逃し疾患を除外する検査の要否を医師と確認' : '症状経過次第。悪化や危険サインなら検査閾値を下げる'}。`,
        `Q. 仕事や運動は？ → つらさ${input.severity}/5、経過${input.durationDays}日を踏まえ、${input.severity >= 4 || input.disposition === 'clinic_today' ? '休養を優先' : '無理のない範囲で経過観察し、悪化なら休む'}のが安全です。`,
        `Q. 市販薬は？ → 対症療法は短期間。${input.history.includes('pregnancy') || flags.has('pregnancy_possible') ? '妊娠の可能性があれば自己判断の薬は避け、必ず確認を。' : '持病薬との相互作用が不安なら薬剤師/医師へ。'}`,
      ].join('\n'),
    })
  }

  blocks.push({
    title: '重要な注意',
    body: 'これは問診情報に基づく参考回答であり、診察・検査なしの確定診断ではありません。急な息苦しさ、強い胸痛、意識障害、麻痺、アナフィラキシー疑いでは119番へ。',
  })

  const answerText = blocks.map((b) => `【${b.title}】\n${b.body}`).join('\n\n')
  return { blocks, answerText }
}

function answerUserQuestions(
  raw: string,
  input: AnswerInput,
  top: RankedCondition[],
  dispositionTitle: string,
): string {
  const lines = raw
    .split(/\n|？|\?|。/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2)
    .slice(0, 6)

  const chunks = (lines.length ? lines : [raw.trim()]).map((q) => {
    const lower = q
    let ans = ''
    if (/休|仕事|学校|運動|出勤|登校/.test(lower)) {
      ans = `休養の判断: つらさ${input.severity}/5・${dispositionTitle}を踏まえ、${input.severity >= 4 || input.disposition === 'clinic_today' || input.disposition === 'er_today' ? '無理せず休む判断でよい' : '軽作業は可でも悪化したら即休養'}と考えます。`
    } else if (/薬|市販|解熱|痛み止め|抗生/.test(lower)) {
      ans = `薬について: 対症療法の市販薬は短期間の緩和目的。抗菌薬の自己開始は非推奨です。${input.history.includes('pregnancy') || input.contextFlags.includes('pregnancy_possible') ? '妊娠の可能性があれば必ず確認を。' : top[0] ? `「${top[0].condition.name}」を念頭に、薬剤師/医師へ用法を確認してください。` : '持病薬との重複に注意してください。'}`
    } else if (/検査|レントゲン|CT|心電図|採血|尿/.test(lower)) {
      ans = `検査について: ${top.some((r) => r.mustNotMiss) || input.disposition === 'er_today' || input.disposition === 'call_119' ? '見逃し疾患や緊急疾患を疑う状況では、今日の評価（必要なら画像・心電図・採血等）を優先' : 'まずは問診と診察。赤旗症状や遷延なら検査閾値を下げます'}。最終判断は受診先の医師です。`
    } else if (/何科|どの科|病院|受診/.test(lower)) {
      ans = `受診科の目安: ${top[0]?.specialty ?? 'かかりつけまたは内科'}。優先度は「${dispositionTitle}」です。`
    } else if (/大丈夫|様子見|放置|心配/.test(lower)) {
      ans = `様子見の可否: ${input.disposition === 'home_observe' ? 'いまは経過観察も選択肢ですが' : '自己判断の経過観察は推奨しにくく'}、${dangerLine(input)}再診・救急の目安を必ず守ってください。`
    } else if (/感染|うつる|出席|マスク/.test(lower)) {
      ans = '感染対策: 発熱・咳・咽頭痛がある間はマスク・手洗い、同居者との距離、出勤/登校の可否は地域ルールと症状で判断してください。'
    } else {
      ans = `質問「${q}」への参考回答: いまの主症状と確認所見からは「${dispositionTitle}」。上位候補は ${top.map((r) => r.condition.name).join('、') || '未確定'} です。個別の処方・診断確定は対面診療が必要です。`
    }
    return `Q. ${q}\nA. ${ans}`
  })

  return chunks.join('\n\n')
}

function dangerLine(input: AnswerInput): string {
  const flags = new Set(input.contextFlags)
  if (flags.has('speech_change') || flags.has('leg_weakness') || flags.has('worst_headache')) {
    return '危険サインがあるため救急を優先し、'
  }
  if (input.severity >= 4) return 'つらさが強いため、'
  return ''
}
