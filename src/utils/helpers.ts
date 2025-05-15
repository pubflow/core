/**
 * Helper Utilities
 *
 * Common utility functions used throughout the framework
 */

/**
 * Deep merge two objects
 *
 * @param target Target object
 * @param source Source object
 * @returns Merged object
 */
export function deepMerge<T extends object = object, U extends object = T>(target: T, source: U): T & U {
  const output = { ...target } as T & U;

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      const sourceKey = key as keyof U;
      const targetKey = key as keyof T;

      if (isObject(source[sourceKey]) && key in target) {
        output[sourceKey] = deepMerge(
          target[targetKey] as object,
          source[sourceKey] as object
        ) as any;
      } else {
        // Type assertion to ensure compatibility
        output[sourceKey] = source[sourceKey] as any;
      }
    });
  }

  return output;
}

/**
 * Check if a value is an object
 *
 * @param item Value to check
 * @returns Whether the value is an object
 */
export function isObject(item: any): item is object {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Format an error message
 *
 * @param error Error object or string
 * @returns Formatted error message
 */
export function formatError(error: any): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === 'object') {
    if (error.message) {
      return error.message;
    }

    if (error.error) {
      return error.error;
    }
  }

  return 'An unknown error occurred';
}

/**
 * Debounce a function
 *
 * @param func Function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle a function
 *
 * @param func Function to throttle
 * @param limit Limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastFunc: ReturnType<typeof setTimeout>;
  let lastRan: number;

  return function(...args: Parameters<T>): void {
    if (!inThrottle) {
      func(...args);
      lastRan = Date.now();
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

/**
 * Generate a random string
 *
 * @param length Length of the string
 * @returns Random string
 */
export function randomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

/**
 * Parse a JSON string safely
 *
 * @param json JSON string
 * @param fallback Fallback value if parsing fails
 * @returns Parsed JSON or fallback
 */
export function safeJsonParse<T>(json: string | null, fallback: T): T {
  if (!json) {
    return fallback;
  }

  try {
    return JSON.parse(json) as T;
  } catch (error) {
    return fallback;
  }
}
