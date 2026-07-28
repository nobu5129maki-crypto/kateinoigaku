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
  | 'sudden_vision_loss'
  | 'sudden_hearing_loss_flag'
  | 'one_sided_leg_danger'
  | 'testicular_acute_pain'

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
  {
    id: 'sudden_vision_loss',
    label: '急に見えにくくなった・視野が欠ける',
    detail: '網膜剥離・急性緑内障・脳血管障害などを除外する必要があります。',
    action: '眼科救急または119番を検討してください。',
  },
  {
    id: 'sudden_hearing_loss_flag',
    label: '急に片耳（または両耳）が聞こえにくくなった',
    detail: '突発性難聴は早期受診が望ましい領域です。',
    action: 'できるだけ早く耳鼻咽喉科を受診してください。',
  },
  {
    id: 'one_sided_leg_danger',
    label: '片足だけ急に腫れて痛い（息切れもある）',
    detail: '深部静脈血栓症・肺塞栓の可能性があります。',
    action: 'マッサージせず、救急外来へ。息切れがあれば119番。',
  },
  {
    id: 'testicular_acute_pain',
    label: '陰嚢・睾丸の急な強い痛み',
    detail: '精巣捻転は時間との勝負になる外科救急です。',
    action: '直ちに救急・泌尿器科へ。',
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
  corn_clavus: '皮膚科・フットケア',
  menstrual_cramps: '婦人科',
  covid_like: '内科',
  appendicitis_suspect: '救急・外科',
  dehydration: '内科・救急',
  hypertension_symptom: '内科・循環器内科',
  diabetes_uncontrolled: '内科・糖尿病内科',
  pneumonia_suspect: '呼吸器内科・救急',
  copd_exacerbation: '呼吸器内科・救急',
  pneumothorax_suspect: '救急・呼吸器外科',
  pe_suspect: '救急・循環器内科',
  heart_failure: '循環器内科・救急',
  afib_suspect: '循環器内科',
  dvt_suspect: '循環器内科・血管外科',
  stroke_tia: '救急・脳神経内科・脳神経外科',
  meningitis_suspect: '救急・感染症内科',
  bppv_vertigo: '耳鼻咽喉科・脳神経内科',
  bells_palsy: '脳神経内科・耳鼻咽喉科',
  cholecystitis_suspect: '消化器内科・外科',
  pancreatitis_suspect: '救急・消化器内科',
  peptic_ulcer: '消化器内科',
  ibd_flare: '消化器内科',
  hepatitis_suspect: '消化器内科・肝臓内科',
  urolithiasis: '泌尿器科・救急',
  pyelonephritis: '内科・泌尿器科・救急',
  testicular_torsion: '救急・泌尿器科',
  sciatica: '整形外科',
  gout_attack: '整形外科・リウマチ科・内科',
  fracture_suspect: '整形外科・救急',
  sinusitis: '耳鼻咽喉科',
  tonsillitis: '耳鼻咽喉科・内科',
  sudden_hearing_loss: '耳鼻咽喉科（至急）',
  acute_glaucoma: '眼科救急',
  retinal_detachment_suspect: '眼科救急',
  dental_abscess: '歯科・口腔外科',
  hypoglycemia: '救急・糖尿病内科',
  thyroid_storm_or_thyrotoxic: '内分泌内科',
  hyperglycemia_crisis: '救急・糖尿病内科',
  ectopic_pregnancy: '救急・産婦人科',
  pid_suspect: '婦人科',
  ovarian_torsion_suspect: '救急・産婦人科',
  depression_episode: '精神科・心療内科',
  panic_attack: '心療内科・精神科・内科',
  ra_flare: 'リウマチ科・内科',
  sepsis_suspect: '救急・感染症内科',
  kawasaki_suspect: '小児科・救急',
  croup_suspect: '小児科・救急',
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
  'pneumonia_suspect',
  'pneumothorax_suspect',
  'pe_suspect',
  'heart_failure',
  'dvt_suspect',
  'stroke_tia',
  'meningitis_suspect',
  'pancreatitis_suspect',
  'pyelonephritis',
  'testicular_torsion',
  'sudden_hearing_loss',
  'acute_glaucoma',
  'retinal_detachment_suspect',
  'hypoglycemia',
  'hyperglycemia_crisis',
  'ectopic_pregnancy',
  'ovarian_torsion_suspect',
  'sepsis_suspect',
  'kawasaki_suspect',
  'croup_suspect',
])

/** 既存疾患へのスーパードクター・パール（specialtyConditions 側は Condition.pearl を優先） */
export const clinicalPearlsById: Record<string, string> = {
  angina_acs: '循環器：胸痛は性状（圧迫）・誘因（労作）・放散・随伴（冷汗・嘔気）でACS確率を上げる。',
  appendicitis_suspect: '外科：痛みが心窩部→右下腹部へ移動する病歴は古典的。歩行時痛・反跳痛を重視。',
  asthma_attack: '呼吸器：会話困難・陥没呼吸・サイレントチェストは生命危険。吸入反応を見る。',
  migraine: '脳神経：今までで最悪の頭痛、雷鳴頭痛は二次性頭痛を除外するまで片頭痛と決めない。',
  uti: '泌尿器：発熱・側腹部痛があれば腎盂腎炎。男性の初回UTIは複雑性として精査。',
  gerd: '消化器：胸やけでも労作誘発・冷汗があればまず心疾患を除外。',
  herpes_zoster: '皮膚科：痛みが発疹に先行し得る。眼周囲は眼科併診をためらわない。',
  cellulitis: '感染症：境界不明瞭な熱感ある赤み＋発熱は抗菌治療の適応検討。壊死性は激痛・急拡大。',
  influenza: '内科：発症48時間以内の抗ウイルス検討と、肺炎合併・持病悪化の監視が要点。',
  dehydration: '救急：乳幼児・高齢者は代償が破綻しやすい。尿量・意識・皮膚ツルゴールを見る。',
}