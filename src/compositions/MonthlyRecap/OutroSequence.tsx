import React from 'react'
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from 'remotion'
import { COLORS, FONTS, TIMING } from '../../lib/theme'
import { fadeIn, fadeOut, pulse } from '../../lib/animations'
import { KineticText } from '../../components/KineticText'

export const OutroSequence: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Overall fade
  const fadeInOpacity = fadeIn(frame, 0, TIMING.outroFadeIn)
  const fadeOutOpacity = fadeOut(
    frame,
    TIMING.outroTotal - TIMING.outroFadeOut,
    TIMING.outroFadeOut
  )
  const opacity = Math.min(fadeInOpacity, fadeOutOpacity)

  // Logo pulse
  const pulseScale = 1 + pulse(frame, fps, 0.5) * 0.03

  // Logo animation
  const logoScale = spring({
    frame: frame - 10,
    fps,
    config: { damping: 12, stiffness: 150, mass: 0.6 },
  })

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
          background: `radial-gradient(circle at 50% 50%, ${COLORS.accent}10 0%, transparent 60%)`,
        }}
      />

      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 40,
        }}
      >
        {/* Logo/Brand */}
        <div
          style={{
            transform: `scale(${logoScale * pulseScale})`,
          }}
        >
          <div
            style={{
              fontFamily: FONTS.heading,
              fontSize: 80,
              fontWeight: 900,
              color: COLORS.accent,
              letterSpacing: -2,
            }}
          >
            cawpile
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            opacity: fadeIn(frame, 20, 15),
          }}
        >
          <KineticText
            text="Track Your Reading Journey"
            startFrame={25}
            style="fadeUp"
            fontSize={28}
            color={COLORS.textSecondary}
            fontWeight={400}
            letterSpacing={2}
          />
        </div>

        {/* Website */}
        <div
          style={{
            marginTop: 40,
            opacity: fadeIn(frame, 35, 10),
            fontFamily: FONTS.mono,
            fontSize: 24,
            color: COLORS.textMuted,
          }}
        >
          cawpile.org
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

export default OutroSequence
