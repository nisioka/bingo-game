import React from 'react';

interface NumberDisplayProps {
  number: number | null;
  animating: boolean;
}

const NumberDisplay: React.FC<NumberDisplayProps> = ({ number, animating }) => {
  return (
    <div className="flex justify-center my-1 md:my-3">
      <div 
        className={`number-display ${animating ? 'animate-pop' : ''} md:w-full md:max-w-[200px]`}
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
