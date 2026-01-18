export interface Token {
  text: string;
  anchorIndex: number;
  baseDurationMs: number;
  durationMs: number;
  isSentenceEnd: boolean;
  isClauseBreak: boolean;
  multiplier: number;
}

export interface Session {
  sessionId: string;
  sourceUrl: string;
  createdAt: number;
  rawText: string;
  tokens: Token[];
  currentIndex: number;
  wpm: number;
  isPlaying: boolean;
}
