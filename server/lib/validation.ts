import type { RenderRequest } from '../../src/lib/types'

/**
 * Result of validating a render stream query parameter
 */
export type ValidationResult =
  | { valid: true; data: RenderRequest }
  | { valid: false; error: string }

/**
 * Parse and validate the render-stream query parameter
 *
 * @param queryData - The URL-encoded JSON string from the `data` query parameter
 * @returns ValidationResult indicating success with parsed data or failure with error message
 */
export function parseRenderStreamQuery(queryData: string | undefined): ValidationResult {
  // Check for missing data parameter
  if (queryData === undefined || queryData === '') {
    return { valid: false, error: 'Missing required query parameter: data' }
  }

  // URL-decode and parse JSON
  let parsed: unknown
  try {
    const decoded = decodeURIComponent(queryData)
    parsed = JSON.parse(decoded)
  } catch {
    return { valid: false, error: 'Invalid JSON in data parameter' }
  }

  // Validate top-level structure
  if (typeof parsed !== 'object' || parsed === null) {
    return { valid: false, error: 'Invalid request: expected object' }
  }

  const request = parsed as Record<string, unknown>

  // Validate userId
  if (!request.userId) {
    return { valid: false, error: 'Invalid request: userId is required' }
  }

  if (typeof request.userId !== 'string') {
    return { valid: false, error: 'Invalid request: userId must be a string' }
  }

  if (request.userId.trim() === '') {
    return { valid: false, error: 'Invalid request: userId cannot be empty' }
  }

  // Validate data field exists
  if (!request.data) {
    return { valid: false, error: 'Invalid request: data field is required' }
  }

  if (typeof request.data !== 'object' || request.data === null) {
    return { valid: false, error: 'Invalid request: data must be an object' }
  }

  const data = request.data as Record<string, unknown>

  // Validate data contains required fields
  if (!data.meta) {
    return { valid: false, error: 'Invalid request: data.meta is required' }
  }

  if (!data.books) {
    return { valid: false, error: 'Invalid request: data.books is required' }
  }

  if (!data.stats) {
    return { valid: false, error: 'Invalid request: data.stats is required' }
  }

  // All validations passed
  return { valid: true, data: request as unknown as RenderRequest }
}
