import React, { useState } from 'react';
import { useBingoStore } from '../store/bingoStore';
import NumberDisplay from './NumberDisplay';
import NumberList from './NumberList';

const BingoGame: React.FC = () => {
  const { 
    currentNumber, 
    drawnNumbers, 
    isDrawing, 
    maxNumber,
    drawNumber, 
    resetGame,
    setMaxNumber
  } = useBingoStore();

  const [animating, setAnimating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempMaxNumber, setTempMaxNumber] = useState(maxNumber);

  // Handle number drawing with animation
  const handleDrawNumber = async () => {
    if (isDrawing || animating) return;

    setAnimating(true);

    // Simple animation effect - show random numbers quickly before settling on the actual number
    const animationDuration = 1500; // 1.5 seconds
    const interval = 100; // Change number every 100ms
    const startTime = Date.now();

    const animationInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;

      if (elapsed >= animationDuration) {
        clearInterval(animationInterval);
        drawNumber().then(() => {
          setAnimating(false);
        });
      } else {
        // Show random numbers during animation
        const randomNum = Math.floor(Math.random() * maxNumber) + 1;
        useBingoStore.setState({ currentNumber: randomNum });
      }
    }, interval);
  };

  // Handle game reset with confirmation
  const handleResetGame = () => {
    if (window.confirm('ゲームをリセットしますか？すべての番号がクリアされます。')) {
      resetGame();
    }
  };

  // Handle settings save
  const handleSaveSettings = () => {
    setMaxNumber(tempMaxNumber);
    setShowSettings(false);
  };

  // Calculate progress
  const progress = drawnNumbers.length > 0 
    ? Math.round((drawnNumbers.length / maxNumber) * 100) 
    : 0;

  return (
    <div className="bg-white rounded-xl p-3 shadow-lg">
      {/* Responsive layout container - flex-col on small screens, flex-row on medium and up */}
      <div className="flex flex-col md:flex-row md:gap-4">
        {/* Left section - full width on small screens, 1/4 width on medium and up */}
        <div className="md:w-1/4 md:min-w-[250px] md:pr-2 md:border-r md:border-blue-100">
          {/* Game header */}
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-blue-600 md:text-center md:w-full">ビンゴ番号抽選</h2>
            <div className="flex space-x-1 md:absolute md:top-4 md:right-4">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="btn-secondary py-1 px-2 text-sm"
                aria-label="設定"
              >
                設定
              </button>
              <button 
                onClick={handleResetGame}
                className="btn-secondary py-1 px-2 text-sm"
                disabled={drawnNumbers.length === 0}
                aria-label="リセット"
              >
                リセット
              </button>
            </div>
          </div>

          {/* Settings panel */}
          {showSettings && (
            <div className="bg-blue-50 p-2 rounded-lg mb-2">
              <h3 className="text-base font-bold mb-1">設定</h3>
              <div className="flex items-center mb-2">
                <label htmlFor="maxNumber" className="mr-1">最大番号:</label>
                <input
                  id="maxNumber"
                  type="number"
                  min="10"
                  max="99"
                  value={tempMaxNumber}
                  onChange={(e) => setTempMaxNumber(Number(e.target.value))}
                  className="border rounded px-1 py-0.5 w-16 text-center"
                />
              </div>
              <button 
                onClick={handleSaveSettings}
                className="btn-primary py-1 px-2 text-sm"
              >
                保存
              </button>
            </div>
          )}

          {/* Number display */}
          <NumberDisplay 
            number={currentNumber} 
            animating={animating} 
          />

          {/* Draw button */}
          <div className="my-2">
            <button
              onClick={handleDrawNumber}
              disabled={isDrawing || animating || drawnNumbers.length >= maxNumber}
              className="btn btn-primary w-full"
              aria-label="番号を引く"
            >
              {drawnNumbers.length >= maxNumber 
                ? "すべての番号が出ました！" 
                : isDrawing || animating 
                  ? "抽選中..." 
                  : "番号を引く"}
            </button>
          </div>

          {/* Progress bar */}
          <div className="mb-2">
            <div className="flex justify-between text-xs mb-0.5">
              <span>{drawnNumbers.length} / {maxNumber} 番号</span>
              <span>{progress}% 完了</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Right section - full width on small screens, 3/4 width on medium and up */}
        <div className="md:w-3/4 md:pl-2 md:pt-1">
          {/* Drawn numbers list */}
          <NumberList numbers={drawnNumbers} maxNumber={maxNumber} />
        </div>
      </div>
    </div>
  );
};

export default BingoGame;
