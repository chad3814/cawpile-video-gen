import React from 'react'
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  Img,
  spring,
  interpolate,
} from 'remotion'
import { COLORS, FONTS, TIMING, getRatingColor, convertToStars } from '../../lib/theme'
import { fadeIn, fadeOut, slideInFromLeft, countUp, typewriter } from '../../lib/animations'
import type { RecapBook } from '../../lib/types'

interface BookRevealProps {
  book: RecapBook
  index: number
}

export const BookReveal: React.FC<BookRevealProps> = ({ book, index }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Overall fade
  const fadeInOpacity = fadeIn(frame, 0, 10)
  const fadeOutOpacity = fadeOut(frame, TIMING.bookTotal - TIMING.bookFadeOut, TIMING.bookFadeOut)
  const opacity = Math.min(fadeInOpacity, fadeOutOpacity)

  // Cover slide in
  const coverSlide = spring({
    frame: frame - 5,
    fps,
    config: { damping: 15, stiffness: 120, mass: 0.8 },
  })
  const coverX = interpolate(coverSlide, [0, 1], [-400, 0])
  const coverOpacity = interpolate(coverSlide, [0, 0.3, 1], [0, 1, 1])

  // Title animation
  const titleText = typewriter(frame, 20, book.title, 1.2)

  // Author fade in
  const authorOpacity = fadeIn(frame, 35, 10)

  // Rating counter
  const ratingValue = book.rating
    ? countUp(frame, 45, 25, book.rating.average * 10) / 10
    : 0

  // Stars pop in
  const starsProgress = spring({
    frame: frame - 50,
    fps,
    config: { damping: 12, stiffness: 200, mass: 0.4 },
  })

  // Status badge
  const badgeScale = spring({
    frame: frame - 55,
    fps,
    config: { damping: 10, stiffness: 300, mass: 0.3 },
  })

  const stars = book.rating ? convertToStars(book.rating.average) : 0
  const isCompleted = book.status === 'COMPLETED'

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
          background: `linear-gradient(135deg, ${COLORS.backgroundSecondary} 0%, ${COLORS.background} 100%)`,
        }}
      />

      {/* Content container */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: 60,
        }}
      >
        {/* Book number indicator */}
        <div
          style={{
            position: 'absolute',
            top: 60,
            right: 60,
            fontFamily: FONTS.mono,
            fontSize: 24,
            color: COLORS.textMuted,
            opacity: fadeIn(frame, 0, 15),
          }}
        >
          #{index + 1}
        </div>

        {/* Main content area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 40,
          }}
        >
          {/* Book cover */}
          <div
            style={{
              transform: `translateX(${coverX}px)`,
              opacity: coverOpacity,
            }}
          >
            {book.coverUrl ? (
              <Img
                src={book.coverUrl}
                style={{
                  width: 280,
                  height: 420,
                  objectFit: 'cover',
                  borderRadius: 12,
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                }}
              />
            ) : (
              <div
                style={{
                  width: 280,
                  height: 420,
                  backgroundColor: COLORS.backgroundTertiary,
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: FONTS.heading,
                  fontSize: 24,
                  color: COLORS.textMuted,
                  textAlign: 'center',
                  padding: 20,
                }}
              >
                {book.title}
              </div>
            )}
          </div>

          {/* Book info */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
              maxWidth: 800,
            }}
          >
            {/* Title */}
            <h1
              style={{
                fontFamily: FONTS.heading,
                fontSize: 48,
                fontWeight: 700,
                color: COLORS.textPrimary,
                textAlign: 'center',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {titleText}
              {titleText.length < book.title.length && (
                <span style={{ opacity: frame % 10 < 5 ? 1 : 0 }}>|</span>
              )}
            </h1>

            {/* Author */}
            <p
              style={{
                fontFamily: FONTS.body,
                fontSize: 28,
                color: COLORS.textSecondary,
                margin: 0,
                opacity: authorOpacity,
              }}
            >
              {book.authors.join(', ')}
            </p>

            {/* Rating */}
            {book.rating && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  marginTop: 20,
                }}
              >
                {/* Stars */}
                <div
                  style={{
                    fontSize: 40,
                    transform: `scale(${starsProgress})`,
                  }}
                >
                  {'⭐'.repeat(stars)}
                  {'☆'.repeat(5 - stars)}
                </div>

                {/* Numeric rating */}
                <div
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 48,
                    fontWeight: 700,
                    color: getRatingColor(ratingValue),
                  }}
                >
                  {ratingValue.toFixed(1)}
                </div>
              </div>
            )}

            {/* Status badge */}
            <div
              style={{
                marginTop: 20,
                transform: `scale(${badgeScale})`,
              }}
            >
              <div
                style={{
                  padding: '12px 32px',
                  borderRadius: 50,
                  backgroundColor: isCompleted ? COLORS.completed : COLORS.dnf,
                  fontFamily: FONTS.heading,
                  fontSize: 20,
                  fontWeight: 600,
                  color: COLORS.textPrimary,
                  textTransform: 'uppercase',
                  letterSpacing: 2,
                }}
              >
                {isCompleted ? 'Completed' : 'DNF'}
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

export default BookReveal
