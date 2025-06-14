import React from 'react';
import { useBingoStore } from '../store/bingoStore';

const CardSelector: React.FC = () => {
  const { cardCount, setCardCount } = useBingoStore();

  // Array of possible card counts
  const cardOptions = [0, 1, 2, 3, 4, 5];

  return (
    <div className="mb-2">
      <div className="block text-sm font-medium mb-1">
        ビンゴカード枚数:
      </div>
      <div className="flex space-x-2">
        {cardOptions.map(count => (
          <button
            key={count}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
              ${cardCount === count 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            onClick={() => setCardCount(count)}
            aria-label={`${count}枚のカードを選択`}
          >
            {count}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {cardCount === 0 
          ? 'カードなしでプレイします' 
          : `${cardCount}枚のカードでプレイします`}
      </p>
    </div>
  );
};

export default CardSelector;
