import type { FeverBand, OnsetType, SkinSensation } from '../data/clinical'
import type {
  ConfirmEffect,
  ConfirmOption,
} from '../data/confirmQuestions'
import type { ContextFlagId, CourseTrend, PainQuality } from '../data/clinicalQuestions'
import type { SymptomId } from '../data/conditions'

/** 確認問診の回答を既存の臨床状態へマージするためのパッチ */
export interface ConfirmPatch {
  contextFlags: ContextFlagId[]
  painQuality?: PainQuality
  onset?: OnsetType
  feverBand?: FeverBand
  courseTrend?: CourseTrend
  skinSensation?: SkinSensation
  skinSpreading?: boolean
  skinBlisters?: boolean
  addSymptoms: SymptomId[]
}

export function emptyConfirmPatch(): ConfirmPatch {
  return { contextFlags: [], addSymptoms: [] }
}

export function effectsToPatch(effects: ConfirmEffect[]): ConfirmPatch {
  const patch = emptyConfirmPatch()
  for (const e of effects) {
    switch (e.type) {
      case 'context':
        if (!patch.contextFlags.includes(e.flag)) patch.contextFlags.push(e.flag)
        break
      case 'pain':
        patch.painQuality = e.quality
        break
      case 'onset':
        patch.onset = e.value
        break
      case 'fever':
        patch.feverBand = e.value
        break
      case 'course':
        patch.courseTrend = e.value
        break
      case 'skinSensation':
        patch.skinSensation = e.value
        break
      case 'skinSpreading':
        patch.skinSpreading = e.value
        break
      case 'skinBlisters':
        patch.skinBlisters = e.value
        break
      case 'addSymptom':
        if (!patch.addSymptoms.includes(e.id)) patch.addSymptoms.push(e.id)
        break
    }
  }
  return patch
}

export function mergeConfirmPatches(patches: ConfirmPatch[]): ConfirmPatch {
  const merged = emptyConfirmPatch()
  for (const p of patches) {
    for (const f of p.contextFlags) {
      if (!merged.contextFlags.includes(f)) merged.contextFlags.push(f)
    }
    for (const s of p.addSymptoms) {
      if (!merged.addSymptoms.includes(s)) merged.addSymptoms.push(s)
    }
    if (p.painQuality) merged.painQuality = p.painQuality
    if (p.onset) merged.onset = p.onset
    if (p.feverBand) merged.feverBand = p.feverBand
    if (p.courseTrend) merged.courseTrend = p.courseTrend
    if (p.skinSensation) merged.skinSensation = p.skinSensation
    if (p.skinSpreading !== undefined) merged.skinSpreading = p.skinSpreading
    if (p.skinBlisters !== undefined) merged.skinBlisters = p.skinBlisters
  }
  return merged
}

export function optionPatch(option: ConfirmOption | undefined): ConfirmPatch {
  if (!option) return emptyConfirmPatch()
  return effectsToPatch(option.effects)
}

/** 確認問診の回答テキスト（受診メモ用） */
export function formatConfirmAnswers(
  items: { prompt: string; answerLabel: string }[],
): string[] {
  return items
    .filter((i) => i.answerLabel && i.answerLabel !== 'わからない')
    .map((i) => `${i.prompt} → ${i.answerLabel}`)
}
