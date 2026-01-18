import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Token } from '../types/session';

const WPM_STEP = 25;
const SEEK_STEP = 5;
const MIN_WPM = 100;
const MAX_WPM = 2000;

interface ReaderOverlayProps {
  tokens: Token[];
  initialWpm: number;
  onExit: () => void;
}

// Icons as React components
const PlayIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 3l14 9-14 9V3z"/>
  </svg>
);

const PauseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16"/>
    <rect x="14" y="4" width="4" height="16"/>
  </svg>
);

const XIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const SettingsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

const ReaderOverlay: React.FC<ReaderOverlayProps> = ({ tokens, initialWpm, onExit }) => {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [wpm, setWpm] = useState(initialWpm);
  const [showSettings, setShowSettings] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Calculate delay for the current token
  const getDelay = useCallback(() => {
    if (!tokens[index]) return 0;
    // Recalculate duration based on current WPM
    const baseMs = 60000 / wpm;
    return baseMs * tokens[index].multiplier;
  }, [index, wpm, tokens]);

  // Playback loop
  useEffect(() => {
    if (isPlaying && index < tokens.length) {
      const delay = getDelay();
      timerRef.current = window.setTimeout(() => {
        setIndex((prev) => prev + 1);
      }, delay);
    } else if (index >= tokens.length) {
      setIsPlaying(false); // End of text
    }
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPlaying, index, tokens.length, getDelay]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow escape to work even if settings are open (closes settings first)
      if (e.key === 'Escape') {
        if (showSettings) {
          setShowSettings(false);
        } else {
          onExit();
        }
        return;
      }

      // Ignore other keys if settings are open
      if (showSettings) return;

      // Prevent default scrolling for Space/Arrows
      if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case ' ': // Toggle Play/Pause
          setIsPlaying((p) => !p);
          break;
        case 'ArrowUp': // Speed Up
          setWpm((w) => Math.min(w + WPM_STEP, MAX_WPM));
          break;
        case 'ArrowDown': // Speed Down
          setWpm((w) => Math.max(w - WPM_STEP, MIN_WPM));
          break;
        case 'ArrowLeft': // Rewind
          setIndex((i) => Math.max(0, i - SEEK_STEP));
          break;
        case 'ArrowRight': // Fast Forward
          setIndex((i) => Math.min(tokens.length - 1, i + SEEK_STEP));
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit, tokens.length, showSettings]);

  const currentToken = tokens[index] || tokens[tokens.length - 1];
  const progress = Math.min(100, ((index + 1) / tokens.length) * 100);

  // Alignment Logic: Split word to center the anchor character
  const leftText = currentToken ? currentToken.text.slice(0, currentToken.anchorIndex) : '';
  const anchorChar = currentToken ? currentToken.text[currentToken.anchorIndex] : '';
  const rightText = currentToken ? currentToken.text.slice(currentToken.anchorIndex + 1) : '';

  return (
    <div className="rsvp-overlay">
      {/* Top HUD: Stats */}
      <div className="rsvp-hud">
        <div className="rsvp-stats">
          <div className="rsvp-stat-row">
            <span className="rsvp-label">WPM</span>
            <span className="rsvp-value">{wpm}</span>
          </div>
          <div className="rsvp-progress-text">
            {index + 1} / {tokens.length} words
          </div>
          <div className="rsvp-status">
            {isPlaying ? 'Reading' : 'Paused'}
          </div>
        </div>
      </div>

      {/* Top Right Controls */}
      <div className="rsvp-controls-top">
        <button
          onClick={() => {
            setIsPlaying(false);
            setShowSettings(!showSettings);
          }}
          className={`rsvp-btn-icon ${showSettings ? 'rsvp-btn-active' : ''}`}
          title="Settings"
        >
          <SettingsIcon />
        </button>
        <button
          onClick={onExit}
          className="rsvp-btn-icon"
          title="Close"
        >
          <XIcon />
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="rsvp-settings">
          <h3 className="rsvp-settings-title">Reader Settings</h3>
          
          <div className="rsvp-settings-section">
            <label className="rsvp-settings-label">
              <span>Speed (WPM)</span>
              <span className="rsvp-settings-value">{wpm}</span>
            </label>
            <input
              type="range"
              min={MIN_WPM}
              max={MAX_WPM}
              step={WPM_STEP}
              value={wpm}
              onChange={(e) => setWpm(parseInt(e.target.value))}
              className="rsvp-slider"
            />
            <div className="rsvp-slider-labels">
              <span>Slow</span>
              <span>Fast</span>
            </div>
          </div>

          <div className="rsvp-settings-help">
            <p><span className="rsvp-key">Space</span> to Play/Pause</p>
            <p><span className="rsvp-key">Arrows</span> to Adjust/Seek</p>
            <p><span className="rsvp-key">Esc</span> to Close</p>
          </div>
        </div>
      )}

      {/* Main Display Area */}
      <div className="rsvp-display">
        {/* The Word */}
        <div className="rsvp-word-container">
          {/* Left Side: Aligns Right, pushes towards center */}
          <div className="rsvp-word-left">
            {leftText}
          </div>
          
          {/* Anchor Char: Fixed width to ensure true center */}
          <div className="rsvp-word-anchor">
            {anchorChar}
          </div>
          
          {/* Right Side: Aligns Left */}
          <div className="rsvp-word-right">
            {rightText}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="rsvp-progress-bar-container">
        <div
          className="rsvp-progress-bar"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Bottom Controls (Mobile/Mouse) */}
      <div className="rsvp-controls-bottom">
        <button
          onClick={() => setIndex(Math.max(0, index - SEEK_STEP))}
          className="rsvp-btn-seek"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="rsvp-icon-rotate">
            <path d="M5 3l14 9-14 9V3z"/>
          </svg>
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="rsvp-btn-play"
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>

        <button
          onClick={() => setIndex(Math.min(tokens.length - 1, index + SEEK_STEP))}
          className="rsvp-btn-seek"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 3l14 9-14 9V3z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ReaderOverlay;
