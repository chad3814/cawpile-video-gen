import express from 'express'
import cors from 'cors'
import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition } from '@remotion/renderer'
import path from 'path'
import fs from 'fs'
import type { MonthlyRecapExport } from '../src/lib/types'
import { calculateDuration } from '../src/compositions/MonthlyRecap'
import { VIDEO_CONFIG } from '../src/lib/theme'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Output directory
const OUTPUT_DIR = path.join(process.cwd(), 'out')
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Render endpoint
app.post('/render', async (req, res) => {
  const startTime = Date.now()

  try {
    const data: MonthlyRecapExport = req.body

    // Validate input
    if (!data || !data.meta || !data.books || !data.stats) {
      return res.status(400).json({
        error: 'Invalid request body. Expected MonthlyRecapExport format.',
      })
    }

    console.log(
      `[Render] Starting render for ${data.meta.monthName} ${data.meta.year} (${data.books.length} books)`
    )

    // Calculate duration based on content
    const durationInFrames = calculateDuration(data)
    console.log(`[Render] Duration: ${durationInFrames} frames (${(durationInFrames / VIDEO_CONFIG.fps).toFixed(1)}s)`)

    // Bundle the project
    console.log('[Render] Bundling...')
    const bundleLocation = await bundle({
      entryPoint: path.join(process.cwd(), 'src/index.ts'),
      onProgress: (progress) => {
        if (progress % 25 === 0) {
          console.log(`[Render] Bundle progress: ${progress}%`)
        }
      },
    })

    // Select composition
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'MonthlyRecap',
      inputProps: { data },
    })

    // Override duration with calculated value
    composition.durationInFrames = durationInFrames

    // Generate output filename
    const filename = `recap-${data.meta.year}-${String(data.meta.month).padStart(2, '0')}-${Date.now()}.mp4`
    const outputPath = path.join(OUTPUT_DIR, filename)

    // Render the video
    console.log('[Render] Rendering video...')
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: { data },
      onProgress: ({ progress }) => {
        if (Math.round(progress * 100) % 10 === 0) {
          console.log(`[Render] Render progress: ${Math.round(progress * 100)}%`)
        }
      },
    })

    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`[Render] Complete! Rendered in ${elapsedTime}s: ${outputPath}`)

    // Return success with file info
    res.json({
      success: true,
      filename,
      path: outputPath,
      duration: durationInFrames / VIDEO_CONFIG.fps,
      renderTime: elapsedTime,
    })
  } catch (error) {
    console.error('[Render] Error:', error)
    res.status(500).json({
      error: 'Render failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// Download endpoint
app.get('/download/:filename', (req, res) => {
  const { filename } = req.params
  const filePath = path.join(OUTPUT_DIR, filename)

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' })
  }

  res.download(filePath)
})

// List rendered videos
app.get('/videos', (req, res) => {
  const files = fs.readdirSync(OUTPUT_DIR).filter((f) => f.endsWith('.mp4'))
  const videos = files.map((filename) => {
    const filePath = path.join(OUTPUT_DIR, filename)
    const stats = fs.statSync(filePath)
    return {
      filename,
      size: stats.size,
      created: stats.birthtime,
    }
  })
  res.json({ videos })
})

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║  Cawpile Video Generator Server                       ║
║  ─────────────────────────────────────────────────── ║
║  Listening on http://localhost:${PORT}                   ║
║                                                       ║
║  Endpoints:                                           ║
║    POST /render     - Render video from recap data    ║
║    GET  /download/:filename - Download rendered video ║
║    GET  /videos     - List rendered videos            ║
║    GET  /health     - Health check                    ║
╚═══════════════════════════════════════════════════════╝
  `)
})
