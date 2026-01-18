import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import ReaderOverlay from './ReaderOverlay';
import type { Token } from '../types/session';

interface AppProps {
  tokens: Token[];
  initialWpm: number;
  onExit: () => void;
}

function App({ tokens, initialWpm, onExit }: AppProps) {
  return <ReaderOverlay tokens={tokens} initialWpm={initialWpm} onExit={onExit} />;
}

// Mount function for content script
export function mountOverlay(rootElement: HTMLElement, tokens: Token[], initialWpm: number) {
  const root = createRoot(rootElement);
  
  const handleExit = () => {
    root.unmount();
    if ((window as any).rsvpExit) {
      (window as any).rsvpExit();
    }
  };
  
  root.render(<App tokens={tokens} initialWpm={initialWpm} onExit={handleExit} />);
}

export default App;
