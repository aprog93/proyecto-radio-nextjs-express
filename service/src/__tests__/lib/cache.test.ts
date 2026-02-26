/**
 * Cache tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cache } from '@/lib/cache';

describe('Cache', () => {
  beforeEach(() => {
    cache.clear();
  });

  it('should set and get values', () => {
    cache.set('key', 'value');
    expect(cache.get('key')).toBe('value');
  });

  it('should return null for missing keys', () => {
    expect(cache.get('missing')).toBeNull();
  });

  it('should expire entries after TTL', async () => {
    cache.set('key', 'value', 0.01); // 10ms
    expect(cache.get('key')).toBe('value');

    await new Promise(resolve => setTimeout(resolve, 20));
    expect(cache.get('key')).toBeNull();
  });

  it('should clear all entries', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.clear();

    expect(cache.get('key1')).toBeNull();
    expect(cache.get('key2')).toBeNull();
  });

  it('should clear specific entry', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.clear('key1');

    expect(cache.get('key1')).toBeNull();
    expect(cache.get('key2')).toBe('value2');
  });
});
