// Copyright 2025 Ilya Sherman (ishermandom@)
// SPDX-License-Identifier: MIT
/// <reference lib="webworker" />

// Standalone Web Worker for per-image blur scoring via Laplacian variance.
// Higher score = sharper image. Lower score = blurrier image.
//
// Message protocol (main → worker):
//   { type: "score"; items: Array<{ mediaKey: string; blob: Blob }> }
//
// Message protocol (worker → main):
//   { type: "progress"; processed: number; total: number }
//   { type: "results"; scores: Record<string, number> }

self.addEventListener("message", async (event: MessageEvent) => {
  const { type, items } = event.data as {
    type: "score"
    items: Array<{ mediaKey: string; blob: Blob }>
  }

  if (type !== "score") return

  const scores: Record<string, number> = {}

  for (let i = 0; i < items.length; i++) {
    const { mediaKey, blob } = items[i]
    try {
      const bitmap = await createImageBitmap(blob)
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
      const ctx = canvas.getContext("2d")!
      ctx.drawImage(bitmap, 0, 0)
      const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height)
      bitmap.close()

      scores[mediaKey] = laplacianVariance(imageData)
    } catch {
      // Skip unprocessable images — they won't appear in flagged results
    }

    self.postMessage({
      type: "progress",
      processed: i + 1,
      total: items.length
    })
  }

  self.postMessage({ type: "results", scores })
})

/**
 * Estimates image sharpness as the variance of the discrete Laplacian.
 *
 * Applies the 4-connected Laplacian kernel to the grayscale image, then
 * computes the variance of the result. Sharp images have many high-contrast
 * edges, producing high variance; blurry images have smooth gradients,
 * producing low variance.
 *
 * Kernel:
 *   [ 0,  1,  0]
 *   [ 1, -4,  1]
 *   [ 0,  1,  0]
 */
function laplacianVariance(imageData: ImageData): number {
  const { data, width, height } = imageData

  const gray = new Float32Array(width * height)
  for (let i = 0; i < width * height; i++) {
    const offset = i * 4
    gray[i] =
      0.299 * data[offset] + 0.587 * data[offset + 1] + 0.114 * data[offset + 2]
  }

  const count = (width - 2) * (height - 2)
  const lap = new Float32Array(count)
  let idx = 0
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      lap[idx++] =
        gray[(y - 1) * width + x] +
        gray[y * width + (x - 1)] +
        gray[y * width + (x + 1)] +
        gray[(y + 1) * width + x] -
        4 * gray[y * width + x]
    }
  }

  // Variance = E[X²] − E[X]²
  let sum = 0
  let sumSq = 0
  for (let i = 0; i < count; i++) {
    sum += lap[i]
    sumSq += lap[i] * lap[i]
  }
  const mean = sum / count
  return sumSq / count - mean * mean
}
