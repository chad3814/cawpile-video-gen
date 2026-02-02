/**
 * Types for the Monthly Reading Recap
 * Matches the export format from Cawpile API
 */

export interface RecapBookRating {
  average: number
  characters: number | null
  atmosphere: number | null
  writing: number | null
  plot: number | null
  intrigue: number | null
  logic: number | null
  enjoyment: number | null
}

export interface RecapBook {
  id: string
  title: string
  authors: string[]
  coverUrl: string | null
  status: 'COMPLETED' | 'DNF'
  finishDate: string
  rating: RecapBookRating | null
  pageCount: number | null
}

export interface RecapCurrentlyReading {
  id: string
  title: string
  authors: string[]
  coverUrl: string | null
  progress: number
}

export interface RecapStats {
  totalBooks: number
  completedCount: number
  dnfCount: number
  totalPages: number
  averageRating: number | null
  topRatedBook: {
    title: string
    coverUrl: string | null
    rating: number
  } | null
  lowestRatedBook: {
    title: string
    coverUrl: string | null
    rating: number
  } | null
}

export interface MonthlyRecapExport {
  meta: {
    month: number
    year: number
    monthName: string
    generatedAt: string
  }
  books: RecapBook[]
  currentlyReading: RecapCurrentlyReading[]
  stats: RecapStats
}

/**
 * Video template definition for customizable video styling
 */
export interface VideoTemplate {
  id: string
  name: string
  description: string
  version: string

  // Visual theme
  colors: {
    background: string
    backgroundSecondary: string
    backgroundTertiary: string
    textPrimary: string
    textSecondary: string
    textMuted: string
    accent: string
    accentSecondary: string
    accentMuted: string
    completed: string
    dnf: string
    ratingHigh: string
    ratingMedium: string
    ratingLow: string
    overlay: string
    grain: string
  }

  // Typography
  fonts: {
    heading: string
    body: string
    mono: string
  }

  // Timing configuration (in frames at 30fps)
  timing: {
    introFadeIn: number
    introHold: number
    introFadeOut: number
    introTotal: number
    bookSlideIn: number
    bookTitleType: number
    bookRatingCount: number
    bookHold: number
    bookExit: number
    bookTotal: number
    statsCountUp: number
    statsHold: number
    statsFadeOut: number
    statsTotal: number
    comingSoonFadeIn: number
    comingSoonHold: number
    comingSoonFadeOut: number
    comingSoonTotal: number
    outroFadeIn: number
    outroHold: number
    outroFadeOut: number
    outroTotal: number
    transitionOverlap: number
  }

  // Layout and animation preferences
  layout: {
    introStyle: 'slam' | 'fadeUp' | 'scaleIn' | 'typewriter'
    bookRevealAnimation: 'slide' | 'fade' | 'scale'
    statsAnimation: 'countUp' | 'fadeIn' | 'pop'
    outroAnimation: 'fade' | 'scale' | 'slide'
  }

  // Sequence configuration
  sequences: {
    intro: boolean
    bookReveal: boolean
    stats: boolean
    comingSoon: boolean
    outro: boolean
  }
}

/**
 * Render request body with userId for S3 path organization
 */
export interface RenderRequest {
  userId: string
  data: MonthlyRecapExport
  template?: VideoTemplate | string // Full template or template ID
}

/**
 * Successful render response with S3 URL
 */
export interface RenderResponse {
  success: true
  filename: string
  s3Url: string
  duration: number
  renderTime: string
}

/**
 * Error response for render failures
 */
export interface RenderErrorResponse {
  error: string
  message: string
}

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const
