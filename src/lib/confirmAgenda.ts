import type { HistoryId, Sex, SymptomId } from '../data/conditions'
import { pickConfirmQuestions } from '../data/confirmQuestions'
import { symptoms as symptomCatalog, historyOptions } from '../data/conditions'

export interface ConfirmAgendaItem {
  title: string
  detail: string
}

interface AgendaInput {
  age: number
  sex: Sex
  sexLabel: string
  symptoms: SymptomId[]
  history: HistoryId[]
  symptomText?: string
  photoSummary?: string
  redFlagLabels?: string[]
}

/** これまでの問診内容から、スーパードクターが確認したい論点を文章化する */
export function buildConfirmAgenda(input: AgendaInput): {
  items: ConfirmAgendaItem[]
  summaryText: string
  questions: ReturnType<typeof pickConfirmQuestions>
} {
  const items: ConfirmAgendaItem[] = []
  const symptomLabels = input.symptoms
    .map((id) => symptomCatalog.find((s) => s.id === id)?.label ?? id)
    .filter(Boolean)
  const historyLabels = input.history
    .filter((h) => h !== 'none')
    .map((id) => historyOptions.find((h) => h.id === id)?.label ?? id)

  items.push({
    title: 'これまでの問診の整理',
    detail: [
      `${input.age}歳・${input.sexLabel}`,
      input.symptomText?.trim()
        ? `訴え「${input.symptomText.trim()}」`
        : symptomLabels.length
          ? `症状: ${symptomLabels.join('、')}`
          : '症状の記載はまだ少ない',
      historyLabels.length ? `病歴・体質: ${historyLabels.join('、')}` : '特記すべき病歴の申告なし',
      input.photoSummary ? `写真所見（参考）: ${input.photoSummary}` : null,
      input.redFlagLabels?.length
        ? `危険兆候の申告: ${input.redFlagLabels.join('、')}`
        : '危険兆候の申告なし',
    ]
      .filter(Boolean)
      .join(' / '),
  })

  const questions = pickConfirmQuestions({
    symptoms: input.symptoms,
    sex: input.sex,
    age: input.age,
    max: 8,
  })

  if (questions.length === 0) {
    items.push({
      title: '追加で確認したいこと',
      detail:
        'いまの情報だけでは特異的な確認項目は少なめです。発症の仕方・熱・経過の勢い・つらさを次の画面で整えます。',
    })
  } else {
    items.push({
      title: 'この画面で確認したいこと',
      detail: questions.map((q, i) => `${i + 1}. ${q.prompt}（${q.why}）`).join('\n'),
    })
  }

  // 症状横断の確認テーマ
  const sx = new Set(input.symptoms)
  const themes: string[] = []
  if (sx.has('chest_pain') || sx.has('shortness_of_breath') || sx.has('palpitations')) {
    themes.push('胸痛・息切れでは虚血・塞栓・心不全の危険サインを確認する')
  }
  if (sx.has('headache') || sx.has('numbness') || sx.has('confusion')) {
    themes.push('頭痛・神経症状では二次性頭痛・脳卒中を除外する視点で確認する')
  }
  if (sx.has('abdominal_pain') || sx.has('vomiting') || sx.has('diarrhea')) {
    themes.push('腹痛では出血・閉塞・炎症・胆膵の手がかりを確認する')
  }
  if (sx.has('rash') || sx.has('itch') || sx.has('swelling')) {
    themes.push('皮膚症状では痛み/かゆみ・拡大・水疱・薬剤や刺咬の誘因を確認する')
  }
  if (sx.has('urinary_pain') || sx.has('frequent_urination') || sx.has('flank_pain')) {
    themes.push('尿路症状では血尿・発熱・尿閉の有無を確認する')
  }
  if (historyLabels.some((h) => /妊娠|心|糖尿|免疫抑制|血栓|COPD/.test(h))) {
    themes.push('持病・妊娠の申告があるため、同じ症状でも緊急度の読み替えを確認する')
  }
  if (themes.length) {
    items.push({
      title: '確認の方針',
      detail: themes.map((t) => `・${t}`).join('\n'),
    })
  }

  const summaryText = items
    .map((item) => `【${item.title}】\n${item.detail}`)
    .join('\n\n')

  return { items, summaryText, questions }
}
