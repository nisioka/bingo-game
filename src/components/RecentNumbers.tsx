import React from 'react';

interface RecentNumbersProps {
  numbers: number[];
  count?: number;
}

// Show the most recently drawn numbers in a compact horizontal row, newest
// first, so "1つ前の番号は何だっけ？" can be answered at a glance without
// taking up much vertical space (important on landscape phones).
const RecentNumbers: React.FC<RecentNumbersProps> = ({ numbers, count = 8 }) => {
  // Take the last `count` numbers and reverse so newest is on the left.
  // Guard against count <= 0 (slice(-0) === slice(0) would return everything).
  const recent = count > 0 ? numbers.slice(-count).reverse() : [];

  if (recent.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mb-2">
      <span className="text-xs md:text-sm font-bold text-blue-600 flex-shrink-0">
        直近:
      </span>
      <ul className="flex items-center flex-wrap gap-1 list-none m-0 p-0">
        {recent.map((num, index) => (
          <li
            key={num}
            className={`recent-number-item ${
              index === 0 ? 'recent-number-latest' : ''
            }`}
            aria-label={
              index === 0 ? `最新の番号 ${num}` : `${index}つ前の番号 ${num}`
            }
          >
            {num}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentNumbers;
