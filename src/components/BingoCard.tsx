import React, { useRef, useEffect } from 'react';
import { useBingoStore } from '../store/bingoStore';

interface BingoCardProps {
  cardId: string;
  miniature?: boolean;
}

const BingoCard: React.FC<BingoCardProps> = ({ cardId, miniature = false }) => {
  const { bingoCards, drawnNumbers, toggleCardMark, toggleCardExpanded, updateCardPosition } = useBingoStore();

  // Refs for drag functionality - defined before any conditional returns
  const cardRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Find the card in the store
  const card = bingoCards.find(c => c.id === cardId);

  // Handle drag - useEffect is always called
  useEffect(() => {
    // Define handlers
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || miniature) return;

      // Calculate a new position
      const x = e.clientX - dragOffset.current.x;
      const y = e.clientY - dragOffset.current.y;

      // Update card position
      updateCardPosition(cardId, { x, y });
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    // Touch events for mobile
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current || miniature || e.touches.length !== 1) return;

      const touch = e.touches[0];

      // Calculate a new position
      const x = touch.clientX - dragOffset.current.x;
      const y = touch.clientY - dragOffset.current.y;

      // Update card position
      updateCardPosition(cardId, { x, y });

      // Prevent scrolling while dragging
      e.preventDefault();
    };

    const handleTouchEnd = () => {
      isDragging.current = false;
    };

    // Add event listeners (always add them, but handlers will check conditions)
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [cardId, miniature, updateCardPosition]);

  // Handle click outside to close the expanded card - useEffect is always called
  useEffect(() => {
    // Define handler
    const handleClickOutside = (e: MouseEvent) => {
      // Only close on outside click for manually-expanded cards. Auto-open
      // cards are meant to stay visible, so they ignore outside clicks.
      if (!miniature && !card?.autoOpen && card?.isExpanded && cardRef.current && !cardRef.current.contains(e.target as Node)) {
        toggleCardExpanded(cardId);
      }
    };

    // Always add the event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Always return the same cleanup function
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [cardId, card?.isExpanded, card?.autoOpen, miniature, toggleCardExpanded]);

  // If the card doesn't exist, return null
  if (!card) return null;

  // A card is shown in its expanded form when the user manually opened it or
  // when auto-open is enabled for that card.
  const isOpen = card.isExpanded || card.autoOpen;

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    // In miniature view, let the click bubble up to the card container's
    // onClick (handleCardClick) so the card expands with a single toggle.
    // Toggling here as well would fire the toggle twice and reopen/close it.
    if (miniature) {
      return;
    }

    // Don't mark the free space (center cell)
    if (row === 2 && col === 2) return;

    // Get the cell number
    const cellNumber = card.cells[row][col].number;

    // Only allow marking if the number has been drawn
    if (drawnNumbers.includes(cellNumber)) {
      toggleCardMark(cardId, row, col);
    }
  };

  // Handle card click in miniature view
  const handleCardClick = () => {
    if (miniature) {
      // If the card doesn't have a position yet, set an initial position
      if (!card.position) {
        // Calculate a position in the center of the screen
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const x = (windowWidth / 2) - 150; // Assuming card width ~300px
        const y = (windowHeight / 2) - 150; // Assuming card height ~300px

        // Update the card position
        updateCardPosition(cardId, { x, y });
      }

      toggleCardExpanded(cardId);
    }
  };

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (miniature || !isOpen) return;

    isDragging.current = true;

    // Calculate offset from the top-left corner of the card
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }

    // Prevent text selection during drag
    e.preventDefault();
  };

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    if (miniature || !isOpen || e.touches.length !== 1) return;

    isDragging.current = true;

    // Calculate offset from the top-left corner of the card
    const rect = cardRef.current?.getBoundingClientRect();
    const touch = e.touches[0];

    if (rect) {
      dragOffset.current = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    }
  };

  // Determine card size and position classes
  const cardClasses = miniature
    ? `${card.color} border-2 rounded-md shadow-sm cursor-pointer w-12 h-12 overflow-hidden`
    : `${card.color} border-4 rounded-lg shadow-lg absolute z-50 cursor-move`;

  // Position the expanded card
  const cardStyle = !miniature && isOpen && card.position
    ? { top: `${card.position.y}px`, left: `${card.position.x}px` }
    : {};

  // Determine cell size classes
  const cellClasses = miniature
    ? 'w-2 h-2 text-[6px] flex items-center justify-center'
    : 'w-10 h-10 md:w-12 md:h-12 text-sm md:text-base flex items-center justify-center cursor-pointer';

  // Determine if the card should be shown
  const showCard = miniature || isOpen;

  if (!showCard) return null;

  return (
    <div
      ref={cardRef}
      className={cardClasses}
      style={cardStyle}
      onClick={handleCardClick}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Card header with close button */}
      {!miniature && isOpen && (
        <div className="flex justify-between items-center p-1 bg-white bg-opacity-80">
          <span className="text-xs font-bold">ビンゴカード</span>
          {card.autoOpen ? (
            // Auto-open cards can't be closed with × (they'd just reappear).
            // Show a badge instead so the state is clear.
            <span className="text-[10px] font-bold text-green-600" title="自動で開く設定がオンです">
              自動
            </span>
          ) : (
            <button
              className="text-xs bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                toggleCardExpanded(cardId);
              }}
            >
              ×
            </button>
          )}
        </div>
      )}

      {/* Bingo card grid */}
      <div className={`grid grid-cols-5 gap-0.5 ${miniature ? 'p-0.5' : 'p-2'}`}>
        {/* Header row with B-I-N-G-O letters */}
        {!miniature && (
          <>
            <div className="col-span-5 grid grid-cols-5 mb-1">
              {['B', 'I', 'N', 'G', 'O'].map((letter) => (
                <div key={letter} className="text-center font-bold">
                  {letter}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Card cells */}
        {card.cells.map((row, rowIndex) => (
          <React.Fragment key={`row-${rowIndex}`}>
            {row.map((cell, colIndex) => {
              // Determine if this is the free space (center)
              const isFreeSpace = rowIndex === 2 && colIndex === 2;

              // Determine cell appearance based on state
              let cellBgClass = 'bg-white';
              if (cell.marked) {
                cellBgClass = 'bg-orange-400 text-white';
              }

              return (
                <div
                  key={`cell-${rowIndex}-${colIndex}`}
                  className={`${cellClasses} ${cellBgClass} rounded-sm ${isFreeSpace ? 'bg-blue-200' : ''}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {!miniature && isFreeSpace ? 'FREE' : cell.number > 0 ? cell.number : ''}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Bingo/Reach indicators */}
      {!miniature && isOpen && (
        <div className="absolute top-0 left-0 right-0 flex justify-center">
          {card.hasBingo && (
            <div className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-b-lg animate-pulse">
              BINGO!
            </div>
          )}
          {card.hasReach && !card.hasBingo && (
            <div className="bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-b-lg">
              リーチ!
            </div>
          )}
        </div>
      )}

      {/* Miniature indicators */}
      {miniature && (
        <>
          {card.hasBingo && (
            <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></div>
          )}
          {card.hasReach && !card.hasBingo && (
            <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-500 rounded-full"></div>
          )}
        </>
      )}
    </div>
  );
};

export default BingoCard;
