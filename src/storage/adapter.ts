/**
 * Storage Adapter Interface
 *
 * Defines the interface for storage adapters used by Pubflow
 */

/**
 * Interface for storage adapters
 */
export interface StorageAdapter {
  /**
   * Get a value from storage
   *
   * @param key The key to retrieve
   * @returns The stored value, or null if not found
   */
  getItem(key: string): Promise<string | null>;

  /**
   * Save a value to storage
   *
   * @param key The key to store under
   * @param value The value to store
   */
  setItem(key: string, value: string): Promise<void>;

  /**
   * Remove a value from storage
   *
   * @param key The key to remove
   */
  removeItem(key: string): Promise<void>;
}

/**
 * Memory storage adapter for testing or environments without persistent storage
 */
export class MemoryStorageAdapter implements StorageAdapter {
  private storage: Map<string, string> = new Map();

  /**
   * Get a value from memory storage
   *
   * @param key The key to retrieve
   * @returns The stored value, or null if not found
   */
  async getItem(key: string): Promise<string | null> {
    return this.storage.get(key) || null;
  }

  /**
   * Save a value to memory storage
   *
   * @param key The key to store under
   * @param value The value to store
   */
  async setItem(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  }

  /**
   * Remove a value from memory storage
   *
   * @param key The key to remove
   */
  async removeItem(key: string): Promise<void> {
    this.storage.delete(key);
  }

  /**
   * Clear all values from memory storage
   */
  async clear(): Promise<void> {
    this.storage.clear();
  }
}

/**
 * Create a storage key with prefix and instance ID
 *
 * @param baseKey The base key
 * @param prefix Optional prefix
 * @param instanceId Optional instance ID
 * @returns The prefixed storage key
 */
export function createStorageKey(baseKey: string, prefix?: string, instanceId?: string): string {
  const parts: string[] = [];

  if (prefix) {
    // Check if baseKey already starts with the prefix to prevent duplication
    if (!baseKey.startsWith(`${prefix}_`)) {
      parts.push(prefix);
    }
  }

  if (instanceId && instanceId !== 'default') {
    // Check if baseKey already contains the instance ID to prevent duplication
    if (!baseKey.includes(`${instanceId}_`)) {
      parts.push(instanceId);
    }
  }

  parts.push(baseKey);

  const result = parts.join('_');

  // Log para depuración solo si está en modo de desarrollo y no es una clave común
  if (process.env.NODE_ENV === 'development' &&
      !['session_id', 'user_data'].includes(baseKey) &&
      Math.random() < 0.01) { // Solo log 1% de las veces para reducir ruido
    console.log(`createStorageKey: baseKey=${baseKey}, prefix=${prefix}, result=${result}`);
  }

  return result;
}
