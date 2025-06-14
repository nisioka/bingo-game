import React, { useEffect, useState } from 'react';
import { useBingoStore } from '../store/bingoStore';

const BingoConfetti: React.FC = () => {
  const { bingoCards } = useBingoStore();
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState<JSX.Element[]>([]);

  // Check if any card has bingo
  const hasBingo = bingoCards.some(card => card.hasBingo);

  // Generate confetti pieces
  useEffect(() => {
    if (hasBingo && !showConfetti) {
      // Generate random confetti pieces
      const pieces: JSX.Element[] = [];
      const colors = ['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500', 'bg-purple-500'];

      for (let i = 0; i < 50; i++) {
        const left = Math.random() * 100;
        const animationDelay = Math.random() * 2;
        const animationDuration = 1 + Math.random() * 2;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = 5 + Math.random() * 10;

        pieces.push(
          <div
            key={i}
            className={`absolute ${color} rounded-full`}
            style={{
              left: `${left}%`,
              top: '-20px',
              width: `${size}px`,
              height: `${size}px`,
              animation: `confetti ${animationDuration}s ease-in ${animationDelay}s forwards`
            }}
          />
        );
      }

      setConfettiPieces(pieces);
      setShowConfetti(true);

      // Hide confetti after 3 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [hasBingo, showConfetti]);

  // If no bingo or confetti should be shown, return null
  if (!hasBingo || !showConfetti) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confettiPieces}
    </div>
  );
};

export default BingoConfetti;
