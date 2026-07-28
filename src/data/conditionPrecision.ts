import type { SymptomId } from './conditions'

/** 疾患ごとの細分化メタ（必須症状・除外・文言・特異度） */
export interface ConditionPrecision {
  /** 欠けると候補から落とす／大幅減点する核症状 */
  keySymptoms?: SymptomId[]
  /** あると本症を弱める症状 */
  againstSymptoms?: SymptomId[]
  /** 自由記述の決め手ワード */
  textKeywords?: string[]
  /** 1=ざっくり 5=かなり特異的 */
  specificity?: number
  /** テキスト一致なし時、最低でも必要な一致症状数 */
  minMatch?: number
}

export const conditionPrecision: Record<string, ConditionPrecision> = {
  // —— 呼吸器・感染 ——
  common_cold: {
    keySymptoms: ['runny_nose', 'sore_throat', 'sneeze'],
    againstSymptoms: ['shortness_of_breath', 'chest_pain', 'confusion'],
    textKeywords: ['かぜ', '風邪', '鼻かぜ', 'のどかぜ'],
    specificity: 2,
    minMatch: 2,
  },
  influenza: {
    keySymptoms: ['fever', 'muscle_pain', 'chills'],
    againstSymptoms: ['rash'],
    textKeywords: ['インフル', 'インフルエンザ', '急な高熱', '関節が痛'],
    specificity: 3,
    minMatch: 2,
  },
  covid_like: {
    keySymptoms: ['fever', 'cough', 'fatigue'],
    textKeywords: ['コロナ', 'covid', '嗅覚', '味がしない', '味覚'],
    specificity: 3,
    minMatch: 2,
  },
  allergic_rhinitis: {
    keySymptoms: ['sneeze', 'runny_nose', 'itch'],
    againstSymptoms: ['fever', 'muscle_pain'],
    textKeywords: ['花粉症', 'アレルギー性鼻炎', 'くしゃみ連続', '目がかゆ'],
    specificity: 4,
    minMatch: 2,
  },
  acute_bronchitis: {
    keySymptoms: ['cough'],
    againstSymptoms: ['wheezing'],
    textKeywords: ['気管支炎', '咳が長引', '痰'],
    specificity: 3,
    minMatch: 1,
  },
  asthma_attack: {
    keySymptoms: ['shortness_of_breath', 'wheezing', 'cough'],
    textKeywords: ['喘息', 'ゼーゼー', 'ヒューヒュー', '夜間の咳'],
    specificity: 4,
    minMatch: 2,
  },
  pneumonia_suspect: {
    keySymptoms: ['fever', 'cough', 'shortness_of_breath'],
    textKeywords: ['肺炎', '息が切れる', '胸が痛く咳'],
    specificity: 4,
    minMatch: 2,
  },
  copd_exacerbation: {
    keySymptoms: ['shortness_of_breath', 'wheezing', 'cough'],
    textKeywords: ['COPD', '肺気腫', '慢性気管支炎', 'いつもより息苦'],
    specificity: 4,
    minMatch: 2,
  },
  pneumothorax_suspect: {
    keySymptoms: ['chest_pain', 'shortness_of_breath'],
    againstSymptoms: ['fever', 'cough'],
    textKeywords: ['気胸', '突然の胸痛', '片側の胸'],
    specificity: 5,
    minMatch: 2,
  },
  pe_suspect: {
    keySymptoms: ['shortness_of_breath', 'chest_pain'],
    textKeywords: ['肺塞栓', 'エコノミークラス', '片足が腫れて息苦'],
    specificity: 5,
    minMatch: 1,
  },
  sinusitis: {
    keySymptoms: ['runny_nose', 'headache'],
    textKeywords: ['副鼻腔炎', '蓄膿', '顔が痛', '頬が痛', '鼻がつまる'],
    specificity: 4,
    minMatch: 2,
  },
  tonsillitis: {
    keySymptoms: ['sore_throat', 'fever', 'difficulty_swallowing'],
    againstSymptoms: ['runny_nose', 'sneeze'],
    textKeywords: ['扁桃炎', 'のどが腫', '飲み込めない', '喉が化膿'],
    specificity: 4,
    minMatch: 2,
  },
  strep_pharyngitis: {
    keySymptoms: ['sore_throat', 'fever'],
    againstSymptoms: ['cough', 'runny_nose'],
    textKeywords: ['溶連菌', 'のどの痛みと熱', '白苔'],
    specificity: 5,
    minMatch: 2,
  },
  croup_suspect: {
    keySymptoms: ['cough', 'hoarseness'],
    textKeywords: ['クループ', '犬が吠えるような咳', '吠える咳'],
    specificity: 5,
    minMatch: 1,
  },

  // —— 循環器 ——
  angina_acs: {
    keySymptoms: ['chest_pain'],
    textKeywords: ['胸が締めつけ', '圧迫感', '冷や汗と胸痛', '狭心症', '心筋梗塞'],
    specificity: 5,
    minMatch: 1,
  },
  heart_failure: {
    keySymptoms: ['shortness_of_breath', 'swelling'],
    textKeywords: ['心不全', '横になると苦しい', '足がむくむ', '夜間呼吸困難'],
    specificity: 4,
    minMatch: 2,
  },
  afib_suspect: {
    keySymptoms: ['palpitations'],
    textKeywords: ['不整脈', '脈が乱', '心房細動', 'ドキドキが続く'],
    specificity: 4,
    minMatch: 1,
  },
  dvt_suspect: {
    keySymptoms: ['calf_pain', 'swelling'],
    textKeywords: ['深部静脈', 'DVT', '片足だけ腫', 'ふくらはぎが痛く腫'],
    specificity: 5,
    minMatch: 1,
  },
  hypertension_symptom: {
    keySymptoms: ['headache', 'dizziness'],
    textKeywords: ['血圧が高い', '高血圧'],
    specificity: 2,
    minMatch: 2,
  },

  // —— 消化器 ——
  gastroenteritis: {
    keySymptoms: ['diarrhea', 'vomiting', 'nausea'],
    textKeywords: ['胃腸炎', '食中毒', '吐いて下痢'],
    specificity: 3,
    minMatch: 2,
  },
  ibs: {
    keySymptoms: ['abdominal_pain', 'diarrhea', 'constipation'],
    againstSymptoms: ['fever', 'weight_loss'],
    textKeywords: ['過敏性腸', 'IBS', 'ストレスでお腹'],
    specificity: 3,
    minMatch: 2,
  },
  constipation: {
    keySymptoms: ['constipation'],
    textKeywords: ['便秘', '便が出ない'],
    specificity: 3,
    minMatch: 1,
  },
  gerd: {
    keySymptoms: ['chest_pain', 'abdominal_pain'],
    againstSymptoms: ['syncope'],
    textKeywords: ['胸やけ', '逆流', 'げっぷが酸っぱ', 'GERD', 'みぞおちが焼ける'],
    specificity: 4,
    minMatch: 1,
  },
  peptic_ulcer: {
    keySymptoms: ['abdominal_pain'],
    textKeywords: ['胃潰瘍', '十二指腸潰瘍', '空腹時に痛い', '黒い便'],
    specificity: 4,
    minMatch: 1,
  },
  appendicitis_suspect: {
    keySymptoms: ['abdominal_pain', 'appetite_loss'],
    textKeywords: ['虫垂炎', '盲腸', '右下腹痛', '歩くとお腹が痛'],
    specificity: 5,
    minMatch: 2,
  },
  cholecystitis_suspect: {
    keySymptoms: ['abdominal_pain', 'nausea'],
    textKeywords: ['胆石', '胆嚢炎', '右上腹部', '脂もの後に痛'],
    specificity: 5,
    minMatch: 1,
  },
  pancreatitis_suspect: {
    keySymptoms: ['abdominal_pain', 'vomiting'],
    textKeywords: ['膵炎', 'みぞおちから背中', '飲酒後の激痛'],
    specificity: 5,
    minMatch: 2,
  },
  ibd_flare: {
    keySymptoms: ['diarrhea', 'abdominal_pain'],
    textKeywords: ['潰瘍性大腸炎', 'クローン', '血便が続く', '炎症性腸'],
    specificity: 4,
    minMatch: 2,
  },
  hepatitis_suspect: {
    keySymptoms: ['jaundice', 'fatigue'],
    textKeywords: ['肝炎', '黄疸', '目が黄色い', '肝機能'],
    specificity: 5,
    minMatch: 1,
  },

  // —— 神経 ——
  migraine: {
    keySymptoms: ['headache', 'nausea'],
    textKeywords: ['片頭痛', 'ズキズキ', '光がつらい頭痛', '脈打つ頭痛'],
    specificity: 4,
    minMatch: 2,
  },
  tension_headache: {
    keySymptoms: ['headache'],
    againstSymptoms: ['vomiting', 'vision_blur', 'fever'],
    textKeywords: ['緊張型', '締めつけられる頭痛', 'バンドで巻かれる'],
    specificity: 3,
    minMatch: 1,
  },
  stroke_tia: {
    keySymptoms: ['numbness'],
    textKeywords: ['脳卒中', '脳梗塞', 'ろれつ', '顔がゆが', '片側が動かない', 'TIA'],
    specificity: 5,
    minMatch: 1,
  },
  meningitis_suspect: {
    keySymptoms: ['fever', 'headache', 'neck_pain'],
    textKeywords: ['髄膜炎', '首が硬い', '光がとてもつらい'],
    specificity: 5,
    minMatch: 2,
  },
  bppv_vertigo: {
    keySymptoms: ['dizziness'],
    againstSymptoms: ['numbness', 'confusion'],
    textKeywords: ['良性発作性', 'BPPV', '寝返りでめまい', 'くるくる回る'],
    specificity: 4,
    minMatch: 1,
  },
  bells_palsy: {
    keySymptoms: ['numbness'],
    textKeywords: ['顔面麻痺', 'ベル麻痺', '顔の片側が動かない', '目が閉じない'],
    specificity: 5,
    minMatch: 1,
  },

  // —— 泌尿・婦人 ——
  uti: {
    keySymptoms: ['urinary_pain', 'frequent_urination'],
    againstSymptoms: ['flank_pain'],
    textKeywords: ['膀胱炎', 'おしっこが痛い', '排尿痛', '頻尿'],
    specificity: 4,
    minMatch: 2,
  },
  pyelonephritis: {
    keySymptoms: ['fever', 'flank_pain'],
    textKeywords: ['腎盂腎炎', '熱と腰痛', '側腹部痛と熱'],
    specificity: 5,
    minMatch: 2,
  },
  urolithiasis: {
    keySymptoms: ['flank_pain'],
    textKeywords: ['尿管結石', '尿路結石', 'わき腹が波打つ', '疝痛'],
    specificity: 5,
    minMatch: 1,
  },
  testicular_torsion: {
    keySymptoms: ['testicular_pain'],
    textKeywords: ['精巣捻転', '陰嚢が急に痛', '睾丸が急に'],
    specificity: 5,
    minMatch: 1,
  },
  menstrual_cramps: {
    keySymptoms: ['menstrual_pain'],
    textKeywords: ['生理痛', '月経痛'],
    specificity: 4,
    minMatch: 1,
  },
  ectopic_pregnancy: {
    keySymptoms: ['abdominal_pain', 'vaginal_bleeding'],
    textKeywords: ['子宮外妊娠', '異所性妊娠', '妊娠反応と腹痛'],
    specificity: 5,
    minMatch: 1,
  },
  pid_suspect: {
    keySymptoms: ['abdominal_pain', 'vaginal_discharge'],
    textKeywords: ['骨盤内炎症', 'PID', 'おりものと下腹痛'],
    specificity: 4,
    minMatch: 2,
  },
  ovarian_torsion_suspect: {
    keySymptoms: ['abdominal_pain'],
    textKeywords: ['卵巣茎捻転', '片側の下腹が激痛'],
    specificity: 5,
    minMatch: 1,
  },
  vaginal_candidiasis: {
    keySymptoms: ['vaginal_discharge', 'itch'],
    textKeywords: ['カンジダ', 'おりものが白い', '豆腐かす', 'かゆいおりもの'],
    specificity: 5,
    minMatch: 1,
  },

  // —— 皮膚（細分化の要） ——
  dermatitis: {
    keySymptoms: ['rash', 'itch'],
    againstSymptoms: ['fever'],
    textKeywords: ['湿疹', '皮膚炎', 'アトピー'],
    specificity: 2,
    minMatch: 2,
  },
  urticaria: {
    keySymptoms: ['rash', 'itch'],
    textKeywords: ['じんましん', '蕁麻疹', '膨疹', 'みみずばれ', '消えては出る'],
    specificity: 4,
    minMatch: 2,
  },
  tinea: {
    keySymptoms: ['rash', 'itch'],
    textKeywords: ['水虫', 'たむし', '白癬', '環状の赤み'],
    specificity: 4,
    minMatch: 1,
  },
  acne: {
    keySymptoms: ['rash'],
    textKeywords: ['ニキビ', 'ざ瘡', '面皰'],
    specificity: 4,
    minMatch: 1,
  },
  impetigo: {
    keySymptoms: ['rash'],
    textKeywords: ['とびひ', '膿痂疹', '黄色い痂皮'],
    specificity: 4,
    minMatch: 1,
  },
  herpes_zoster: {
    keySymptoms: ['rash', 'muscle_pain'],
    textKeywords: ['帯状疱疹', '神経に沿った', '片側の水ぶくれ', '帯状に痛'],
    specificity: 5,
    minMatch: 1,
  },
  cellulitis: {
    keySymptoms: ['rash', 'swelling', 'fever'],
    textKeywords: ['蜂窩織炎', '赤く腫れて熱い', '皮膚が熱を持つ'],
    specificity: 4,
    minMatch: 2,
  },
  psoriasis: {
    keySymptoms: ['rash'],
    textKeywords: ['乾癬', '銀白色の鱗屑', '厚い鱗屑'],
    specificity: 4,
    minMatch: 1,
  },
  pigmented_lesion: {
    keySymptoms: ['rash'],
    textKeywords: ['ほくろ', '色が変わった', '黒色腫', 'メラノーマ', '斑が拡大'],
    specificity: 4,
    minMatch: 1,
  },
  burn_erythema: {
    keySymptoms: ['rash'],
    textKeywords: ['やけど', '熱傷', '日焼け', '日光皮膚炎'],
    specificity: 4,
    minMatch: 1,
  },
  allergic_contact: {
    keySymptoms: ['rash', 'itch'],
    textKeywords: ['接触皮膚炎', '金属アレルギー', '化粧品で赤く', '触れたところだけ'],
    specificity: 4,
    minMatch: 2,
  },
  corn_clavus: {
    keySymptoms: ['rash'],
    againstSymptoms: ['fever'],
    textKeywords: ['魚の目', 'うおのめ', 'ウオノメ', '鶏眼', '胼胝', 'たこ', 'タコ', '歩くと足の裏が痛'],
    specificity: 5,
    minMatch: 1,
  },
  plantar_wart: {
    keySymptoms: ['rash'],
    textKeywords: ['いぼ', '足裏のいぼ', '疣贅', '黒い点のあるいぼ', 'ウイルス性いぼ'],
    specificity: 5,
    minMatch: 1,
  },
  scabies: {
    keySymptoms: ['rash', 'itch'],
    textKeywords: ['疥癬', '夜かゆい', '指の間がかゆ', '家族もかゆい'],
    specificity: 5,
    minMatch: 2,
  },
  shingles_prodrome: {
    keySymptoms: ['muscle_pain'],
    textKeywords: ['帯状疱疹の前', '片側だけ痛いまだ発疹ない'],
    specificity: 4,
    minMatch: 1,
  },
  bruise: {
    keySymptoms: ['swelling'],
    textKeywords: ['あざ', '打撲', '皮下出血'],
    specificity: 3,
    minMatch: 1,
  },

  // —— 筋骨格 ——
  lumbago: {
    keySymptoms: ['back_pain'],
    againstSymptoms: ['numbness'],
    textKeywords: ['ぎっくり腰', '腰痛', '腰が痛'],
    specificity: 2,
    minMatch: 1,
  },
  sciatica: {
    keySymptoms: ['back_pain', 'numbness'],
    textKeywords: ['坐骨神経', '足に放散', 'しびれが脚に'],
    specificity: 4,
    minMatch: 2,
  },
  gout_attack: {
    keySymptoms: ['joint_pain', 'swelling'],
    textKeywords: ['痛風', '親指の付け根', '痛風発作'],
    specificity: 5,
    minMatch: 1,
  },
  fracture_suspect: {
    keySymptoms: ['muscle_pain', 'swelling'],
    textKeywords: ['骨折', '折れた', '変形', '荷重できない'],
    specificity: 4,
    minMatch: 1,
  },
  plantar_fasciitis: {
    keySymptoms: ['muscle_pain'],
    textKeywords: ['足底筋膜炎', '朝起きて最初の一歩が痛', 'かかとが痛'],
    specificity: 5,
    minMatch: 1,
  },
  ra_flare: {
    keySymptoms: ['joint_pain', 'swelling'],
    textKeywords: ['関節リウマチ', '朝のこわばり', '指の関節が腫'],
    specificity: 4,
    minMatch: 2,
  },

  // —— 感覚器 ——
  otitis_media: {
    keySymptoms: ['ear_pain', 'fever'],
    textKeywords: ['中耳炎', '耳が痛い子供', '耳だれ'],
    specificity: 4,
    minMatch: 1,
  },
  otitis_externa: {
    keySymptoms: ['ear_pain'],
    againstSymptoms: ['fever'],
    textKeywords: ['外耳炎', '耳を引っ張ると痛', '泳ぐと耳痛'],
    specificity: 5,
    minMatch: 1,
  },
  conjunctivitis: {
    keySymptoms: ['eye_pain', 'itch'],
    againstSymptoms: ['vision_blur'],
    textKeywords: ['結膜炎', 'めやに', '目が赤い', '充血'],
    specificity: 3,
    minMatch: 1,
  },
  acute_glaucoma: {
    keySymptoms: ['eye_pain', 'vision_blur', 'headache'],
    textKeywords: ['緑内障発作', '急に目が見えにくく痛', '虹彩視'],
    specificity: 5,
    minMatch: 2,
  },
  retinal_detachment_suspect: {
    keySymptoms: ['vision_blur'],
    textKeywords: ['網膜剥離', 'カーテンがかかる', '飛蚊症が急増', '光視症'],
    specificity: 5,
    minMatch: 1,
  },
  sudden_hearing_loss: {
    keySymptoms: ['hearing_loss'],
    textKeywords: ['突発性難聴', '急に聞こえなく', '片耳が急に'],
    specificity: 5,
    minMatch: 1,
  },
  dental_abscess: {
    keySymptoms: ['tooth_pain'],
    textKeywords: ['歯茎が腫', '歯の膿', '歯痛と熱'],
    specificity: 4,
    minMatch: 1,
  },

  // —— 内分泌・精神・全身 ——
  anemia_suspect: {
    keySymptoms: ['fatigue', 'dizziness'],
    textKeywords: ['貧血', '顔色が悪い', '立ちくらみ'],
    specificity: 3,
    minMatch: 2,
  },
  diabetes_uncontrolled: {
    keySymptoms: ['thirst', 'frequent_urination', 'fatigue'],
    textKeywords: ['血糖が高い', '口が渇く頻尿', '糖尿病が悪化'],
    specificity: 4,
    minMatch: 2,
  },
  hypoglycemia: {
    keySymptoms: ['tremor', 'palpitations', 'confusion'],
    textKeywords: ['低血糖', '冷や汗と震え', 'インスリン後に具合'],
    specificity: 5,
    minMatch: 1,
  },
  hyperglycemia_crisis: {
    keySymptoms: ['thirst', 'frequent_urination', 'confusion'],
    textKeywords: ['高血糖', 'ケトアシドーシス', 'ひどい口渇'],
    specificity: 5,
    minMatch: 2,
  },
  thyroid_storm_or_thyrotoxic: {
    keySymptoms: ['palpitations', 'tremor'],
    textKeywords: ['甲状腺', 'バセドウ', '手が震えて動悸'],
    specificity: 4,
    minMatch: 2,
  },
  dehydration: {
    keySymptoms: ['dizziness', 'fatigue'],
    textKeywords: ['脱水', '尿が出ない', 'ぐったり水分'],
    specificity: 3,
    minMatch: 2,
  },
  anxiety_disorder: {
    keySymptoms: ['anxiety'],
    textKeywords: ['不安障害', '心配で仕方ない'],
    specificity: 3,
    minMatch: 1,
  },
  panic_attack: {
    keySymptoms: ['anxiety', 'palpitations'],
    textKeywords: ['パニック', '死ぬかと思う動悸', '突然の不安発作'],
    specificity: 4,
    minMatch: 2,
  },
  depression_episode: {
    keySymptoms: ['depression_mood'],
    textKeywords: ['うつ', '気分が落ち込む', '何も楽しくない'],
    specificity: 4,
    minMatch: 1,
  },
  sepsis_suspect: {
    keySymptoms: ['fever', 'confusion'],
    textKeywords: ['敗血症', 'ぐったり高熱', '意識がおかしく熱'],
    specificity: 5,
    minMatch: 2,
  },
  kawasaki_suspect: {
    keySymptoms: ['fever', 'rash'],
    textKeywords: ['川崎病', '熱が5日', 'いちご舌'],
    specificity: 5,
    minMatch: 2,
  },
}

/** againstSymptoms に誤って入れた非 SymptomId を無視するための型安全フィルタは infer 側で行う */
