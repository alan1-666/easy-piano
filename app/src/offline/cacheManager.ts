/**
 * CacheManager handles local caching of song data,
 * course content, and user progress for offline use.
 */
export class CacheManager {
  /**
   * Cache song data locally for offline play.
   */
  async cacheSong(_songId: number, _data: unknown): Promise<void> {
    // TODO: store song data in MMKV or file system
  }

  /**
   * Retrieve cached song data.
   */
  async getCachedSong(_songId: number): Promise<unknown | null> {
    // TODO: read from MMKV or file system
    return null;
  }

  /**
   * Check if a song is cached locally.
   */
  isSongCached(_songId: number): boolean {
    // TODO: check MMKV
    return false;
  }

  /**
   * Clear all cached data.
   */
  async clearAll(): Promise<void> {
    // TODO: clear MMKV cache
  }

  /**
   * Get total cache size in bytes.
   */
  getCacheSize(): number {
    // TODO: calculate total size
    return 0;
  }
}
