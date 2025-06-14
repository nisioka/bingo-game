import React from 'react';

interface NumberDisplayProps {
  number: number | null;
  animating: boolean;
}

const NumberDisplay: React.FC<NumberDisplayProps> = ({ number, animating }) => {
  return (
    <div className="flex justify-center">
      <div 
        className={`number-display ${animating ? 'animate-pop' : ''}`}
        aria-live="polite"
        aria-atomic="true"
      >
        {number !== null ? (
          <span className="text-center">
            {number}
          </span>
        ) : (
          <span className="text-gray-400">?</span>
        )}
      </div>
    </div>
  );
};

export default NumberDisplay;