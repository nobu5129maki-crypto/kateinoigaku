import type { SymptomId } from '../data/conditions'

/** 長い／具体的な表現を先に評価する（部分一致の誤爆を減らす） */
const symptomKeywords: { id: SymptomId; keywords: string[] }[] = [
  {
    id: 'shortness_of_breath',
    keywords: [
      '息切れ',
      '息苦',
      '呼吸困難',
      '呼吸が苦',
      '息が苦',
      '息が荒',
      '息がしづらい',
      '息がしにくい',
      'ぜーぜー',
      'ヒューヒュー',
    ],
  },
  {
    id: 'frequent_urination',
    keywords: ['頻尿', 'おしっこが近い', 'トイレが近い', '尿が近い', '何度もトイレ'],
  },
  {
    id: 'urinary_pain',
    keywords: ['排尿時の痛', 'おしっこが痛', '尿が痛', '排尿痛', '尿道が痛', 'トイレが痛'],
  },
  {
    id: 'vaginal_discharge',
    keywords: ['おりもの', '帯下', 'おり物'],
  },
  {
    id: 'menstrual_pain',
    keywords: ['生理痛', '月経痛', '生理が痛', '生理がつらい'],
  },
  {
    id: 'vision_blur',
    keywords: ['見えにく', 'かすみ目', '視界がぼや', '視力低下', '目がかすむ', 'ぼやける'],
  },
  {
    id: 'eye_pain',
    keywords: ['目の痛', '眼の痛', '目が痛', '眼が痛', '目がごろごろ'],
  },
  {
    id: 'ear_pain',
    keywords: ['耳の痛', '耳が痛', '耳痛', '耳が痛い'],
  },
  {
    id: 'sore_throat',
    keywords: ['のどの痛', '喉の痛', 'のどが痛', '喉が痛', '咽頭痛', 'のど痛', '喉痛', '飲み込みにくい'],
  },
  {
    id: 'runny_nose',
    keywords: ['鼻水', '鼻づまり', '鼻がつまる', '鼻詰まり', '鼻炎', '鼻がぐずぐず'],
  },
  {
    id: 'chest_pain',
    keywords: ['胸の痛', '胸が痛', '胸痛', '胸が締め', '胸が圧迫'],
  },
  {
    id: 'abdominal_pain',
    keywords: ['腹痛', 'お腹の痛', 'おなかの痛', 'お腹が痛', 'おなかが痛', 'みぞおち', '下腹部が痛'],
  },
  {
    id: 'back_pain',
    keywords: ['腰痛', '背中の痛', '腰が痛', '背中が痛', 'ぎっくり腰'],
  },
  {
    id: 'joint_pain',
    keywords: ['関節の痛', '関節が痛', '関節痛', 'ひざが痛', '膝が痛', '手首が痛', '足首が痛'],
  },
  {
    id: 'muscle_pain',
    keywords: ['筋肉痛', '筋肉が痛', '体が痛む', '体が痛い', 'からだが痛い', '節々が痛'],
  },
  {
    id: 'appetite_loss',
    keywords: ['食欲不振', '食欲がない', '食欲が落ち', '食べられない', 'ご飯が食べられない'],
  },
  {
    id: 'weight_loss',
    keywords: ['体重減少', '体重が減', 'やせた', '痩せてきた', '痩せた'],
  },
  {
    id: 'night_sweats',
    keywords: ['寝汗', '夜中に汗', '夜汗'],
  },
  {
    id: 'palpitations',
    keywords: ['動悸', 'ドキドキ', '心臓がバクバク', '脈が速い', '脈が速'],
  },
  {
    id: 'anxiety',
    keywords: ['不安', 'そわそわ', 'パニック', '落ち着かない', '緊張が強い'],
  },
  {
    id: 'insomnia',
    keywords: ['不眠', '眠れない', '寝付けない', '夜眠れ', '睡眠不足'],
  },
  {
    id: 'fever',
    keywords: ['発熱', '熱がある', '熱が出', '熱っぽい', '高熱', '微熱', '体温が', '度の熱'],
  },
  {
    id: 'chills',
    keywords: ['悪寒', '寒気', 'ぞくぞく', 'ふるえ', '震え'],
  },
  {
    id: 'fatigue',
    keywords: ['だるさ', 'だるい', '疲労', '倦怠', '疲れ', '元気がない', 'ぐったり'],
  },
  {
    id: 'headache',
    keywords: ['頭痛', '頭が痛', '頭が重い', '頭がしめつけ', 'ズキズキ'],
  },
  {
    id: 'dizziness',
    keywords: ['めまい', 'ふらつき', 'ふらふら', '立ちくらみ', 'くらっと'],
  },
  {
    id: 'cough',
    keywords: ['咳', 'せき', '咳嗽', 'たんが出', '痰が出'],
  },
  {
    id: 'sneeze',
    keywords: ['くしゃみ', 'クシャミ'],
  },
  {
    id: 'nausea',
    keywords: ['吐き気', 'むかつき', '気持ち悪', '悪心', '吐きそう'],
  },
  {
    id: 'vomiting',
    keywords: ['嘔吐', '吐いた', '吐いて', '吐いてしまう', '戻してしまった'],
  },
  {
    id: 'diarrhea',
    keywords: ['下痢', '軟便', 'お腹を下', 'おなかを下', '水様便'],
  },
  {
    id: 'constipation',
    keywords: ['便秘', '便が出ない', 'お通じが悪い'],
  },
  {
    id: 'rash',
    keywords: ['発疹', '皮疹', '湿疹', 'ぶつぶつ', '赤い斑', '赤い点', '赤みが出'],
  },
  {
    id: 'itch',
    keywords: ['かゆみ', '痒み', 'かゆい', '痒い', 'むずむず'],
  },
  {
    id: 'swelling',
    keywords: ['むくみ', '腫れ', '腫れて', '腫れた', '浮腫'],
  },
]

export function parseSymptomsFromText(text: string): SymptomId[] {
  const normalized = text.normalize('NFKC').toLowerCase()
  if (!normalized.trim()) return []

  const found = new Set<SymptomId>()
  for (const { id, keywords } of symptomKeywords) {
    if (keywords.some((kw) => normalized.includes(kw.normalize('NFKC').toLowerCase()))) {
      found.add(id)
    }
  }
  return [...found]
}
