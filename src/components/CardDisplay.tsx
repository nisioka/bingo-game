import React from 'react';
import { useBingoStore } from '../store/bingoStore';
import BingoCard from './BingoCard';

const CardDisplay: React.FC = () => {
  const { bingoCards } = useBingoStore();

  // Filter for expanded cards
  const expandedCards = bingoCards.filter(card => card.isExpanded);

  // If no expanded cards, don't render anything
  if (expandedCards.length === 0) return null;

  return (
    <div className="fixed inset-0 z-30 pointer-events-none">
      <div className="pointer-events-auto">
        {expandedCards.map(card => (
          <BingoCard key={card.id} cardId={card.id} miniature={false} />
        ))}
      </div>
    </div>
  );
};

export default CardDisplay;
