import { describe, it, expect } from 'vitest'
import { parseRenderStreamQuery } from '../lib/validation'
import type { MonthlyRecapExport } from '../../src/lib/types'

/**
 * Create a valid MonthlyRecapExport for testing
 */
function createValidMonthlyRecapExport(): MonthlyRecapExport {
  return {
    meta: {
      month: 1,
      year: 2026,
      monthName: 'January',
      generatedAt: '2026-01-24T15:30:42Z',
    },
    books: [
      {
        id: 'book-1',
        title: 'Test Book',
        authors: ['Test Author'],
        coverUrl: 'https://example.com/cover.jpg',
        status: 'COMPLETED',
        finishDate: '2026-01-15',
        rating: {
          average: 4.5,
          characters: 4,
          atmosphere: 5,
          writing: 4,
          plot: 5,
          intrigue: 4,
          logic: 4,
          enjoyment: 5,
        },
        pageCount: 300,
      },
    ],
    currentlyReading: [],
    stats: {
      totalBooks: 1,
      completedCount: 1,
      dnfCount: 0,
      totalPages: 300,
      averageRating: 4.5,
      topRatedBook: {
        title: 'Test Book',
        coverUrl: 'https://example.com/cover.jpg',
        rating: 4.5,
      },
      lowestRatedBook: null,
    },
  }
}

describe('Validation Utilities', () => {
  describe('parseRenderStreamQuery', () => {
    it('should parse valid URL-encoded JSON successfully', () => {
      const validRequest = {
        userId: 'user-123',
        data: createValidMonthlyRecapExport(),
      }
      const encoded = encodeURIComponent(JSON.stringify(validRequest))

      const result = parseRenderStreamQuery(encoded)

      expect(result.valid).toBe(true)
      if (result.valid) {
        expect(result.data.userId).toBe('user-123')
        expect(result.data.data.meta.monthName).toBe('January')
      }
    })

    it('should return error for missing data query parameter', () => {
      const result = parseRenderStreamQuery(undefined)

      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toContain('Missing required query parameter')
      }
    })

    it('should return error for empty data query parameter', () => {
      const result = parseRenderStreamQuery('')

      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toContain('Missing required query parameter')
      }
    })

    it('should return error for malformed JSON', () => {
      const malformedJson = encodeURIComponent('{invalid json}')

      const result = parseRenderStreamQuery(malformedJson)

      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toContain('Invalid JSON')
      }
    })

    it('should return error for missing userId', () => {
      const requestWithoutUserId = {
        data: createValidMonthlyRecapExport(),
      }
      const encoded = encodeURIComponent(JSON.stringify(requestWithoutUserId))

      const result = parseRenderStreamQuery(encoded)

      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toContain('userId is required')
      }
    })

    it('should return error for empty userId', () => {
      const requestWithEmptyUserId = {
        userId: '   ',
        data: createValidMonthlyRecapExport(),
      }
      const encoded = encodeURIComponent(JSON.stringify(requestWithEmptyUserId))

      const result = parseRenderStreamQuery(encoded)

      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toContain('userId cannot be empty')
      }
    })

    it('should return error for missing data.meta', () => {
      const requestWithoutMeta = {
        userId: 'user-123',
        data: {
          books: [],
          stats: { totalBooks: 0 },
        },
      }
      const encoded = encodeURIComponent(JSON.stringify(requestWithoutMeta))

      const result = parseRenderStreamQuery(encoded)

      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toContain('data.meta is required')
      }
    })

    it('should return error for missing data.books', () => {
      const requestWithoutBooks = {
        userId: 'user-123',
        data: {
          meta: { month: 1, year: 2026 },
          stats: { totalBooks: 0 },
        },
      }
      const encoded = encodeURIComponent(JSON.stringify(requestWithoutBooks))

      const result = parseRenderStreamQuery(encoded)

      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toContain('data.books is required')
      }
    })

    it('should return error for missing data.stats', () => {
      const requestWithoutStats = {
        userId: 'user-123',
        data: {
          meta: { month: 1, year: 2026 },
          books: [],
        },
      }
      const encoded = encodeURIComponent(JSON.stringify(requestWithoutStats))

      const result = parseRenderStreamQuery(encoded)

      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toContain('data.stats is required')
      }
    })
  })
})
