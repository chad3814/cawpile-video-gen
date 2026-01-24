import React from 'react'
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Img,
} from 'remotion'
import { COLORS, FONTS, TIMING } from '../../lib/theme'
import { fadeIn, fadeOut, staggerDelay } from '../../lib/animations'
import { KineticText } from '../../components/KineticText'
import type { RecapCurrentlyReading } from '../../lib/types'

interface ComingSoonSequenceProps {
  books: RecapCurrentlyReading[]
}

interface BookCardProps {
  book: RecapCurrentlyReading
  index: number
}

const BookCard: React.FC<BookCardProps> = ({ book, index }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const delay = staggerDelay(index, 8)
  const startFrame = 20 + delay

  const scale = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 12, stiffness: 150, mass: 0.5 },
  })

  const translateY = interpolate(scale, [0, 1], [50, 0])
  const opacity = interpolate(scale, [0, 0.5, 1], [0, 1, 1])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        transform: `translateY(${translateY}px) scale(${scale})`,
        opacity,
      }}
    >
      {/* Cover */}
      {book.coverUrl ? (
        <Img
          src={book.coverUrl}
          style={{
            width: 160,
            height: 240,
            objectFit: 'cover',
            borderRadius: 10,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
          }}
        />
      ) : (
        <div
          style={{
            width: 160,
            height: 240,
            backgroundColor: COLORS.backgroundTertiary,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 12,
          }}
        >
          <span
            style={{
              fontFamily: FONTS.body,
              fontSize: 14,
              color: COLORS.textMuted,
              textAlign: 'center',
            }}
          >
            {book.title}
          </span>
        </div>
      )}

      {/* Title */}
      <div
        style={{
          fontFamily: FONTS.heading,
          fontSize: 18,
          fontWeight: 600,
          color: COLORS.textPrimary,
          textAlign: 'center',
          maxWidth: 180,
          lineHeight: 1.3,
        }}
      >
        {book.title.length > 30 ? book.title.slice(0, 30) + '...' : book.title}
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: 140,
          height: 8,
          backgroundColor: COLORS.backgroundTertiary,
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${book.progress}%`,
            height: '100%',
            backgroundColor: COLORS.accent,
            borderRadius: 4,
          }}
        />
      </div>

      {/* Progress text */}
      <div
        style={{
          fontFamily: FONTS.mono,
          fontSize: 14,
          color: COLORS.textMuted,
        }}
      >
        {Math.round(book.progress)}%
      </div>
    </div>
  )
}

export const ComingSoonSequence: React.FC<ComingSoonSequenceProps> = ({
  books,
}) => {
  const frame = useCurrentFrame()

  // Overall fade
  const fadeInOpacity = fadeIn(frame, 0, TIMING.comingSoonFadeIn)
  const fadeOutOpacity = fadeOut(
    frame,
    TIMING.comingSoonTotal - TIMING.comingSoonFadeOut,
    TIMING.comingSoonFadeOut
  )
  const opacity = Math.min(fadeInOpacity, fadeOutOpacity)

  // Only show up to 4 books
  const displayBooks = books.slice(0, 4)

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        opacity,
      }}
    >
      {/* Background gradient */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${COLORS.background} 0%, ${COLORS.backgroundSecondary} 100%)`,
        }}
      />

      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 60,
          gap: 60,
        }}
      >
        {/* Header */}
        <KineticText
          text="COMING SOON..."
          startFrame={5}
          style="slam"
          fontSize={64}
          color={COLORS.accent}
          fontWeight={800}
          letterSpacing={4}
        />

        {/* Subheader */}
        <div
          style={{
            opacity: fadeIn(frame, 15, 10),
            fontFamily: FONTS.body,
            fontSize: 28,
            color: COLORS.textSecondary,
          }}
        >
          Currently Reading
        </div>

        {/* Book cards grid */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 40,
            maxWidth: 900,
          }}
        >
          {displayBooks.map((book, index) => (
            <BookCard key={book.id} book={book} index={index} />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

export default ComingSoonSequence
