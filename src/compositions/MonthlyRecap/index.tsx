import React from 'react'
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion'
import { COLORS, TIMING, VIDEO_CONFIG } from '../../lib/theme'
import type { MonthlyRecapExport } from '../../lib/types'
import { IntroSequence } from './IntroSequence'
import { BookReveal } from './BookReveal'
import { StatsReveal } from './StatsReveal'
import { ComingSoonSequence } from './ComingSoonSequence'
import { OutroSequence } from './OutroSequence'

export interface MonthlyRecapProps {
  data: MonthlyRecapExport
}

/**
 * Calculate total duration based on content
 */
export function calculateDuration(data: MonthlyRecapExport): number {
  const introFrames = TIMING.introTotal
  const bookFrames = data.books.length * TIMING.bookTotal
  const statsFrames = TIMING.statsTotal
  const comingSoonFrames = data.currentlyReading.length > 0 ? TIMING.comingSoonTotal : 0
  const outroFrames = TIMING.outroTotal

  // Subtract overlaps between sequences
  const overlaps = TIMING.transitionOverlap * (
    1 + // intro -> books
    (data.books.length > 0 ? data.books.length : 0) + // between books and to stats
    (data.currentlyReading.length > 0 ? 1 : 0) + // stats -> coming soon
    1 // -> outro
  )

  return introFrames + bookFrames + statsFrames + comingSoonFrames + outroFrames - overlaps
}

export const MonthlyRecap: React.FC<MonthlyRecapProps> = ({ data }) => {
  const { fps } = useVideoConfig()

  // Calculate frame positions for each sequence
  let currentFrame = 0

  const introStart = currentFrame
  currentFrame += TIMING.introTotal - TIMING.transitionOverlap

  const bookStarts: number[] = []
  for (let i = 0; i < data.books.length; i++) {
    bookStarts.push(currentFrame)
    currentFrame += TIMING.bookTotal - TIMING.transitionOverlap
  }

  const statsStart = currentFrame
  currentFrame += TIMING.statsTotal - TIMING.transitionOverlap

  const comingSoonStart = data.currentlyReading.length > 0 ? currentFrame : -1
  if (data.currentlyReading.length > 0) {
    currentFrame += TIMING.comingSoonTotal - TIMING.transitionOverlap
  }

  const outroStart = currentFrame

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
      {/* Intro */}
      <Sequence from={introStart} durationInFrames={TIMING.introTotal}>
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
          durationInFrames={TIMING.bookTotal}
        >
          <BookReveal book={book} index={index} random={Math.random()} />
        </Sequence>
      ))}

      {/* Stats */}
      <Sequence from={statsStart} durationInFrames={TIMING.statsTotal}>
        <StatsReveal stats={data.stats} />
      </Sequence>

      {/* Coming Soon (only if there are currently reading books) */}
      {data.currentlyReading.length > 0 && (
        <Sequence from={comingSoonStart} durationInFrames={TIMING.comingSoonTotal}>
          <ComingSoonSequence books={data.currentlyReading} />
        </Sequence>
      )}

      {/* Outro */}
      <Sequence from={outroStart} durationInFrames={TIMING.outroTotal}>
        <OutroSequence />
      </Sequence>
    </AbsoluteFill>
  )
}

export default MonthlyRecap
