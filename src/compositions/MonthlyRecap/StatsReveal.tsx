import React from 'react'
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Img,
} from 'remotion'
import { COLORS, FONTS, TIMING, getRatingColor } from '../../lib/theme'
import { fadeIn, fadeOut, countUp, staggerDelay } from '../../lib/animations'
import { KineticText } from '../../components/KineticText'
import type { RecapStats } from '../../lib/types'

interface StatsRevealProps {
  stats: RecapStats
}

interface StatCardProps {
  label: string
  value: number | string
  startFrame: number
  color?: string
  suffix?: string
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  startFrame,
  color = COLORS.textPrimary,
  suffix = '',
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const scale = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 12, stiffness: 180, mass: 0.5 },
  })

  const displayValue =
    typeof value === 'number'
      ? countUp(frame, startFrame + 5, 30, value)
      : value

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          fontFamily: FONTS.mono,
          fontSize: 72,
          fontWeight: 700,
          color,
          lineHeight: 1,
        }}
      >
        {displayValue}
        {suffix}
      </div>
      <div
        style={{
          fontFamily: FONTS.body,
          fontSize: 24,
          color: COLORS.textMuted,
          textTransform: 'uppercase',
          letterSpacing: 3,
        }}
      >
        {label}
      </div>
    </div>
  )
}

export const StatsReveal: React.FC<StatsRevealProps> = ({ stats }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Overall fade
  const fadeInOpacity = fadeIn(frame, 0, 15)
  const fadeOutOpacity = fadeOut(
    frame,
    TIMING.statsTotal - TIMING.statsFadeOut,
    TIMING.statsFadeOut
  )
  const opacity = Math.min(fadeInOpacity, fadeOutOpacity)

  // Top rated book animation
  const topBookScale = spring({
    frame: frame - 60,
    fps,
    config: { damping: 15, stiffness: 150, mass: 0.6 },
  })

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        opacity,
      }}
    >
      {/* Background */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 100%, ${COLORS.accent}15 0%, transparent 50%)`,
        }}
      />

      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: 60,
          gap: 60,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <KineticText
            text="MONTHLY STATS"
            startFrame={5}
            style="slam"
            fontSize={56}
            color={COLORS.accent}
            fontWeight={800}
            letterSpacing={4}
          />
        </div>

        {/* Main stats grid */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            flex: 1,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 60,
              width: '100%',
              maxWidth: 800,
            }}
          >
            <StatCard
              label="Books Read"
              value={stats.totalBooks}
              startFrame={15}
              color={COLORS.accent}
            />
            <StatCard
              label="Pages Read"
              value={stats.totalPages}
              startFrame={20}
            />
            <StatCard
              label="Completed"
              value={stats.completedCount}
              startFrame={25}
              color={COLORS.completed}
            />
            <StatCard
              label="DNF"
              value={stats.dnfCount}
              startFrame={30}
              color={stats.dnfCount > 0 ? COLORS.dnf : COLORS.textMuted}
            />
          </div>
        </div>

        {/* Average rating */}
        {stats.averageRating && (
          <div
            style={{
              textAlign: 'center',
              opacity: fadeIn(frame, 40, 15),
            }}
          >
            <div
              style={{
                fontFamily: FONTS.body,
                fontSize: 24,
                color: COLORS.textMuted,
                marginBottom: 12,
              }}
            >
              AVERAGE RATING
            </div>
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: 96,
                fontWeight: 700,
                color: getRatingColor(stats.averageRating),
              }}
            >
              {countUp(frame, 45, 30, stats.averageRating * 10) / 10}
            </div>
          </div>
        )}

        {/* Top rated book */}
        {stats.topRatedBook && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 30,
              padding: 30,
              backgroundColor: COLORS.backgroundSecondary,
              borderRadius: 20,
              transform: `scale(${topBookScale})`,
            }}
          >
            {stats.topRatedBook.coverUrl && (
              <Img
                src={stats.topRatedBook.coverUrl}
                style={{
                  width: 80,
                  height: 120,
                  objectFit: 'cover',
                  borderRadius: 8,
                }}
              />
            )}
            <div>
              <div
                style={{
                  fontFamily: FONTS.body,
                  fontSize: 18,
                  color: COLORS.accent,
                  textTransform: 'uppercase',
                  letterSpacing: 2,
                  marginBottom: 8,
                }}
              >
                Top Rated
              </div>
              <div
                style={{
                  fontFamily: FONTS.heading,
                  fontSize: 28,
                  fontWeight: 600,
                  color: COLORS.textPrimary,
                  maxWidth: 500,
                }}
              >
                {stats.topRatedBook.title}
              </div>
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 24,
                  color: getRatingColor(stats.topRatedBook.rating),
                  marginTop: 8,
                }}
              >
                {stats.topRatedBook.rating.toFixed(1)} / 10
              </div>
            </div>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

export default StatsReveal
