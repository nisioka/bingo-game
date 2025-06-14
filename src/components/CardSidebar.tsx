import React from 'react';
import { useBingoStore } from '../store/bingoStore';
import BingoCard from './BingoCard';

const CardSidebar: React.FC = () => {
  const { bingoCards, cardCount } = useBingoStore();
  
  // If no cards, don't render the sidebar
  if (cardCount === 0) return null;
  
  return (
    <div className="fixed top-1/2 transform -translate-y-1/2 right-2 z-40 flex flex-col space-y-2">
      {bingoCards.map(card => (
        <div key={card.id} className="relative">
          <BingoCard cardId={card.id} miniature={true} />
        </div>
      ))}
    </div>
  );
};

export default CardSidebar;