import React from 'react';
import { useBingoStore } from '../store/bingoStore';
import BingoCard from './BingoCard';

const CardSidebar: React.FC = () => {
  const { bingoCards, cardCount, toggleCardAutoMark } = useBingoStore();

  // If no cards, don't render the sidebar
  if (cardCount === 0) return null;

  return (
    <div className="fixed top-1/2 transform -translate-y-1/2 right-2 z-40 flex flex-col space-y-3">
      {bingoCards.map(card => (
        <div key={card.id} className="relative flex flex-col items-center">
          <BingoCard cardId={card.id} miniature={true} />
          {/* Per-card auto-mark toggle */}
          <button
            onClick={() => toggleCardAutoMark(card.id)}
            className={`mt-0.5 text-[9px] leading-none px-1 py-0.5 rounded font-bold border
              ${card.autoMark
                ? 'bg-green-500 text-white border-green-600'
                : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-100'}`}
            aria-pressed={card.autoMark}
            aria-label={card.autoMark ? 'このカードの自動マークをオフにする' : 'このカードの数字を自動でマークする'}
            title={card.autoMark ? '自動マーク: オン' : '自動マーク: オフ'}
          >
            自動
          </button>
        </div>
      ))}
    </div>
  );
};

export default CardSidebar;