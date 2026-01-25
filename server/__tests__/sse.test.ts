import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  setupSSEHeaders,
  sendProgressEvent,
  sendCompleteEvent,
  sendErrorEvent,
  sendKeepalive,
  mapBundleProgress,
  mapRenderProgress,
} from '../lib/sse'
import type { Response } from 'express'

/**
 * Create a mock Express response object for testing
 */
function createMockResponse(): Response & { writtenData: string[]; headers: Map<string, string> } {
  const writtenData: string[] = []
  const headers = new Map<string, string>()

  const mockRes = {
    writtenData,
    headers,
    setHeader: vi.fn((name: string, value: string) => {
      headers.set(name, value)
      return mockRes
    }),
    flushHeaders: vi.fn(),
    write: vi.fn((data: string) => {
      writtenData.push(data)
      return true
    }),
  } as unknown as Response & { writtenData: string[]; headers: Map<string, string> }

  return mockRes
}

describe('SSE Utilities', () => {
  describe('setupSSEHeaders', () => {
    it('should set correct SSE headers', () => {
      const mockRes = createMockResponse()

      setupSSEHeaders(mockRes)

      expect(mockRes.headers.get('Content-Type')).toBe('text/event-stream')
      expect(mockRes.headers.get('Cache-Control')).toBe('no-cache')
      expect(mockRes.headers.get('Connection')).toBe('keep-alive')
      expect(mockRes.flushHeaders).toHaveBeenCalled()
    })
  })

  describe('sendProgressEvent', () => {
    it('should format progress event correctly with bundling phase', () => {
      const mockRes = createMockResponse()

      sendProgressEvent(mockRes, 15, 'bundling')

      const output = mockRes.writtenData.join('')
      expect(output).toBe('event: progress\ndata: {"progress":15,"phase":"bundling"}\n\n')
    })

    it('should format progress event correctly with rendering phase', () => {
      const mockRes = createMockResponse()

      sendProgressEvent(mockRes, 75, 'rendering')

      const output = mockRes.writtenData.join('')
      expect(output).toBe('event: progress\ndata: {"progress":75,"phase":"rendering"}\n\n')
    })
  })

  describe('sendCompleteEvent', () => {
    it('should format complete event with filename and s3Url', () => {
      const mockRes = createMockResponse()

      sendCompleteEvent(mockRes, 'recap-2026-01.mp4', 'https://bucket.s3.us-east-1.amazonaws.com/video.mp4')

      const output = mockRes.writtenData.join('')
      expect(output).toBe(
        'event: complete\ndata: {"filename":"recap-2026-01.mp4","s3Url":"https://bucket.s3.us-east-1.amazonaws.com/video.mp4"}\n\n'
      )
    })
  })

  describe('sendErrorEvent', () => {
    it('should format error event with message', () => {
      const mockRes = createMockResponse()

      sendErrorEvent(mockRes, 'Render failed: out of memory')

      const output = mockRes.writtenData.join('')
      expect(output).toBe('event: error\ndata: {"message":"Render failed: out of memory"}\n\n')
    })
  })

  describe('sendKeepalive', () => {
    it('should send keepalive comment in correct format', () => {
      const mockRes = createMockResponse()

      sendKeepalive(mockRes)

      const output = mockRes.writtenData.join('')
      expect(output).toBe(': keepalive\n\n')
    })
  })

  describe('mapBundleProgress', () => {
    it('should map 0 to 0', () => {
      expect(mapBundleProgress(0)).toBe(0)
    })

    it('should map 100 to 25', () => {
      expect(mapBundleProgress(100)).toBe(25)
    })

    it('should map 50 to 12 (floor of 12.5)', () => {
      expect(mapBundleProgress(50)).toBe(12)
    })

    it('should use floor for non-integer results', () => {
      // 33 * 0.25 = 8.25 -> floor to 8
      expect(mapBundleProgress(33)).toBe(8)
    })
  })

  describe('mapRenderProgress', () => {
    it('should map 0 to 25', () => {
      expect(mapRenderProgress(0)).toBe(25)
    })

    it('should map 1 to 100', () => {
      expect(mapRenderProgress(1)).toBe(100)
    })

    it('should map 0.5 to 63 (25 + round(37.5))', () => {
      expect(mapRenderProgress(0.5)).toBe(63)
    })

    it('should use round for non-integer results', () => {
      // 0.33 * 75 = 24.75 -> round to 25 -> 25 + 25 = 50
      expect(mapRenderProgress(0.33)).toBe(50)
    })
  })
})
