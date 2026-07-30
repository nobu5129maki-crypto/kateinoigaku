import type { FeverBand, OnsetType, SkinSensation } from './clinical'
import type { ContextFlagId, CourseTrend, PainQuality } from './clinicalQuestions'
import type { Sex, SymptomId } from './conditions'

/** スーパードクターが症状に応じて聞く確認質問の効果 */
export type ConfirmEffect =
  | { type: 'context'; flag: ContextFlagId }
  | { type: 'pain'; quality: PainQuality }
  | { type: 'onset'; value: OnsetType }
  | { type: 'fever'; value: FeverBand }
  | { type: 'course'; value: CourseTrend }
  | { type: 'skinSensation'; value: SkinSensation }
  | { type: 'skinSpreading'; value: boolean }
  | { type: 'skinBlisters'; value: boolean }
  | { type: 'addSymptom'; id: SymptomId }

export interface ConfirmOption {
  id: string
  label: string
  effects: ConfirmEffect[]
}

export interface ConfirmQuestion {
  id: string
  /** 医師が患者に投げる確認の問い */
  prompt: string
  /** なぜ聞くか（簡潔） */
  why: string
  /** 関連症状（いずれかあれば候補） */
  triggers: SymptomId[]
  /** 追加の表示条件 */
  when?: (ctx: { sex: Sex; age: number; symptoms: Set<SymptomId> }) => boolean
  options: ConfirmOption[]
  priority: number
}

const yesNo = (
  yesEffects: ConfirmEffect[],
  noEffects: ConfirmEffect[] = [],
): ConfirmOption[] => [
  { id: 'yes', label: 'はい', effects: yesEffects },
  { id: 'no', label: 'いいえ', effects: noEffects },
  { id: 'unsure', label: 'わからない', effects: [] },
]

export const confirmQuestions: ConfirmQuestion[] = [
  // —— 胸痛・循環 ——
  {
    id: 'chest_quality',
    prompt: '胸の痛みは、圧迫される・締めつけられる感じですか？',
    why: '虚血（狭心症・心筋梗塞）を確認します',
    triggers: ['chest_pain'],
    priority: 100,
    options: [
      { id: 'pressure', label: '圧迫・締めつけ', effects: [{ type: 'pain', quality: 'pressure' }] },
      { id: 'sharp', label: '刺す・切れるよう', effects: [{ type: 'pain', quality: 'sharp' }] },
      { id: 'burning', label: '焼ける・熱い', effects: [{ type: 'pain', quality: 'burning' }] },
      { id: 'other', label: 'それ以外／うまく言えない', effects: [{ type: 'pain', quality: 'unknown' }] },
    ],
  },
  {
    id: 'chest_radiation',
    prompt: '痛みは腕・あご・背中へ広がりますか？',
    why: '急性冠症候群の重要な手がかりです',
    triggers: ['chest_pain'],
    priority: 98,
    options: yesNo([{ type: 'context', flag: 'radiation_arm_jaw' }]),
  },
  {
    id: 'chest_exertion',
    prompt: '体を動かしたときに胸の症状が強くなりますか？',
    why: '労作性虚血を確認します',
    triggers: ['chest_pain', 'shortness_of_breath', 'palpitations'],
    priority: 96,
    options: yesNo([{ type: 'context', flag: 'on_exertion' }]),
  },
  {
    id: 'cold_sweat',
    prompt: '冷や汗や強い吐き気を伴いますか？',
    why: '自律神経反応は救急疾患の合図になり得ます',
    triggers: ['chest_pain', 'abdominal_pain', 'syncope'],
    priority: 97,
    options: yesNo([{ type: 'context', flag: 'cold_sweat' }]),
  },
  {
    id: 'orthopnea',
    prompt: '横になると息が苦しく、起き上がると楽になりますか？',
    why: '心不全の起座呼吸を確認します',
    triggers: ['shortness_of_breath', 'swelling', 'cough'],
    priority: 94,
    options: yesNo([{ type: 'context', flag: 'cannot_lie_flat' }]),
  },

  // —— 頭痛・神経 ——
  {
    id: 'worst_ha',
    prompt: '今の頭痛は「人生で最悪」と言える強さですか？',
    why: 'くも膜下出血など二次性頭痛を除外します',
    triggers: ['headache'],
    priority: 99,
    options: yesNo([{ type: 'context', flag: 'worst_headache' }, { type: 'onset', value: 'sudden' }]),
  },
  {
    id: 'ha_onset',
    prompt: '頭痛は突然（雷が落ちたように）始まりましたか？',
    why: '突然発症は緊急疾患を優先します',
    triggers: ['headache', 'vision_blur', 'numbness', 'confusion'],
    priority: 95,
    options: yesNo([{ type: 'onset', value: 'sudden' }]),
  },
  {
    id: 'neck_stiff',
    prompt: '首が硬く、前に曲げにくいですか？',
    why: '髄膜炎を警戒します',
    triggers: ['headache', 'fever', 'neck_pain'],
    priority: 93,
    options: yesNo([{ type: 'context', flag: 'neck_stiffness' }]),
  },
  {
    id: 'photophobia',
    prompt: '光がとてもつらく感じますか？',
    why: '片頭痛と髄膜炎の鑑別に使います',
    triggers: ['headache', 'eye_pain', 'nausea'],
    priority: 88,
    options: yesNo([{ type: 'context', flag: 'photophobia' }]),
  },
  {
    id: 'speech_change',
    prompt: '話し方・ろれつ・顔のゆがみに変化はありますか？',
    why: '脳卒中を最優先で除外します',
    triggers: ['numbness', 'confusion', 'dizziness', 'syncope', 'headache'],
    priority: 101,
    options: yesNo([
      { type: 'context', flag: 'speech_change' },
      { type: 'addSymptom', id: 'confusion' },
    ]),
  },
  {
    id: 'leg_weak',
    prompt: '手足に力が入りにくい、または片側の麻痺感がありますか？',
    why: '脳卒中・脊髄の緊急サインです',
    triggers: ['numbness', 'back_pain', 'neck_pain', 'confusion'],
    priority: 100,
    options: yesNo([{ type: 'context', flag: 'leg_weakness' }]),
  },

  // —— 呼吸器 ——
  {
    id: 'dyspnea_rest',
    prompt: '安静にしていても息苦しさがありますか？',
    why: '安静時呼吸困難は重症度が高いです',
    triggers: ['shortness_of_breath', 'wheezing', 'chest_pain'],
    priority: 92,
    options: yesNo([{ type: 'context', flag: 'at_rest' }]),
  },
  {
    id: 'blood_sputum',
    prompt: '痰に血が混じりますか？',
    why: '肺炎・塞栓・結核などを広く疑います',
    triggers: ['cough', 'shortness_of_breath', 'chest_pain'],
    priority: 90,
    options: yesNo([{ type: 'context', flag: 'blood_sputum' }]),
  },
  {
    id: 'night_wheeze',
    prompt: '夜〜明け方に咳やゼーゼーが悪化しますか？',
    why: '喘息・逆流・心不全の手がかりです',
    triggers: ['cough', 'wheezing', 'shortness_of_breath'],
    priority: 84,
    options: yesNo([{ type: 'context', flag: 'at_night' }]),
  },
  {
    id: 'sick_contact_resp',
    prompt: '周囲に同じ風邪・発熱の人がいますか？',
    why: '感染性を確認します',
    triggers: ['fever', 'cough', 'sore_throat', 'runny_nose', 'sneeze'],
    priority: 70,
    options: yesNo([{ type: 'context', flag: 'sick_contact' }]),
  },

  // —— 消化器 ——
  {
    id: 'after_meal',
    prompt: '食後に痛みや症状が強くなりますか？',
    why: '胆道・潰瘍・逆流を鑑別します',
    triggers: ['abdominal_pain', 'nausea', 'vomiting', 'chest_pain'],
    priority: 86,
    options: yesNo([{ type: 'context', flag: 'after_meal' }]),
  },
  {
    id: 'blood_stool',
    prompt: '便に血が混じる、または黒い便が出ますか？',
    why: '消化管出血を除外します',
    triggers: ['abdominal_pain', 'diarrhea', 'vomiting', 'appetite_loss', 'fatigue'],
    priority: 91,
    options: yesNo([{ type: 'context', flag: 'blood_stool' }]),
  },
  {
    id: 'alcohol_gi',
    prompt: '飲酒との関係がありそうですか？（深酒のあとなど）',
    why: '膵炎・肝炎・痛風などを意識します',
    triggers: ['abdominal_pain', 'nausea', 'vomiting', 'jaundice', 'joint_pain'],
    priority: 72,
    options: yesNo([{ type: 'context', flag: 'alcohol' }]),
  },

  // —— 泌尿器 ——
  {
    id: 'blood_urine',
    prompt: '尿に血が混じる、または赤茶色ですか？',
    why: '結石・感染・腫瘍の手がかりです',
    triggers: ['urinary_pain', 'frequent_urination', 'flank_pain', 'abdominal_pain'],
    priority: 89,
    options: yesNo([{ type: 'context', flag: 'blood_urine' }]),
  },
  {
    id: 'urine_retention',
    prompt: '尿が出にくい、または出ない感じがありますか？',
    why: '閉塞・神経障害の緊急サインです',
    triggers: ['urinary_pain', 'frequent_urination', 'back_pain', 'flank_pain'],
    priority: 87,
    options: yesNo([{ type: 'context', flag: 'urine_retention' }]),
  },

  // —— 血栓・下肢 ——
  {
    id: 'one_leg',
    prompt: '片足だけがむくむ・痛いですか？',
    why: '深部静脈血栓を優先除外します',
    triggers: ['calf_pain', 'swelling', 'shortness_of_breath', 'chest_pain'],
    priority: 95,
    options: yesNo([{ type: 'context', flag: 'one_sided_leg_swelling' }]),
  },
  {
    id: 'travel',
    prompt: '最近、長時間の移動や旅行がありましたか？',
    why: '血栓症リスクを確認します',
    triggers: ['calf_pain', 'swelling', 'shortness_of_breath', 'chest_pain'],
    priority: 80,
    options: yesNo([{ type: 'context', flag: 'travel' }]),
  },

  // —— 皮膚 ——
  {
    id: 'skin_itch_pain',
    prompt: '皮疹は主にかゆいですか、痛いですか？',
    why: '湿疹とか帯状疱疹などの切り分けです',
    triggers: ['rash', 'itch', 'swelling'],
    priority: 85,
    options: [
      { id: 'itchy', label: 'かゆい', effects: [{ type: 'skinSensation', value: 'itchy' }] },
      { id: 'painful', label: '痛い', effects: [{ type: 'skinSensation', value: 'painful' }] },
      { id: 'both', label: '両方', effects: [{ type: 'skinSensation', value: 'both' }] },
      { id: 'neither', label: 'どちらでもない', effects: [{ type: 'skinSensation', value: 'neither' }] },
    ],
  },
  {
    id: 'skin_spread',
    prompt: '皮疹は広がってきていますか？',
    why: '蜂窩織炎や蕁麻疹の勢いを見ます',
    triggers: ['rash', 'itch', 'swelling'],
    priority: 82,
    options: yesNo([{ type: 'skinSpreading', value: true }]),
  },
  {
    id: 'skin_blister',
    prompt: '水ぶくれはありますか？',
    why: '帯状疱疹・熱傷・膿痂疹を意識します',
    triggers: ['rash', 'itch'],
    priority: 83,
    options: yesNo([{ type: 'skinBlisters', value: true }]),
  },
  {
    id: 'new_med_rash',
    prompt: '最近、新しい薬やサプリを始めましたか？',
    why: '薬疹・接触皮膚炎の誘因です',
    triggers: ['rash', 'itch', 'swelling'],
    priority: 78,
    options: yesNo([{ type: 'context', flag: 'new_medication' }]),
  },
  {
    id: 'insect',
    prompt: '虫刺されや動物との接触はありましたか？',
    why: '刺咬・アレルギー反応を確認します',
    triggers: ['rash', 'itch', 'swelling'],
    priority: 74,
    options: yesNo([{ type: 'context', flag: 'insect_bite' }]),
  },

  // —— 疼痛全般 ——
  {
    id: 'injury',
    prompt: 'けが・打撲・転倒のきっかけはありますか？',
    why: '骨折・挫傷・神経刺激を鑑別します',
    triggers: ['back_pain', 'joint_pain', 'muscle_pain', 'neck_pain', 'calf_pain'],
    priority: 81,
    options: yesNo([{ type: 'context', flag: 'injury' }]),
  },
  {
    id: 'pain_night',
    prompt: '夜中に痛みで目が覚めますか？',
    why: '炎症・虚血・神経痛の勢いを見ます',
    triggers: ['joint_pain', 'back_pain', 'abdominal_pain', 'tooth_pain', 'ear_pain'],
    priority: 76,
    options: yesNo([{ type: 'context', flag: 'at_night' }]),
  },
  {
    id: 'course_trend',
    prompt: 'ここ数日の勢いとして、いちばん近いのはどれですか？',
    why: '悪化なら受診優先度を上げます',
    triggers: [
      'fever',
      'cough',
      'abdominal_pain',
      'chest_pain',
      'headache',
      'rash',
      'shortness_of_breath',
      'diarrhea',
      'fatigue',
    ],
    priority: 68,
    options: [
      { id: 'worsening', label: '悪くなってきている', effects: [{ type: 'course', value: 'worsening' }] },
      { id: 'stable', label: 'あまり変わらない', effects: [{ type: 'course', value: 'stable' }] },
      { id: 'improving', label: '良くなってきている', effects: [{ type: 'course', value: 'improving' }] },
      { id: 'fluctuating', label: '波がある', effects: [{ type: 'course', value: 'fluctuating' }] },
    ],
  },

  // —— 代謝・精神 ——
  {
    id: 'skipped_meal',
    prompt: '食事を抜けたり、低血糖っぽい感じはありますか？',
    why: '低血糖・自律神経症状を確認します',
    triggers: ['dizziness', 'tremor', 'confusion', 'palpitations', 'fatigue', 'thirst'],
    priority: 77,
    options: yesNo([{ type: 'context', flag: 'fasting_or_skipped_meal' }]),
  },
  {
    id: 'stress',
    prompt: '強いストレスや睡眠不足が続いていますか？',
    why: '緊張型頭痛・不安・IBSなどの背景です',
    triggers: ['headache', 'anxiety', 'insomnia', 'abdominal_pain', 'palpitations', 'depression_mood'],
    priority: 65,
    options: yesNo([{ type: 'context', flag: 'stress' }]),
  },

  // —— 婦人科 ——
  {
    id: 'pregnancy_possible',
    prompt: '妊娠の可能性はありますか？',
    why: '異所性妊娠など緊急疾患の除外に必須です',
    triggers: [
      'abdominal_pain',
      'vaginal_bleeding',
      'menstrual_pain',
      'nausea',
      'dizziness',
      'syncope',
    ],
    when: ({ sex, age }) => sex === 'female' && age >= 12 && age <= 55,
    priority: 97,
    options: yesNo([{ type: 'context', flag: 'pregnancy_possible' }]),
  },
]

export interface ConfirmPickContext {
  symptoms: SymptomId[]
  sex: Sex
  age: number
  max?: number
}

/** 症状に応じた確認質問を優先度順で抽出（PC・スマホ共通） */
export function pickConfirmQuestions(ctx: ConfirmPickContext): ConfirmQuestion[] {
  const set = new Set(ctx.symptoms)
  const max = ctx.max ?? 8

  // 無効な trigger（型キャスト誤用）を安全に無視
  const valid = confirmQuestions.filter((q) => {
    if (q.when && !q.when({ sex: ctx.sex, age: ctx.age, symptoms: set })) return false
    return q.triggers.some((t) => set.has(t))
  })

  valid.sort((a, b) => b.priority - a.priority)

  const picked: ConfirmQuestion[] = []
  const seen = new Set<string>()
  for (const q of valid) {
    if (seen.has(q.id)) continue
    seen.add(q.id)
    picked.push(q)
    if (picked.length >= max) break
  }

  // 症状が少ない場合の汎用確認
  if (picked.length < 3) {
    const fallback = confirmQuestions.find((q) => q.id === 'course_trend')
    if (fallback && !seen.has(fallback.id)) picked.push(fallback)
  }

  return picked
}
