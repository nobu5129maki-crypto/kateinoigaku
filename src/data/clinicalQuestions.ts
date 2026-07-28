/** スーパードクターが共通で聞く経過・性状・誘因の問診項目 */

export type CourseTrend = 'improving' | 'stable' | 'worsening' | 'fluctuating' | 'unknown'

export type PainQuality =
  | 'pressure'
  | 'sharp'
  | 'burning'
  | 'tight'
  | 'dull'
  | 'throbbing'
  | 'unknown'
  | 'none'

export type ContextFlagId =
  | 'sick_contact'
  | 'travel'
  | 'injury'
  | 'new_medication'
  | 'insect_bite'
  | 'after_meal'
  | 'on_exertion'
  | 'at_rest'
  | 'at_night'
  | 'stress'
  | 'alcohol'
  | 'cold_sweat'
  | 'radiation_arm_jaw'
  | 'worst_headache'
  | 'blood_stool'
  | 'blood_urine'
  | 'blood_sputum'
  | 'one_sided_leg_swelling'
  | 'cannot_lie_flat'
  | 'photophobia'
  | 'neck_stiffness'
  | 'urine_retention'
  | 'leg_weakness'
  | 'speech_change'
  | 'pregnancy_possible'
  | 'fasting_or_skipped_meal'

export const courseTrendOptions: { id: CourseTrend; label: string }[] = [
  { id: 'improving', label: '良くなってきている' },
  { id: 'stable', label: 'あまり変わらない' },
  { id: 'worsening', label: '悪くなってきている' },
  { id: 'fluctuating', label: '波がある' },
  { id: 'unknown', label: 'わからない' },
]

export const painQualityOptions: { id: PainQuality; label: string }[] = [
  { id: 'pressure', label: '圧迫される・重い' },
  { id: 'sharp', label: '刺す・切れるような' },
  { id: 'burning', label: '焼ける・熱い' },
  { id: 'tight', label: '締めつけられる' },
  { id: 'dull', label: '鈍い・重い痛み' },
  { id: 'throbbing', label: 'ズキズキ脈打つ' },
  { id: 'none', label: '痛みは主でない' },
  { id: 'unknown', label: 'うまく言えない' },
]

export const contextFlagOptions: { id: ContextFlagId; label: string; group: string }[] = [
  { id: 'sick_contact', label: '周囲に同じ症状の人がいる', group: 'きっかけ' },
  { id: 'travel', label: '最近の旅行・長時間移動', group: 'きっかけ' },
  { id: 'injury', label: 'けが・打撲・転倒あり', group: 'きっかけ' },
  { id: 'new_medication', label: '新しい薬・サプリを始めた', group: 'きっかけ' },
  { id: 'insect_bite', label: '虫刺され・動物接触あり', group: 'きっかけ' },
  { id: 'after_meal', label: '食後に悪化しやすい', group: '誘因' },
  { id: 'on_exertion', label: '体を動かすと悪化', group: '誘因' },
  { id: 'at_rest', label: '安静時にも出る', group: '誘因' },
  { id: 'at_night', label: '夜〜明け方に悪化', group: '誘因' },
  { id: 'stress', label: '強いストレス・睡眠不足', group: '誘因' },
  { id: 'alcohol', label: '飲酒との関係がありそう', group: '誘因' },
  { id: 'fasting_or_skipped_meal', label: '食事を抜けた・低血糖っぽい', group: '誘因' },
  { id: 'cold_sweat', label: '冷や汗が出る', group: '要注意' },
  { id: 'radiation_arm_jaw', label: '痛みが腕・あご・背中へ広がる', group: '要注意' },
  { id: 'worst_headache', label: '人生最悪レベルの頭痛', group: '要注意' },
  { id: 'blood_stool', label: '血便・黒い便', group: '要注意' },
  { id: 'blood_urine', label: '血尿', group: '要注意' },
  { id: 'blood_sputum', label: '血痰', group: '要注意' },
  { id: 'one_sided_leg_swelling', label: '片足だけむくむ・痛い', group: '要注意' },
  { id: 'cannot_lie_flat', label: '横になると息が苦しい', group: '要注意' },
  { id: 'photophobia', label: '光がとてもつらい', group: '要注意' },
  { id: 'neck_stiffness', label: '首が硬い・動かせない', group: '要注意' },
  { id: 'urine_retention', label: '尿が出にくい・出ない', group: '要注意' },
  { id: 'leg_weakness', label: '足に力が入りにくい', group: '要注意' },
  { id: 'speech_change', label: '話し方がおかしい・ろれつ不良', group: '要注意' },
  { id: 'pregnancy_possible', label: '妊娠の可能性あり', group: '要注意' },
]

export const contextGroups = ['きっかけ', '誘因', '要注意'] as const
