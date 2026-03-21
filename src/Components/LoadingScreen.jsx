import { useEffect, useState } from 'react';

const loadingLetters = 'Loading'.split('');

export default function LoadingScreen() {
  const [dots, setDots] = useState('.');

  useEffect(() => {
    const frames = ['.', '..', '...'];
    let frameIndex = 0;

    const intervalId = window.setInterval(() => {
      frameIndex = (frameIndex + 1) % frames.length;
      setDots(frames[frameIndex]);
    }, 320);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="loading-screen" role="status" aria-live="polite" aria-label="Loading content">
      <div className="loading-screen__glow loading-screen__glow--left" />
      <div className="loading-screen__glow loading-screen__glow--right" />

      <div className="loading-screen__panel">
        <div className="loading-screen__halo" aria-hidden="true">
          <span className="loading-screen__ring loading-screen__ring--outer" />
          <span className="loading-screen__ring loading-screen__ring--middle" />
          <span className="loading-screen__ring loading-screen__ring--inner" />
          <span className="loading-screen__core" />
        </div>

        <p className="loading-screen__kicker">Spinning things up</p>

        <div className="loading-screen__wordmark" aria-hidden="true">
          {loadingLetters.map((letter, index) => (
            <span
              key={`${letter}-${index}`}
              className="loading-screen__letter"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              {letter}
            </span>
          ))}
          <span className="loading-screen__dots">{dots}</span>
        </div>

        <p className="loading-screen__message">Pulling in the good stuff for this page.</p>
      </div>
    </div>
  );
}
