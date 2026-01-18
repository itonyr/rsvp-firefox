import type { Token } from '../types/session';

/**
 * Calculate the anchor index (ORP approximation) for a word.
 * The anchor character is the one that should align under the red dot.
 * 
 * @param word - The word to calculate anchor for
 * @returns The character index (0-based) that should be the anchor point
 */
export function getAnchorIndex(word: string): number {
  const len = word.length;
  
  if (len === 1) return 0;
  if (len >= 2 && len <= 5) return 1;
  if (len >= 6 && len <= 9) return 2;
  if (len >= 10 && len <= 13) return 3;
  
  // 14+ characters
  return 4;
}

/**
 * Clamp anchor index to valid range for a word.
 * 
 * @param word - The word
 * @param index - The proposed anchor index
 * @returns Clamped index in range [0, wordLength - 1]
 */
export function clampAnchorIndex(word: string, index: number): number {
  return Math.min(Math.max(0, index), word.length - 1);
}
