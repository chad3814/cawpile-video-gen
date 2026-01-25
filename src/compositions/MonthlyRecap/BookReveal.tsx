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
import { fadeIn, countUp, typewriter } from '../../lib/animations'
import type { RecapBook } from '../../lib/types'

interface BookRevealProps {
  book: RecapBook
  index: number
}

// Exit directions: [x, y, rotation] - slides off to corners/sides
const EXIT_DIRECTIONS = [
  { x: -1200, y: -400, rotate: -15 },  // top-left
  { x: 1200, y: -400, rotate: 15 },    // top-right
  { x: -1200, y: 400, rotate: 15 },    // bottom-left
  { x: 1200, y: 400, rotate: -15 },    // bottom-right
  { x: -1200, y: 0, rotate: -10 },     // left
  { x: 1200, y: 0, rotate: 10 },       // right
] as const

export const BookReveal: React.FC<BookRevealProps> = ({ book, index }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Pick exit direction based on index (consistent per book)
  const exitDirection = EXIT_DIRECTIONS[index % EXIT_DIRECTIONS.length]

  // Exit animation starts near the end
  const exitStartFrame = TIMING.bookTotal - TIMING.bookExit
  const exitProgress = spring({
    frame: frame - exitStartFrame,
    fps,
    config: { damping: 15, stiffness: 80, mass: 1 },
  })

  const exitX = interpolate(exitProgress, [0, 1], [0, exitDirection.x])
  const exitY = interpolate(exitProgress, [0, 1], [0, exitDirection.y])
  const exitRotate = interpolate(exitProgress, [0, 1], [0, exitDirection.rotate])
  const exitScale = interpolate(exitProgress, [0, 1], [1, 0.8])

  // Overall fade (just for enter, exit is handled by slide)
  const fadeInOpacity = fadeIn(frame, 0, 10)
  const opacity = fadeInOpacity

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

  // Stars slam down one at a time
  const starStartFrame = 50
  const starDelay = 4 // frames between each star

  // Status badge (after all stars have landed)
  const badgeStartFrame = starStartFrame + 5 * starDelay + 5
  const badgeScale = spring({
    frame: frame - badgeStartFrame,
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

      {/* Content container with exit animation */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: 60,
          transform: `translate(${exitX}px, ${exitY}px) rotate(${exitRotate}deg) scale(${exitScale})`,
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
                {/* Stars - slam down one at a time */}
                <div
                  style={{
                    display: 'flex',
                    fontSize: 40,
                  }}
                >
                  {Array.from({ length: 5 }).map((_, i) => {
                    const isFilled = i < stars
                    const starFrame = starStartFrame + i * starDelay

                    const starProgress = spring({
                      frame: frame - starFrame,
                      fps,
                      config: { damping: 12, stiffness: 300, mass: 0.5 },
                    })

                    const translateY = interpolate(starProgress, [0, 1], [-80, 0])
                    const opacity = interpolate(starProgress, [0, 0.3, 1], [0, 1, 1])
                    const scale = interpolate(starProgress, [0, 0.8, 1], [0.5, 1.2, 1])

                    return (
                      <span
                        key={i}
                        style={{
                          display: 'inline-block',
                          transform: `translateY(${translateY}px) scale(${scale})`,
                          opacity,
                          fontFamily: '"Noto Emoji", sans-serif',
                          color: isFilled ? '#FFD700' : COLORS.textMuted,
                        }}
                      >
                        ⭐
                      </span>
                    )
                  })}
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
