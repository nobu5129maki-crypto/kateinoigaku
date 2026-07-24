/** 画像から抽出する見た目の特徴量（0〜1） */
export interface VisualFeatures {
  redness: number
  yellowness: number
  darkness: number
  whiteness: number
  purpleBias: number
  greenBias: number
  contrast: number
  variance: number
  warmth: number
}

export interface VisualFinding {
  id: string
  label: string
  detail: string
}

export interface ImageAnalysisResult {
  features: VisualFeatures
  findings: VisualFinding[]
  suggestedSymptoms: Array<'rash' | 'itch' | 'swelling' | 'fever'>
  summary: string
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n))
}

function sampleImageData(img: CanvasImageSource, maxSide = 160): ImageData {
  const canvas = document.createElement('canvas')
  const w = 'width' in img ? Number(img.width) : maxSide
  const h = 'height' in img ? Number(img.height) : maxSide
  const scale = Math.min(1, maxSide / Math.max(w, h))
  canvas.width = Math.max(1, Math.round(w * scale))
  canvas.height = Math.max(1, Math.round(h * scale))
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('Canvas が使えません')
  ctx.drawImage(img as CanvasImageSource, 0, 0, canvas.width, canvas.height)
  return ctx.getImageData(0, 0, canvas.width, canvas.height)
}

/** 中央寄りの皮膚領域を重点的にサンプリングして特徴量を算出 */
export function extractVisualFeatures(imageData: ImageData): VisualFeatures {
  const { data, width, height } = imageData
  let rSum = 0
  let gSum = 0
  let bSum = 0
  let lumSum = 0
  let warmSum = 0
  let redHits = 0
  let yellowHits = 0
  let whiteHits = 0
  let darkHits = 0
  let purpleHits = 0
  let greenHits = 0
  let count = 0
  const luminances: number[] = []

  const x0 = Math.floor(width * 0.18)
  const x1 = Math.floor(width * 0.82)
  const y0 = Math.floor(height * 0.18)
  const y1 = Math.floor(height * 0.82)

  for (let y = y0; y < y1; y += 2) {
    for (let x = x0; x < x1; x += 2) {
      const i = (y * width + x) * 4
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]
      if (a < 20) continue

      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
      const sat = max === 0 ? 0 : (max - min) / max

      rSum += r
      gSum += g
      bSum += b
      lumSum += lum
      warmSum += (r - b) / 255
      luminances.push(lum)
      count++

      if (r > g + 18 && r > b + 12 && sat > 0.12) redHits++
      if (r > 140 && g > 120 && b < r - 20 && g >= b) yellowHits++
      if (lum > 0.78 && sat < 0.18) whiteHits++
      if (lum < 0.28) darkHits++
      if (r > 80 && b > g + 8 && b > 70) purpleHits++
      if (g > r + 10 && g > b + 5) greenHits++
    }
  }

  if (count === 0) {
    return {
      redness: 0,
      yellowness: 0,
      darkness: 0,
      whiteness: 0,
      purpleBias: 0,
      greenBias: 0,
      contrast: 0,
      variance: 0,
      warmth: 0,
    }
  }

  const meanLum = lumSum / count
  let varAcc = 0
  for (const lum of luminances) {
    varAcc += (lum - meanLum) ** 2
  }
  const variance = clamp01(Math.sqrt(varAcc / count) * 3.2)

  // 簡易コントラスト（近傍差の平均）
  let edgeAcc = 0
  let edgeCount = 0
  for (let y = y0 + 2; y < y1 - 2; y += 3) {
    for (let x = x0 + 2; x < x1 - 2; x += 3) {
      const i = (y * width + x) * 4
      const j = (y * width + x + 2) * 4
      const lumA = (data[i] + data[i + 1] + data[i + 2]) / 3
      const lumB = (data[j] + data[j + 1] + data[j + 2]) / 3
      edgeAcc += Math.abs(lumA - lumB) / 255
      edgeCount++
    }
  }

  return {
    redness: clamp01(redHits / count / 0.35),
    yellowness: clamp01(yellowHits / count / 0.28),
    darkness: clamp01(darkHits / count / 0.3),
    whiteness: clamp01(whiteHits / count / 0.35),
    purpleBias: clamp01(purpleHits / count / 0.22),
    greenBias: clamp01(greenHits / count / 0.2),
    contrast: clamp01(edgeCount ? (edgeAcc / edgeCount) * 4.5 : 0),
    variance,
    warmth: clamp01((warmSum / count + 0.15) / 0.55),
  }
}

export function interpretVisualFeatures(features: VisualFeatures): ImageAnalysisResult {
  const findings: VisualFinding[] = []
  const suggested = new Set<'rash' | 'itch' | 'swelling' | 'fever'>()

  if (features.redness >= 0.45) {
    findings.push({
      id: 'red',
      label: '赤み',
      detail: '炎症や充血を示す赤い色調が目立ちます',
    })
    suggested.add('rash')
  }
  if (features.yellowness >= 0.4) {
    findings.push({
      id: 'yellow',
      label: '黄み・かさぶた調',
      detail: '痂皮や滲出物に近い黄みが見られます',
    })
    suggested.add('rash')
  }
  if (features.whiteness >= 0.42) {
    findings.push({
      id: 'scale',
      label: '白い鱗屑・乾燥',
      detail: '粉をふいたような白い領域があります',
    })
    suggested.add('rash')
    suggested.add('itch')
  }
  if (features.darkness >= 0.4 && features.redness < 0.55) {
    findings.push({
      id: 'pigment',
      label: '色素の濃さ',
      detail: '周囲より暗い色素斑・あざ様の色調があります',
    })
  }
  if (features.purpleBias >= 0.38) {
    findings.push({
      id: 'purple',
      label: '紫み',
      detail: '内出血や強いうっ血を疑う紫調があります',
    })
    suggested.add('swelling')
  }
  if (features.contrast >= 0.48 && features.variance >= 0.4) {
    findings.push({
      id: 'texture',
      label: '凹凸・まだら',
      detail: '表面のムラや小水疱様のコントラストがあります',
    })
    suggested.add('rash')
  }
  if (features.greenBias >= 0.35 && features.redness >= 0.3) {
    findings.push({
      id: 'infection_tint',
      label: '混濁した色調',
      detail: '感染を伴う病変で見られる濁った色が混じります',
    })
    suggested.add('rash')
    suggested.add('fever')
  }
  if (features.warmth >= 0.55 && features.redness >= 0.35) {
    findings.push({
      id: 'warm_flush',
      label: '温かい赤み',
      detail: '血流増加を示す暖色の赤みが広がっています',
    })
    suggested.add('rash')
  }

  if (findings.length === 0) {
    findings.push({
      id: 'subtle',
      label: '目立った色調変化は軽度',
      detail: '強い赤みや色素変化は目立たないため、症状の自覚も合わせて判断します',
    })
  }

  const top = findings
    .slice(0, 3)
    .map((f) => f.label)
    .join('・')

  return {
    features,
    findings,
    suggestedSymptoms: [...suggested],
    summary: `写真から「${top}」の所見を検出しました（参考解析）`,
  }
}

export async function analyzeSkinImage(source: HTMLImageElement | ImageBitmap): Promise<ImageAnalysisResult> {
  const imageData = sampleImageData(source)
  const features = extractVisualFeatures(imageData)
  return interpretVisualFeatures(features)
}

export async function analyzeSkinBlob(blob: Blob): Promise<ImageAnalysisResult> {
  const bitmap = await createImageBitmap(blob)
  try {
    return await analyzeSkinImage(bitmap)
  } finally {
    bitmap.close()
  }
}
