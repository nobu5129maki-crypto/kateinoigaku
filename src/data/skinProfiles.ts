import type { VisualFeatures } from '../lib/imageAnalysis'

export type VisualCue =
  | 'redness'
  | 'yellowness'
  | 'darkness'
  | 'whiteness'
  | 'purpleBias'
  | 'greenBias'
  | 'contrast'
  | 'variance'
  | 'warmth'

export interface SkinVisualProfile {
  conditionId: string
  /** 各特徴量の望ましい範囲（0〜1） */
  cues: Partial<Record<VisualCue, { min?: number; max?: number; weight: number }>>
  labelHint: string
}

export const skinVisualProfiles: SkinVisualProfile[] = [
  {
    conditionId: 'dermatitis',
    labelHint: '赤い炎症と乾燥・かゆみパターン',
    cues: {
      redness: { min: 0.4, weight: 1.2 },
      warmth: { min: 0.35, weight: 0.7 },
      whiteness: { min: 0.25, weight: 0.6 },
      variance: { min: 0.25, weight: 0.5 },
    },
  },
  {
    conditionId: 'urticaria',
    labelHint: '境界のある赤い膨疹様の色調',
    cues: {
      redness: { min: 0.45, weight: 1.3 },
      warmth: { min: 0.4, weight: 0.8 },
      contrast: { min: 0.3, weight: 0.7 },
      darkness: { max: 0.45, weight: 0.4 },
    },
  },
  {
    conditionId: 'tinea',
    labelHint: '環状の赤みと中心の色差',
    cues: {
      redness: { min: 0.35, weight: 1 },
      contrast: { min: 0.4, weight: 1.1 },
      variance: { min: 0.35, weight: 0.9 },
      whiteness: { min: 0.2, weight: 0.5 },
    },
  },
  {
    conditionId: 'acne',
    labelHint: '赤い丘疹・まだらの点状病変',
    cues: {
      redness: { min: 0.35, weight: 1 },
      contrast: { min: 0.35, weight: 0.9 },
      variance: { min: 0.35, weight: 0.8 },
      yellowness: { min: 0.15, weight: 0.4 },
    },
  },
  {
    conditionId: 'impetigo',
    labelHint: '黄いかさぶたと赤み',
    cues: {
      yellowness: { min: 0.4, weight: 1.4 },
      redness: { min: 0.3, weight: 0.8 },
      whiteness: { min: 0.15, weight: 0.3 },
    },
  },
  {
    conditionId: 'herpes_zoster',
    labelHint: '帯状の小水疱様コントラスト',
    cues: {
      redness: { min: 0.35, weight: 1 },
      contrast: { min: 0.45, weight: 1.2 },
      variance: { min: 0.4, weight: 1 },
      whiteness: { min: 0.2, weight: 0.5 },
    },
  },
  {
    conditionId: 'bruise',
    labelHint: '紫〜青みの内出血色調',
    cues: {
      purpleBias: { min: 0.35, weight: 1.5 },
      darkness: { min: 0.25, weight: 0.7 },
      redness: { max: 0.7, weight: 0.3 },
    },
  },
  {
    conditionId: 'cellulitis',
    labelHint: '広範な温かい赤みとむくみ調',
    cues: {
      redness: { min: 0.5, weight: 1.4 },
      warmth: { min: 0.5, weight: 1.1 },
      greenBias: { min: 0.15, weight: 0.4 },
      variance: { max: 0.55, weight: 0.3 },
    },
  },
  {
    conditionId: 'psoriasis',
    labelHint: '厚い白い鱗屑と境界明瞭な赤み',
    cues: {
      whiteness: { min: 0.4, weight: 1.3 },
      redness: { min: 0.35, weight: 0.9 },
      contrast: { min: 0.35, weight: 0.7 },
    },
  },
  {
    conditionId: 'pigmented_lesion',
    labelHint: '濃い色素斑（形の不整に注意）',
    cues: {
      darkness: { min: 0.45, weight: 1.5 },
      variance: { min: 0.3, weight: 0.8 },
      contrast: { min: 0.3, weight: 0.7 },
      redness: { max: 0.55, weight: 0.4 },
    },
  },
  {
    conditionId: 'burn_erythema',
    labelHint: '均一な熱傷様の赤い色調',
    cues: {
      redness: { min: 0.5, weight: 1.3 },
      warmth: { min: 0.45, weight: 1 },
      variance: { max: 0.5, weight: 0.4 },
    },
  },
  {
    conditionId: 'allergic_contact',
    labelHint: '接触部に一致しやすい赤い炎症',
    cues: {
      redness: { min: 0.4, weight: 1.2 },
      warmth: { min: 0.35, weight: 0.7 },
      contrast: { min: 0.25, weight: 0.5 },
    },
  },
]

export function scoreVisualMatch(features: VisualFeatures, profile: SkinVisualProfile): number {
  let score = 0
  let weightSum = 0

  for (const [key, rule] of Object.entries(profile.cues) as Array<
    [VisualCue, { min?: number; max?: number; weight: number }]
  >) {
    const value = features[key]
    weightSum += rule.weight
    let local = 0.35
    if (rule.min !== undefined) {
      local = value >= rule.min ? 1 : clamp(value / Math.max(rule.min, 0.01), 0, 1) * 0.7
    }
    if (rule.max !== undefined) {
      const under = value <= rule.max ? 1 : clamp(1 - (value - rule.max) / 0.4, 0, 1)
      local = Math.min(local || 1, under)
    }
    score += local * rule.weight
  }

  if (weightSum === 0) return 0
  return (score / weightSum) * 100
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}
