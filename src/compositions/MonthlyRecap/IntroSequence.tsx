import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion'
import { COLORS, FONTS, TIMING } from '../../lib/theme'
import { KineticText } from '../../components/KineticText'
import { fadeIn, fadeOut } from '../../lib/animations'

interface IntroSequenceProps {
  monthName: string
  year: number
  bookCount: number
}

export const IntroSequence: React.FC<IntroSequenceProps> = ({
  monthName,
  year,
  bookCount,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Fade in at start, fade out at end
  const fadeInOpacity = fadeIn(frame, 0, TIMING.introFadeIn)
  const fadeOutOpacity = fadeOut(frame, TIMING.introTotal - TIMING.introFadeOut, TIMING.introFadeOut)
  const opacity = Math.min(fadeInOpacity, fadeOutOpacity)

  // Subtle background animation
  const bgScale = interpolate(frame, [0, TIMING.introTotal], [1.05, 1], {
    extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        opacity,
      }}
    >
      {/* Animated gradient background */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${COLORS.backgroundTertiary} 0%, ${COLORS.background} 70%)`,
          transform: `scale(${bgScale})`,
        }}
      />

      {/* Grain overlay */}
      <AbsoluteFill
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: 0.04,
          mixBlendMode: 'overlay',
        }}
      />

      {/* Content */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 60,
        }}
      >
        {/* "READING RECAP" header */}
        <div style={{ marginBottom: 40 }}>
          <KineticText
            text="READING RECAP"
            startFrame={5}
            style="fadeUp"
            fontSize={32}
            color={COLORS.accent}
            fontWeight={600}
            letterSpacing={8}
          />
        </div>

        {/* Month name - big slam animation */}
        <KineticText
          text={monthName.toUpperCase()}
          startFrame={15}
          style="slam"
          fontSize={120}
          color={COLORS.textPrimary}
          fontWeight={900}
          letterSpacing={-4}
        />

        {/* Year */}
        <div style={{ marginTop: 20 }}>
          <KineticText
            text={year.toString()}
            startFrame={25}
            style="fadeUp"
            fontSize={64}
            color={COLORS.textSecondary}
            fontWeight={300}
            letterSpacing={12}
          />
        </div>

        {/* Book count teaser */}
        <div style={{ marginTop: 80 }}>
          <KineticText
            text={`${bookCount} ${bookCount === 1 ? 'BOOK' : 'BOOKS'} FINISHED`}
            startFrame={40}
            style="scaleIn"
            fontSize={36}
            color={COLORS.textMuted}
            fontWeight={500}
            letterSpacing={4}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

export default IntroSequence
