export type Sex = 'male' | 'female' | 'other'
export type AgeGroup = 'infant' | 'child' | 'teen' | 'adult' | 'senior'
export type Urgency = 'emergency' | 'urgent' | 'soon' | 'home'

export type SymptomId =
  | 'fever'
  | 'chills'
  | 'headache'
  | 'sore_throat'
  | 'cough'
  | 'runny_nose'
  | 'sneeze'
  | 'shortness_of_breath'
  | 'chest_pain'
  | 'palpitations'
  | 'nausea'
  | 'vomiting'
  | 'diarrhea'
  | 'constipation'
  | 'abdominal_pain'
  | 'appetite_loss'
  | 'fatigue'
  | 'dizziness'
  | 'rash'
  | 'itch'
  | 'joint_pain'
  | 'muscle_pain'
  | 'back_pain'
  | 'urinary_pain'
  | 'frequent_urination'
  | 'eye_pain'
  | 'vision_blur'
  | 'ear_pain'
  | 'swelling'
  | 'weight_loss'
  | 'night_sweats'
  | 'anxiety'
  | 'insomnia'
  | 'menstrual_pain'
  | 'vaginal_discharge'

export type HistoryId =
  | 'hypertension'
  | 'diabetes'
  | 'asthma'
  | 'heart_disease'
  | 'allergy'
  | 'migraine'
  | 'ibs'
  | 'depression'
  | 'pregnancy'
  | 'smoking'
  | 'none'

export interface Symptom {
  id: SymptomId
  label: string
  category: string
}

export interface Condition {
  id: string
  name: string
  summary: string
  symptoms: SymptomId[]
  ages?: AgeGroup[]
  sexes?: Sex[]
  historyBoost?: HistoryId[]
  urgency: Urgency
  homeCare: string[]
  seeDoctorWhen: string[]
  redFlag?: boolean
}

export const symptoms: Symptom[] = [
  { id: 'fever', label: '発熱', category: '全身' },
  { id: 'chills', label: '悪寒', category: '全身' },
  { id: 'fatigue', label: 'だるさ・疲労', category: '全身' },
  { id: 'appetite_loss', label: '食欲不振', category: '全身' },
  { id: 'weight_loss', label: '体重減少', category: '全身' },
  { id: 'night_sweats', label: '寝汗', category: '全身' },
  { id: 'headache', label: '頭痛', category: '頭・神経' },
  { id: 'dizziness', label: 'めまい', category: '頭・神経' },
  { id: 'anxiety', label: '不安・動悸感', category: '頭・神経' },
  { id: 'insomnia', label: '不眠', category: '頭・神経' },
  { id: 'sore_throat', label: 'のどの痛み', category: '呼吸器' },
  { id: 'cough', label: '咳', category: '呼吸器' },
  { id: 'runny_nose', label: '鼻水・鼻づまり', category: '呼吸器' },
  { id: 'sneeze', label: 'くしゃみ', category: '呼吸器' },
  { id: 'shortness_of_breath', label: '息切れ・呼吸困難', category: '呼吸器' },
  { id: 'chest_pain', label: '胸の痛み', category: '循環器' },
  { id: 'palpitations', label: '動悸', category: '循環器' },
  { id: 'nausea', label: '吐き気', category: '消化器' },
  { id: 'vomiting', label: '嘔吐', category: '消化器' },
  { id: 'diarrhea', label: '下痢', category: '消化器' },
  { id: 'constipation', label: '便秘', category: '消化器' },
  { id: 'abdominal_pain', label: '腹痛', category: '消化器' },
  { id: 'rash', label: '発疹', category: '皮膚' },
  { id: 'itch', label: 'かゆみ', category: '皮膚' },
  { id: 'swelling', label: 'むくみ', category: '皮膚' },
  { id: 'joint_pain', label: '関節の痛み', category: '筋骨格' },
  { id: 'muscle_pain', label: '筋肉痛', category: '筋骨格' },
  { id: 'back_pain', label: '腰痛・背中の痛み', category: '筋骨格' },
  { id: 'urinary_pain', label: '排尿時の痛み', category: '泌尿器' },
  { id: 'frequent_urination', label: '頻尿', category: '泌尿器' },
  { id: 'eye_pain', label: '目の痛み', category: '感覚器' },
  { id: 'vision_blur', label: '見えにくさ', category: '感覚器' },
  { id: 'ear_pain', label: '耳の痛み', category: '感覚器' },
  { id: 'menstrual_pain', label: '生理痛が強い', category: '婦人科' },
  { id: 'vaginal_discharge', label: 'おりものの異常', category: '婦人科' },
]

export const historyOptions: { id: HistoryId; label: string }[] = [
  { id: 'none', label: '特になし' },
  { id: 'hypertension', label: '高血圧' },
  { id: 'diabetes', label: '糖尿病' },
  { id: 'asthma', label: '喘息・アレルギー性気道疾患' },
  { id: 'heart_disease', label: '心臓病' },
  { id: 'allergy', label: 'アレルギー体質' },
  { id: 'migraine', label: '片頭痛' },
  { id: 'ibs', label: '過敏性腸症候群' },
  { id: 'depression', label: 'うつ・不安の既往' },
  { id: 'pregnancy', label: '妊娠中・可能性あり' },
  { id: 'smoking', label: '喫煙習慣' },
]

export const conditions: Condition[] = [
  {
    id: 'common_cold',
    name: 'かぜ（急性上気道炎）',
    summary: 'ウイルスによる鼻・のど・気管の炎症。多くは数日〜1週間で軽快します。',
    symptoms: ['runny_nose', 'sneeze', 'sore_throat', 'cough', 'fever', 'fatigue', 'headache'],
    urgency: 'home',
    homeCare: [
      '安静と十分な水分・睡眠をとる',
      'のどが痛いときは刺激の少ない食事にする',
      '市販の総合かぜ薬は症状に合わせて短期間使用',
    ],
    seeDoctorWhen: ['高熱が3日以上続く', '呼吸が苦しい', '水分がとれない'],
  },
  {
    id: 'influenza',
    name: 'インフルエンザ',
    summary: '急な高熱・全身倦怠・筋肉痛が特徴。流行期に多く、肺炎などの合併症に注意。',
    symptoms: ['fever', 'chills', 'muscle_pain', 'headache', 'fatigue', 'cough', 'sore_throat'],
    urgency: 'soon',
    homeCare: [
      '安静にし、周囲への感染対策（マスク・手洗い）を行う',
      '解熱後も体力回復まで無理をしない',
      '水分をこまめにとる',
    ],
    seeDoctorWhen: ['発症から48時間以内は抗ウイルス薬の検討', '息苦しさや意識の変化', '持病がある方は早めに受診'],
  },
  {
    id: 'allergic_rhinitis',
    name: 'アレルギー性鼻炎',
    summary: '花粉やハウスダストなどへの過敏反応。くしゃみ・鼻水・鼻づまりが主体。',
    symptoms: ['sneeze', 'runny_nose', 'itch', 'eye_pain'],
    historyBoost: ['allergy', 'asthma'],
    urgency: 'home',
    homeCare: [
      '原因アレルゲンを避ける（換気・掃除・マスク）',
      '抗ヒスタミン薬などの対症療法',
      '目のかゆみがある場合はこすらない',
    ],
    seeDoctorWhen: ['日常生活に支障が大きい', '喘息症状を伴う', '市販薬で改善しない'],
  },
  {
    id: 'acute_bronchitis',
    name: '急性気管支炎',
    summary: 'かぜのあとなどに咳が長引く状態。痰を伴うことも多い。',
    symptoms: ['cough', 'fatigue', 'fever', 'chest_pain', 'shortness_of_breath'],
    urgency: 'soon',
    homeCare: ['加湿と水分補給', '刺激物・喫煙を避ける', '安静を心がける'],
    seeDoctorWhen: ['咳が2週間以上続く', '血痰が出る', '息切れが強い'],
  },
  {
    id: 'asthma_attack',
    name: '気管支喘息の発作・悪化',
    summary: '気道が過敏になり、ぜーぜー・息苦しさ・夜間の咳が出やすい。',
    symptoms: ['shortness_of_breath', 'cough', 'chest_pain', 'fatigue'],
    historyBoost: ['asthma', 'allergy'],
    urgency: 'urgent',
    redFlag: true,
    homeCare: ['処方されている吸入薬があれば指示通り使用', '落ち着いて座位で呼吸する'],
    seeDoctorWhen: ['話すのがつらいほどの息切れ', '吸入後も改善しない', '唇や爪が青紫色'],
  },
  {
    id: 'gastroenteritis',
    name: '感染性胃腸炎',
    summary: 'ウイルスや細菌による胃腸の炎症。下痢・嘔吐・腹痛が中心。',
    symptoms: ['diarrhea', 'vomiting', 'nausea', 'abdominal_pain', 'fever', 'appetite_loss'],
    urgency: 'soon',
    homeCare: [
      '少量ずつこまめに水分・経口補水液をとる',
      '油っぽいもの・乳製品は控える',
      'トイレ後の手洗いを徹底',
    ],
    seeDoctorWhen: ['脱水の兆候（尿が出ない・ぐったり）', '血便', '強い腹痛が続く'],
  },
  {
    id: 'ibs',
    name: '過敏性腸症候群（IBS）の増悪',
    summary: '検査で大きな異常がなくても、腹痛と便通異常がストレスなどで悪化しやすい。',
    symptoms: ['abdominal_pain', 'diarrhea', 'constipation', 'fatigue', 'anxiety'],
    historyBoost: ['ibs'],
    urgency: 'home',
    homeCare: ['食事内容とストレスの記録', '規則正しい食事と睡眠', '急がない排便習慣'],
    seeDoctorWhen: ['血便や急な体重減少', '夜間に起こされる痛み', '初めての強い症状'],
  },
  {
    id: 'constipation',
    name: '便秘症',
    summary: '便が出にくい・残便感がある状態。生活習慣や食事の影響が大きい。',
    symptoms: ['constipation', 'abdominal_pain', 'appetite_loss', 'fatigue'],
    urgency: 'home',
    homeCare: ['食物繊維と水分を増やす', '軽い運動', '便意を我慢しない'],
    seeDoctorWhen: ['急な便秘で腹痛が強い', '血便', '体重減少を伴う'],
  },
  {
    id: 'migraine',
    name: '片頭痛',
    summary: '片側性の拍動性頭痛。吐き気や光・音への過敏を伴うことが多い。',
    symptoms: ['headache', 'nausea', 'vomiting', 'vision_blur', 'fatigue'],
    historyBoost: ['migraine'],
    sexes: ['female', 'other'],
    urgency: 'home',
    homeCare: ['暗い静かな場所で休む', '冷やす', '誘因（睡眠不足・空腹）を避ける'],
    seeDoctorWhen: ['今までにない最悪の頭痛', '麻痺や意識障害', '頻度が増えている'],
  },
  {
    id: 'tension_headache',
    name: '緊張型頭痛',
    summary: '締めつけられるような頭痛。姿勢・ストレス・肩こりと関連しやすい。',
    symptoms: ['headache', 'muscle_pain', 'fatigue', 'insomnia'],
    urgency: 'home',
    homeCare: ['肩・首のストレッチ', '休息と姿勢の見直し', '長時間の同一姿勢を避ける'],
    seeDoctorWhen: ['突然の激しい頭痛', '発熱を伴う', '日常が送れないほど続く'],
  },
  {
    id: 'uti',
    name: '尿路感染症（膀胱炎など）',
    summary: '排尿時痛・頻尿・残尿感が典型。女性に多い。',
    symptoms: ['urinary_pain', 'frequent_urination', 'abdominal_pain', 'fever'],
    sexes: ['female', 'other'],
    urgency: 'soon',
    homeCare: ['水分を十分にとる', '我慢せず排尿する', '陰部を清潔に保つ'],
    seeDoctorWhen: ['発熱・腰痛を伴う（腎盂腎炎の可能性）', '血尿', '妊娠中'],
  },
  {
    id: 'angina_acs',
    name: '狭心症・急性冠症候群の疑い',
    summary: '胸の圧迫感や痛みが特徴。冷や汗・息切れを伴う場合は救急対応が必要。',
    symptoms: ['chest_pain', 'shortness_of_breath', 'palpitations', 'nausea', 'chills', 'fatigue'],
    ages: ['adult', 'senior'],
    historyBoost: ['hypertension', 'diabetes', 'heart_disease', 'smoking'],
    urgency: 'emergency',
    redFlag: true,
    homeCare: ['無理に動かず安静にする', '周囲に助けを求める'],
    seeDoctorWhen: ['今すぐ救急要請（119）を検討', '痛みが広がる・続く', '意識がもうろうとする'],
  },
  {
    id: 'gerd',
    name: '逆流性食道炎（GERD）',
    summary: '胸やけやみぞおちの不快感。食後や就寝時に悪化しやすい。',
    symptoms: ['chest_pain', 'nausea', 'abdominal_pain', 'cough', 'sore_throat'],
    urgency: 'home',
    homeCare: ['夕食を早めに・腹八分目', '就寝前2〜3時間は食べない', '上体を少し高くして寝る'],
    seeDoctorWhen: ['嚥下困難', '体重減少', '市販薬で改善しない'],
  },
  {
    id: 'anxiety_disorder',
    name: '不安・パニック傾向',
    summary: '動悸・息苦しさ・めまいなどが身体症状として現れやすい。',
    symptoms: ['anxiety', 'palpitations', 'shortness_of_breath', 'dizziness', 'insomnia', 'chest_pain'],
    historyBoost: ['depression'],
    urgency: 'soon',
    homeCare: ['ゆっくりした呼吸を意識する', '睡眠と休息を優先', 'カフェインを控える'],
    seeDoctorWhen: ['日常生活に支障', '抑うつが強い', '自傷の考えがある'],
  },
  {
    id: 'anemia_suspect',
    name: '貧血の疑い',
    summary: 'だるさ・動悸・めまい・顔色不良などがみられる。鉄欠乏などが原因になりやすい。',
    symptoms: ['fatigue', 'dizziness', 'palpitations', 'shortness_of_breath', 'appetite_loss'],
    sexes: ['female', 'other'],
    urgency: 'soon',
    homeCare: ['バランスの良い食事', '急な立ちくらみに注意'],
    seeDoctorWhen: ['血便や過多月経がある', '強い息切れ', '症状が長引く'],
  },
  {
    id: 'lumbago',
    name: '腰痛症（筋・筋膜性）',
    summary: '姿勢や負荷による腰の痛み。多くは安静と生活改善で軽快。',
    symptoms: ['back_pain', 'muscle_pain', 'fatigue'],
    urgency: 'home',
    homeCare: ['痛みの範囲で軽い動きを続ける', '同一姿勢を避ける', '温める'],
    seeDoctorWhen: ['脚のしびれ・力が入りにくい', '排尿障害', '発熱を伴う'],
  },
  {
    id: 'otitis_media',
    name: '中耳炎の疑い',
    summary: 'かぜのあとに耳の痛み・聞こえにくさが出ることがある。小児に多い。',
    symptoms: ['ear_pain', 'fever', 'headache', 'runny_nose'],
    ages: ['infant', 'child'],
    urgency: 'soon',
    homeCare: ['耳を強くいじらない', '痛みが強いときは受診を優先'],
    seeDoctorWhen: ['耳だれが出る', '高熱が続く', '乳幼児でぐったりしている'],
  },
  {
    id: 'conjunctivitis',
    name: '結膜炎の疑い',
    summary: '目の充血・かゆみ・めやに。感染性の場合は周囲への配慮が必要。',
    symptoms: ['eye_pain', 'itch', 'vision_blur'],
    urgency: 'soon',
    homeCare: ['目をこすらない', 'タオルの共用を避ける', '手洗いを徹底'],
    seeDoctorWhen: ['強い痛み・光過敏', '見え方が急に悪い', 'コンタクトレンズ使用中'],
  },
  {
    id: 'dermatitis',
    name: '皮膚炎・湿疹',
    summary: 'かゆみを伴う発疹。接触刺激やアレルギー、乾燥が関与しやすい。',
    symptoms: ['rash', 'itch', 'swelling'],
    historyBoost: ['allergy'],
    urgency: 'home',
    homeCare: ['刺激の少ない保湿', '掻き壊さない', '原因候補を避ける'],
    seeDoctorWhen: ['急速に広がる', '呼吸困難を伴う', '化膿・発熱'],
  },
  {
    id: 'urticaria',
    name: 'じんましん（蕁麻疹）',
    summary: '境界のはっきりした赤い膨疹が出現し、移動・消失を繰り返すことがある。',
    symptoms: ['rash', 'itch', 'swelling'],
    historyBoost: ['allergy'],
    urgency: 'soon',
    homeCare: ['掻かない', '刺激の強い入浴を避ける', '抗ヒスタミン薬は用法を確認'],
    seeDoctorWhen: ['唇・まぶたの腫れ', '呼吸困難・声のかすれ', '広範囲で急激に悪化'],
    redFlag: true,
  },
  {
    id: 'tinea',
    name: '白癬（水虫・たむしなど）',
    summary: '真菌感染。環状に広がる赤みやかゆみ、鱗屑が特徴になりやすい。',
    symptoms: ['rash', 'itch'],
    urgency: 'soon',
    homeCare: ['患部を清潔・乾燥に保つ', 'タオルの共用を避ける', '市販抗真菌薬は適応を確認'],
    seeDoctorWhen: ['顔や広範囲に広がる', '化膿する', '糖尿病などの基礎疾患がある'],
  },
  {
    id: 'acne',
    name: 'ざ瘡（ニキビ）',
    summary: '毛包の炎症。赤い丘疹や膿疱が顔・胸・背中などに現れやすい。',
    symptoms: ['rash', 'itch'],
    ages: ['teen', 'adult'],
    urgency: 'home',
    homeCare: ['刺激の強い洗顔を避ける', '触りすぎない', '保湿と紫外線対策'],
    seeDoctorWhen: ['痛みの強い嚢胞が多い', '痕が残りそう', '急に悪化'],
  },
  {
    id: 'impetigo',
    name: 'とびひ（膿痂疹）',
    summary: '細菌感染。黄色い痂皮やびらんができ、接触で広がりやすい。',
    symptoms: ['rash', 'itch', 'fever'],
    ages: ['infant', 'child', 'teen'],
    urgency: 'soon',
    homeCare: ['患部を触った手を洗う', 'タオル共用を避ける', '掻き壊さない'],
    seeDoctorWhen: ['急速に広がる', '発熱を伴う', '乳幼児でぐったり'],
  },
  {
    id: 'herpes_zoster',
    name: '帯状疱疹の疑い',
    summary: '神経に沿った片側性の痛みと小水疱。早期受診が望ましい。',
    symptoms: ['rash', 'muscle_pain', 'fever', 'fatigue'],
    ages: ['adult', 'senior'],
    urgency: 'urgent',
    homeCare: ['患部を清潔に保つ', 'こすらない', '周囲への接触に注意'],
    seeDoctorWhen: ['発症早期（抗ウイルス薬の検討）', '目の周囲', '強い痛みや発熱'],
    redFlag: true,
  },
  {
    id: 'bruise',
    name: '打撲・皮下出血（あざ）',
    summary: '外力による内出血。紫〜青〜緑黄色へ変化することがある。',
    symptoms: ['swelling', 'muscle_pain'],
    urgency: 'home',
    homeCare: ['初期は冷却', '患部を挙上', '強い圧迫を避ける'],
    seeDoctorWhen: ['外傷なく多数のあざ', '頭痛や意識障害を伴う頭部打撲', '腫れが急増'],
  },
  {
    id: 'cellulitis',
    name: '蜂窩織炎の疑い',
    summary: '皮膚の深い細菌感染。熱感のある広範な赤み・腫れ・痛みが特徴。',
    symptoms: ['rash', 'swelling', 'fever', 'fatigue'],
    urgency: 'urgent',
    homeCare: ['患部を安静に', '自己判断で潰さない'],
    seeDoctorWhen: ['発熱を伴う赤い腫れ', '急速に拡大', '糖尿病・免疫低下がある'],
    redFlag: true,
  },
  {
    id: 'psoriasis',
    name: '乾癬の疑い',
    summary: '境界明瞭な赤い皮疹に白い厚い鱗屑が乗ることが多い。',
    symptoms: ['rash', 'itch', 'joint_pain'],
    urgency: 'soon',
    homeCare: ['保湿を十分に', '掻き壊さない', 'ストレス・乾燥に注意'],
    seeDoctorWhen: ['関節痛を伴う', '広範囲', '市販薬で改善しない'],
  },
  {
    id: 'pigmented_lesion',
    name: '色素性病変（ほくろ等）の要観察',
    summary: '濃い色素斑。形・色の不整、拡大、出血などは皮膚科受診を。',
    symptoms: ['rash'],
    urgency: 'soon',
    homeCare: ['刺激や自己処置を避ける', '変化を写真で記録'],
    seeDoctorWhen: ['左右非対称・境界不明瞭', '色むらや急速な拡大', 'かゆみ・出血'],
    redFlag: true,
  },
  {
    id: 'burn_erythema',
    name: '熱傷・日光皮膚炎など',
    summary: '熱や紫外線による赤い炎症。水疱があれば深度評価が必要。',
    symptoms: ['rash', 'swelling', 'fever'],
    urgency: 'soon',
    homeCare: ['冷やす（氷を直接当てない）', '清潔を保つ', '水疱を無理に破らない'],
    seeDoctorWhen: ['広範囲', '顔・手足・関節', '水疱や強い痛み'],
  },
  {
    id: 'allergic_contact',
    name: '接触皮膚炎',
    summary: '金属・化粧品・植物などに触れた部位に一致して赤みやかゆみが出る。',
    symptoms: ['rash', 'itch', 'swelling'],
    historyBoost: ['allergy'],
    urgency: 'home',
    homeCare: ['原因候補との接触を避ける', '洗浄と保湿', '掻かない'],
    seeDoctorWhen: ['顔や広範囲', '水疱・びらん', '繰り返す'],
  },
  {
    id: 'menstrual_cramps',
    name: '月経困難症',
    summary: '生理に伴う下腹部痛。日常生活への影響が大きい場合は相談を。',
    symptoms: ['menstrual_pain', 'abdominal_pain', 'nausea', 'headache', 'fatigue'],
    sexes: ['female'],
    ages: ['teen', 'adult'],
    urgency: 'home',
    homeCare: ['温める', '休息', '痛み止めは用法を守って使用'],
    seeDoctorWhen: ['痛みが年々悪化', '過多月経', '妊娠の可能性'],
  },
  {
    id: 'covid_like',
    name: 'コロナウイルス感染症などを含む急性ウイルス感染症',
    summary: '発熱・咳・倦怠感など。流行状況や濃厚接触の有無も参考に。',
    symptoms: ['fever', 'cough', 'fatigue', 'sore_throat', 'headache', 'muscle_pain', 'shortness_of_breath'],
    urgency: 'soon',
    homeCare: ['隔離・マスク・換気', '体調記録', '市販検査キットの活用も検討'],
    seeDoctorWhen: ['息苦しさ', '高齢者・基礎疾患がある', '水分がとれない'],
  },
  {
    id: 'appendicitis_suspect',
    name: '急性虫垂炎の疑い',
    summary: '右下腹部を中心とした腹痛。吐き気や発熱を伴うことも。',
    symptoms: ['abdominal_pain', 'nausea', 'vomiting', 'fever', 'appetite_loss'],
    urgency: 'emergency',
    redFlag: true,
    homeCare: ['痛み止めで様子を見すぎない', '飲食は控えめに受診まで'],
    seeDoctorWhen: ['持続・増強する腹痛', '右下腹部の圧痛', '歩行で痛みが増す'],
  },
  {
    id: 'dehydration',
    name: '脱水',
    summary: '下痢・嘔吐・発熱・飲水不足などで体液が不足した状態。',
    symptoms: ['dizziness', 'fatigue', 'nausea', 'appetite_loss', 'palpitations'],
    urgency: 'urgent',
    homeCare: ['経口補水液を少量ずつ', '涼しい環境で休む'],
    seeDoctorWhen: ['尿がほとんど出ない', '意識がもうろう', '乳幼児・高齢者'],
  },
  {
    id: 'hypertension_symptom',
    name: '高血圧に関連する不調',
    summary: '頭痛・めまい・動悸などが高血圧と関連することがある。測定値も重要。',
    symptoms: ['headache', 'dizziness', 'palpitations', 'vision_blur', 'chest_pain'],
    historyBoost: ['hypertension'],
    ages: ['adult', 'senior'],
    urgency: 'soon',
    homeCare: ['安静にして血圧を測る', '塩分を控える', '処方薬があれば継続'],
    seeDoctorWhen: ['収縮期180以上など極端な高値', '胸痛・麻痺', '突然の激しい頭痛'],
  },
  {
    id: 'diabetes_uncontrolled',
    name: '血糖コントロール不良の疑い',
    summary: '口渇・頻尿・倦怠・体重減少などがみられることがある。',
    symptoms: ['frequent_urination', 'fatigue', 'weight_loss', 'vision_blur', 'appetite_loss'],
    historyBoost: ['diabetes'],
    urgency: 'soon',
    homeCare: ['水分補給', '処方薬・食事療法を確認'],
    seeDoctorWhen: ['意識がはっきりしない', '吐き気が強い', '急な体重変化'],
  },
]
