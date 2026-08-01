import React from 'react';

interface RecentNumbersProps {
  numbers: number[];
  count?: number;
}

// Show the most recently drawn numbers in a horizontal row, newest first.
// This makes it easy to answer "1つ前の番号は何だっけ？" at a glance.
const RecentNumbers: React.FC<RecentNumbersProps> = ({ numbers, count = 6 }) => {
  // Take the last `count` numbers and reverse so newest is on the left.
  const recent = numbers.slice(-count).reverse();

  return (
    <div className="mb-3">
      <h3 className="text-base font-bold mb-1 text-blue-600 md:text-lg">
        直近の番号
      </h3>

      {recent.length === 0 ? (
        <p className="text-gray-500 text-xs md:text-sm">
          まだ番号が出ていません。
        </p>
      ) : (
        <div className="flex items-end gap-2 overflow-x-auto pb-1">
          {recent.map((num, index) => {
            const isLatest = index === 0;
            return (
              <div key={num} className="flex flex-col items-center flex-shrink-0">
                <span className="text-[10px] md:text-xs text-gray-500 mb-0.5 h-3">
                  {isLatest ? '最新' : index === 1 ? '1つ前' : `${index}つ前`}
                </span>
                <div
                  className={`recent-number-item ${
                    isLatest ? 'recent-number-latest animate-pop' : ''
                  }`}
                  aria-label={`${
                    isLatest ? '最新の番号' : `${index}つ前の番号`
                  } ${num}`}
                >
                  {num}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentNumbers;
