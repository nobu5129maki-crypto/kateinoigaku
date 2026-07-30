import { useEffect, useRef, useState, type DragEvent } from 'react'
import {
  analyzeSkinBlob,
  type ImageAnalysisResult,
} from '../lib/imageAnalysis'

interface CameraCaptureProps {
  analysis: ImageAnalysisResult | null
  previewUrl: string | null
  onCaptured: (previewUrl: string, analysis: ImageAnalysisResult) => void
  onClear: () => void
}

function isLikelyMobile() {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
}

export function CameraCapture({ analysis, previewUrl, onCaptured, onClear }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraFileRef = useRef<HTMLInputElement>(null)
  const [streaming, setStreaming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const streamRef = useRef<MediaStream | null>(null)
  const mobile = isLikelyMobile()

  useEffect(() => {
    return () => {
      stopStream()
    }
  }, [])

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setStreaming(false)
  }

  async function startCamera() {
    setError(null)
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError(
          'この端末ではライブカメラを開けません。下の「画像ファイルを選ぶ」から写真を追加してください。',
        )
        return
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mobile ? 'environment' : 'user' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setStreaming(true)
    } catch {
      setError(
        'カメラを開けませんでした。パソコンの場合は「画像ファイルを選ぶ」か、ブラウザのカメラ許可をご確認ください。',
      )
    }
  }

  async function processBlob(blob: Blob) {
    setBusy(true)
    setError(null)
    try {
      const result = await analyzeSkinBlob(blob)
      const url = URL.createObjectURL(blob)
      onCaptured(url, result)
      stopStream()
    } catch {
      setError('画像の解析に失敗しました。明るい場所で、病変が中央に来るよう撮り直してください。')
    } finally {
      setBusy(false)
    }
  }

  async function captureFrame() {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 720
    canvas.height = video.videoHeight || 960
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92))
    if (blob) await processBlob(blob)
  }

  async function onFileChange(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('画像ファイル（JPEG / PNG / WebP など）を選んでください。')
      return
    }
    await processBlob(file)
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    void onFileChange(file)
  }

  return (
    <div className="camera-panel">
      <div className="camera-tips">
        <p>
          病変が画面中央に来るよう、影を避けて撮影してください。解析は端末内で行い、写真はサーバーへ送りません。
          パソコンからはウェブカメラ、または画像ファイルの選択・ドラッグ＆ドロップが使えます。
        </p>
      </div>

      {previewUrl ? (
        <div className="camera-preview-wrap">
          <img src={previewUrl} alt="撮影した皮膚の写真" className="camera-preview" />
          {analysis && (
            <div className="visual-findings">
              <p className="visual-summary">{analysis.summary}</p>
              <div className="finding-chips">
                {analysis.findings.map((f) => (
                  <span key={f.id} className="finding-chip" title={f.detail}>
                    {f.label}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="camera-actions">
            <button type="button" className="btn btn-secondary" onClick={onClear} disabled={busy}>
              撮り直す
            </button>
          </div>
        </div>
      ) : (
        <>
          <div
            className={`camera-viewfinder ${streaming ? 'is-live' : ''} ${dragging ? 'is-drag' : ''}`}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <video ref={videoRef} playsInline muted className={streaming ? 'is-on' : ''} />
            {!streaming && (
              <div className="camera-placeholder">
                <span>{dragging ? 'ここにドロップ' : 'カメラ / ファイル'}</span>
                <p>
                  {mobile
                    ? '患部を枠の中に入れて撮影'
                    : 'ウェブカメラを起動するか、画像をドロップ'}
                </p>
              </div>
            )}
            <div className="viewfinder-frame" aria-hidden="true" />
          </div>

          <div className="camera-actions">
            {!streaming ? (
              <button type="button" className="btn btn-primary" onClick={startCamera} disabled={busy}>
                {mobile ? 'カメラを起動' : 'ウェブカメラを起動'}
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={captureFrame} disabled={busy}>
                {busy ? '解析中…' : 'シャッター'}
              </button>
            )}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
            >
              画像ファイルを選ぶ
            </button>
            {mobile && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => cameraFileRef.current?.click()}
                disabled={busy}
              >
                写真ライブラリ
              </button>
            )}
            {/* PC向け: capture 属性なしでファイルダイアログを開く */}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                void onFileChange(e.target.files?.[0])
                e.target.value = ''
              }}
            />
            {/* モバイル向けカメラ／ライブラリ */}
            <input
              ref={cameraFileRef}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={(e) => {
                void onFileChange(e.target.files?.[0])
                e.target.value = ''
              }}
            />
          </div>
        </>
      )}

      {error && <p className="camera-error">{error}</p>}
    </div>
  )
}
