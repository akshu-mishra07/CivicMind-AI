import { customAlphabet } from 'nanoid';

// Custom alphabet for ticket IDs - digits only for clean numbers
const nanoidTicket = customAlphabet('0123456789', 6);

/**
 * Generate a unique ticket ID for issues: e.g. CVM-123456
 */
export function generateTicketId(): string {
  return `CVM-${nanoidTicket()}`;
}

/**
 * Convert string to url-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
}

/**
 * Clean HTML tags from a string (basic sanitization)
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Format date to ISO string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
}

/**
 * Remove specified keys from an object
 */
export function omitFields<T extends object, K extends keyof T>(
  obj: T,
  fields: K[]
): Omit<T, K> {
  const result = { ...obj };
  for (const field of fields) {
    delete result[field];
  }
  return result;
}

/**
 * Select specified keys from an object
 */
export function pickFields<T extends object, K extends keyof T>(
  obj: T,
  fields: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const field of fields) {
    if (field in obj) {
      result[field] = obj[field];
    }
  }
  return result;
}

/**
 * Delay execution for a number of milliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry an asynchronous function with backoff
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    await delay(delayMs);
    return retryAsync(fn, retries - 1, delayMs * 2);
  }
}
