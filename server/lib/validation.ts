import type { RenderRequest, MonthlyRecapExport } from '../../src/lib/types'

/**
 * Result of validating a render stream query parameter
 */
export type ValidationResult =
  | { valid: true; data: RenderRequest }
  | { valid: false; error: string }

/**
 * Parse and validate the render-stream query parameters
 *
 * @param queryData - The URL-encoded JSON string from the `data` query parameter
 * @param queryUserId - The userId from the `userId` query parameter
 * @returns ValidationResult indicating success with parsed data or failure with error message
 */
export function parseRenderStreamQuery(
  queryData: string | undefined,
  queryUserId: string | undefined
): ValidationResult {
  // Validate userId
  if (!queryUserId) {
    return { valid: false, error: 'Invalid request: userId is required' }
  }

  if (typeof queryUserId !== 'string') {
    return { valid: false, error: 'Invalid request: userId must be a string' }
  }

  if (queryUserId.trim() === '') {
    return { valid: false, error: 'Invalid request: userId cannot be empty' }
  }

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

  const data = parsed as Record<string, unknown>

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

  // All validations passed - construct the RenderRequest
  return {
    valid: true,
    data: {
      userId: queryUserId,
      data: parsed as MonthlyRecapExport,
    },
  }
}
