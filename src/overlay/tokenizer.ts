import type { Token } from '../types/session';
import { getAnchorIndex, clampAnchorIndex } from './anchor';

const DEFAULT_WPM = 450;

/**
 * Tokenize text into RSVP tokens with timing multipliers.
 * 
 * @param text - Raw text to tokenize
 * @param wpm - Words per minute for base timing calculation
 * @returns Array of Token objects
 */
export function tokenizeText(text: string, wpm: number = DEFAULT_WPM): Token[] {
  // Normalize whitespace: tabs, newlines, multiple spaces → single space
  const normalized = text.trim().replace(/\s+/g, ' ');
  
  // Split by whitespace but preserve punctuation attached to words
  const rawTokens = normalized.split(/\s+/).filter(t => t.length > 0);
  
  const baseMs = 60000 / wpm;
  
  return rawTokens.map((tokenText) => {
    const lastChar = tokenText.slice(-1);
    const isSentenceEnd = ['.', '!', '?'].includes(lastChar);
    const isClauseBreak = [',', ';', ':'].includes(lastChar);
    
    // Calculate timing multiplier based on linguistic features
    let multiplier = 1.0;
    
    // Length penalty: longer words take slightly longer
    if (tokenText.length > 12) {
      multiplier += 0.3;
    } else if (tokenText.length > 7) {
      multiplier += 0.2;
    }
    
    // Punctuation delays
    if (isSentenceEnd) {
      multiplier += 1.0; // +100% time for sentence endings
    } else if (isClauseBreak) {
      multiplier += 0.4; // +40% time for clause breaks
    }
    
    const anchorIndex = clampAnchorIndex(tokenText, getAnchorIndex(tokenText));
    const durationMs = baseMs * multiplier;
    
    return {
      text: tokenText,
      anchorIndex,
      baseDurationMs: baseMs,
      durationMs,
      isSentenceEnd,
      isClauseBreak,
      multiplier,
    };
  });
}
