import React from 'react'
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion'
import { COLORS, TIMING, VIDEO_CONFIG } from '../../lib/theme'
import type { MonthlyRecapExport, VideoTemplate } from '../../lib/types'
import {
  TemplateProvider,
  useTemplateColors,
  useTemplateTiming,
  templateRegistry,
} from '../../lib/templates'
import { IntroSequence } from './IntroSequence'
import { BookReveal } from './BookReveal'
import { StatsReveal } from './StatsReveal'
import { ComingSoonSequence } from './ComingSoonSequence'
import { OutroSequence } from './OutroSequence'

export interface MonthlyRecapProps {
  data: MonthlyRecapExport
  template?: VideoTemplate
}

/**
 * Calculate total duration based on content and template timing
 */
export function calculateDuration(
  data: MonthlyRecapExport,
  timing: VideoTemplate['timing'] = TIMING,
): number {
  const introFrames = timing.introTotal
  const bookFrames = data.books.length * timing.bookTotal
  const statsFrames = timing.statsTotal
  const comingSoonFrames =
    data.currentlyReading.length > 0 ? timing.comingSoonTotal : 0
  const outroFrames = timing.outroTotal

  // Subtract overlaps between sequences
  const overlaps =
    timing.transitionOverlap *
    (1 + // intro -> books
      (data.books.length > 0 ? data.books.length : 0) + // between books and to stats
      (data.currentlyReading.length > 0 ? 1 : 0) + // stats -> coming soon
      1) // -> outro

  return (
    introFrames +
    bookFrames +
    statsFrames +
    comingSoonFrames +
    outroFrames -
    overlaps
  )
}

/**
 * Inner component that uses template hooks
 */
const MonthlyRecapInner: React.FC<{ data: MonthlyRecapExport }> = ({
  data,
}) => {
  const colors = useTemplateColors()
  const timing = useTemplateTiming()

  // Calculate frame positions for each sequence using template timing
  let currentFrame = 0

  const introStart = currentFrame
  currentFrame += timing.introTotal - timing.transitionOverlap

  const bookStarts: number[] = []
  for (let i = 0; i < data.books.length; i++) {
    bookStarts.push(currentFrame)
    currentFrame += timing.bookTotal - timing.transitionOverlap
  }

  const statsStart = currentFrame
  currentFrame += timing.statsTotal - timing.transitionOverlap

  const comingSoonStart = data.currentlyReading.length > 0 ? currentFrame : -1
  if (data.currentlyReading.length > 0) {
    currentFrame += timing.comingSoonTotal - timing.transitionOverlap
  }

  const outroStart = currentFrame

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background }}>
      {/* Intro */}
      <Sequence from={introStart} durationInFrames={timing.introTotal}>
        <IntroSequence
          monthName={data.meta.monthName}
          year={data.meta.year}
          bookCount={data.stats.totalBooks}
        />
      </Sequence>

      {/* Book reveals */}
      {data.books.map((book, index) => (
        <Sequence
          key={book.id}
          from={bookStarts[index]}
          durationInFrames={timing.bookTotal}
        >
          <BookReveal book={book} index={index} random={Math.random()} />
        </Sequence>
      ))}

      {/* Stats */}
      <Sequence from={statsStart} durationInFrames={timing.statsTotal}>
        <StatsReveal stats={data.stats} />
      </Sequence>

      {/* Coming Soon (only if there are currently reading books) */}
      {data.currentlyReading.length > 0 && (
        <Sequence
          from={comingSoonStart}
          durationInFrames={timing.comingSoonTotal}
        >
          <ComingSoonSequence books={data.currentlyReading} />
        </Sequence>
      )}

      {/* Outro */}
      <Sequence from={outroStart} durationInFrames={timing.outroTotal}>
        <OutroSequence />
      </Sequence>
    </AbsoluteFill>
  )
}

export const MonthlyRecap: React.FC<MonthlyRecapProps> = ({
  data,
  template,
}) => {
  // Use provided template or default
  const activeTemplate = template || templateRegistry.getDefault()

  return (
    <TemplateProvider template={activeTemplate}>
      <MonthlyRecapInner data={data} />
    </TemplateProvider>
  )
}

export default MonthlyRecap
