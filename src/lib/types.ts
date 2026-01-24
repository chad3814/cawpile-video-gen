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
