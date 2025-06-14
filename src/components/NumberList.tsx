import React from 'react';

interface NumberListProps {
  numbers: number[];
  maxNumber: number;
}

const NumberList: React.FC<NumberListProps> = ({ numbers, maxNumber }) => {
  // Create an array of all possible numbers
  const allNumbers = Array.from({ length: maxNumber }, (_, i) => i + 1);

  return (
    <div className="h-full">
      <h3 className="text-base font-bold mb-1 text-blue-600 md:text-lg">出た番号</h3>

      <div className="number-list md:grid-cols-12 lg:grid-cols-15">
        {allNumbers.map((num) => {
          const isDrawn = numbers.includes(num);
          const isLatest = numbers.length > 0 && numbers[numbers.length - 1] === num;

          return (
            <div 
              key={num}
              className={`number-item ${isDrawn ? 'active' : ''} ${isLatest ? 'animate-pop' : ''}`}
              aria-label={`番号 ${num} ${isDrawn ? '出ました' : ''}`}
            >
              {num}
            </div>
          );
        })}
      </div>

      {numbers.length === 0 && (
        <p className="text-center text-gray-500 mt-1 text-xs md:text-sm">
          まだ番号が出ていません。「番号を引く」ボタンを押してください。
        </p>
      )}
    </div>
  );
};

export default NumberList;
