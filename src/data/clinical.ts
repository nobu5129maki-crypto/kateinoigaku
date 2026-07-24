export type RedFlagId =
  | 'severe_chest_pain'
  | 'severe_breathlessness'
  | 'altered_consciousness'
  | 'stroke_signs'
  | 'anaphylaxis'
  | 'severe_bleeding'
  | 'seizure'
  | 'stiff_neck_fever'
  | 'suicidal'
  | 'infant_lethargy'
  | 'abdominal_rigid'

export interface RedFlag {
  id: RedFlagId
  label: string
  detail: string
  /** 該当時の行動 */
  action: string
}

/** 問診の最初に確認する危険兆候（見逃し防止） */
export const redFlags: RedFlag[] = [
  {
    id: 'severe_chest_pain',
    label: '強い胸の痛み・圧迫感（冷や汗を伴う）',
    detail: '急性冠症候群や大動脈疾患などを除外する必要があります。',
    action: '迷わず119番（救急要請）を検討してください。',
  },
  {
    id: 'severe_breathlessness',
    label: '息ができない・話せないほどの呼吸苦',
    detail: '気道・呼吸・循環の危機を疑います。',
    action: '直ちに119番へ。安静にして助けを呼んでください。',
  },
  {
    id: 'altered_consciousness',
    label: '意識がもうろう・呼びかけに反応が悪い',
    detail: '脳・代謝・ショックなどの重症病態の可能性があります。',
    action: '直ちに119番へ。無理に起こさず、可能なら横向きで様子を見てください。',
  },
  {
    id: 'stroke_signs',
    label: '顔のゆがみ・腕の力が入らない・ろれつが回らない',
    detail: '脳卒中の可能性。発症時刻の記録が治療判断に重要です。',
    action: '直ちに119番へ。発症時刻を控えてください。',
  },
  {
    id: 'anaphylaxis',
    label: '全身の発疹＋息苦しさ／喉の腫れ・声のかすれ',
    detail: 'アナフィラキシーの可能性があります。',
    action: '直ちに119番へ。エピペンがあれば指示通り使用。',
  },
  {
    id: 'severe_bleeding',
    label: '止まらない出血・大量吐血・下血',
    detail: '循環動態が不安定になる前の介入が必要です。',
    action: '圧迫止血しつつ119番を検討してください。',
  },
  {
    id: 'seizure',
    label: 'けいれん・ひきつけ',
    detail: '持続やけが、初めての発作では救急対応が必要です。',
    action: '5分以上続く／連続する／受傷があれば119番へ。',
  },
  {
    id: 'stiff_neck_fever',
    label: '高熱＋首が硬い・光がとてもつらい',
    detail: '髄膜炎などを除外すべき組み合わせです。',
    action: '救急外来の受診、または119番を検討してください。',
  },
  {
    id: 'suicidal',
    label: '死にたい気持ちが強い・自傷の計画がある',
    detail: '精神救急の対象になり得ます。ひとりにしないでください。',
    action: '身近な人に連絡し、救急受診や相談窓口（#7119等）へ。',
  },
  {
    id: 'infant_lethargy',
    label: '乳幼児のぐったり・顔色不良・ミルクが摂れない',
    detail: '小児は急変しやすいため、様子見を長引かせない判断が重要です。',
    action: '小児救急（#8000）相談、または救急受診を。',
  },
  {
    id: 'abdominal_rigid',
    label: '板のように硬い腹痛・動かないと痛みが耐えられない',
    detail: '腹膜炎など外科救急の可能性があります。',
    action: '飲食を控え、救急外来へ。強い場合は119番。',
  },
]

export type OnsetType = 'sudden' | 'gradual' | 'unclear'
export type FeverBand = 'none' | 'low' | 'moderate' | 'high' | 'unknown'
export type SkinSite = 'face' | 'trunk' | 'limbs' | 'groin' | 'widespread' | 'unknown'
export type SkinSensation = 'itchy' | 'painful' | 'both' | 'neither'

export const onsetOptions: { id: OnsetType; label: string }[] = [
  { id: 'sudden', label: '突然始まった' },
  { id: 'gradual', label: '徐々に悪くなった' },
  { id: 'unclear', label: 'はっきりしない' },
]

export const feverOptions: { id: FeverBand; label: string }[] = [
  { id: 'none', label: '熱はない' },
  { id: 'low', label: '37.5〜38.0℃くらい' },
  { id: 'moderate', label: '38.1〜39.0℃くらい' },
  { id: 'high', label: '39℃を超える／測れていないがとても熱い' },
  { id: 'unknown', label: '測っていない・不明' },
]

export const skinSiteOptions: { id: SkinSite; label: string }[] = [
  { id: 'face', label: '顔・首' },
  { id: 'trunk', label: '胴体' },
  { id: 'limbs', label: '手足' },
  { id: 'groin', label: '陰部・わき・皮膚の折れ目' },
  { id: 'widespread', label: '広範囲' },
  { id: 'unknown', label: 'わからない' },
]

export const skinSensationOptions: { id: SkinSensation; label: string }[] = [
  { id: 'itchy', label: 'かゆい' },
  { id: 'painful', label: '痛い' },
  { id: 'both', label: 'かゆい＋痛い' },
  { id: 'neither', label: 'あまり感じない' },
]

/** 疾患ごとの推奨受診科 */
export const specialtyById: Record<string, string> = {
  common_cold: '内科・耳鼻咽喉科',
  influenza: '内科',
  allergic_rhinitis: '耳鼻咽喉科・アレルギー科',
  acute_bronchitis: '内科・呼吸器内科',
  asthma_attack: '内科・呼吸器内科（増悪時は救急）',
  gastroenteritis: '内科・消化器内科',
  ibs: '消化器内科',
  constipation: '内科・消化器内科',
  migraine: '内科・脳神経内科',
  tension_headache: '内科',
  uti: '内科・泌尿器科・婦人科',
  angina_acs: '救急・循環器内科',
  gerd: '消化器内科',
  anxiety_disorder: '心療内科・精神科・内科',
  anemia_suspect: '内科',
  lumbago: '整形外科・内科',
  otitis_media: '耳鼻咽喉科・小児科',
  conjunctivitis: '眼科',
  dermatitis: '皮膚科',
  urticaria: '皮膚科・アレルギー科（呼吸苦なら救急）',
  tinea: '皮膚科',
  acne: '皮膚科',
  impetigo: '皮膚科・小児科',
  herpes_zoster: '皮膚科・内科（早めに）',
  bruise: '整形外科・外科（頭部は救急）',
  cellulitis: '皮膚科・内科・救急',
  psoriasis: '皮膚科',
  pigmented_lesion: '皮膚科',
  burn_erythema: '皮膚科・形成外科・救急',
  allergic_contact: '皮膚科',
  menstrual_cramps: '婦人科',
  covid_like: '内科',
  appendicitis_suspect: '救急・外科',
  dehydration: '内科・救急',
  hypertension_symptom: '内科・循環器内科',
  diabetes_uncontrolled: '内科・糖尿病内科',
}

/** 危険な見逃し（must-not-miss）を特に意識する疾患ID */
export const mustNotMissIds = new Set([
  'angina_acs',
  'appendicitis_suspect',
  'asthma_attack',
  'cellulitis',
  'herpes_zoster',
  'pigmented_lesion',
  'urticaria',
  'dehydration',
])
