import { useEffect, useMemo, useState } from 'react';

const matrix = {
  D: ['11110', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '11110', '10000', '11111'],
};
const percentageMatrix = {
  '0': ['01110', '10001', '10001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00010', '00100', '11111'],
  '3': ['11110', '00001', '01110', '00001', '11110'],
  '4': ['10010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '11110'],
  '6': ['01110', '10000', '11110', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '00100'],
  '8': ['01110', '10001', '01110', '10001', '01110'],
  '9': ['01110', '10001', '01111', '00001', '01110'],
  '%': ['11001', '11010', '00100', '01011', '10011'],
};
const loadingLabel = "INITIALIZING DEE'S PORTFOLIO";

const makeWord = (word) => {
  const letters = word.split('');

  return Array.from({ length: 5 }, (_, rowIndex) => letters.flatMap((letter, letterIndex) => (
    matrix[letter][rowIndex].split('').map((value, columnIndex) => ({
      active: value === '1',
      key: `${letterIndex}-${rowIndex}-${columnIndex}`,
      delay: `${(letterIndex * 0.13) + (rowIndex * 0.045) + (columnIndex * 0.018)}s`,
    }))
  ))).flat();
};

const makePercentage = (progress) => String(progress).concat('%').split('').map((character, characterIndex) => ({
  character,
  characterIndex,
  rows: percentageMatrix[character],
}));

export default function LoadingScreen({ progress = 0 }) {
  const [typedLabel, setTypedLabel] = useState('');
  const logoDots = useMemo(() => makeWord('DEE'), []);

  useEffect(() => {
    let characterIndex = 0;

    const intervalId = window.setInterval(() => {
      characterIndex += 1;
      setTypedLabel(loadingLabel.slice(0, characterIndex));

      if (characterIndex >= loadingLabel.length) {
        window.clearInterval(intervalId);
      }
    }, 48);

    return () => window.clearInterval(intervalId);
  }, []);

  const safeProgress = Math.max(0, Math.min(100, Math.round(progress)));
  const percentage = makePercentage(safeProgress);

  return (
    <div
      className="loading-screen"
      role="status"
      aria-live="polite"
      aria-label={`${loadingLabel} ${safeProgress}%`}
    >
      <p className="loading-screen__status">
        {typedLabel}
        <span className="loading-screen__caret" aria-hidden="true">▌</span>
      </p>

      <div className="loading-screen__wordmark" aria-hidden="true">
        {logoDots.map((dot) => (
          <span
            key={dot.key}
            className={`loading-screen__dot ${dot.active ? 'is-active' : ''}`}
            style={{ '--dot-delay': dot.delay }}
          />
        ))}
        <span className="loading-screen__wordmark-caption">DEE / AI SYSTEMS</span>
      </div>

      <div className="loading-screen__signal" aria-hidden="true">
        {Array.from({ length: 13 }, (_, index) => (
          <span key={index} className={`loading-screen__signal-dot signal-dot-${index + 1}`} />
        ))}
      </div>

      <div className="loading-screen__readout" aria-live="polite">
        <span className="loading-screen__readout-label">PORTFOLIO LOAD</span>
        <span className="loading-screen__percentage" role="img" aria-label={`${safeProgress}% loaded`}>
          {percentage.map(({ character, characterIndex, rows }) => (
            <span key={`${character}-${characterIndex}`} className="loading-screen__percentage-glyph" aria-hidden="true">
              {rows.flatMap((row, rowIndex) => row.split('').map((value, columnIndex) => (
                <span
                  key={`${characterIndex}-${rowIndex}-${columnIndex}`}
                  className={`loading-screen__percentage-dot${value === '1' ? ' is-active' : ''}`}
                  style={{ '--percentage-delay': `${(characterIndex * 0.2) + (rowIndex * 0.06) + (columnIndex * 0.018)}s` }}
                />
              )))}
            </span>
          ))}
        </span>
      </div>

      <div className="loading-screen__progress-wrap">
        <div className="loading-screen__progress" aria-hidden="true">
          <span style={{ width: `${safeProgress}%` }} />
        </div>
      </div>
    </div>
  );
}
