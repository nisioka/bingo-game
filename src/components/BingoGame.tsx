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
    <div className="bg-white rounded-xl p-6 shadow-lg">
      {/* Game header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-600">ビンゴ番号抽選</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="btn-secondary py-2 px-4 text-sm"
            aria-label="設定"
          >
            設定
          </button>
          <button 
            onClick={handleResetGame}
            className="btn-secondary py-2 px-4 text-sm"
            disabled={drawnNumbers.length === 0}
            aria-label="リセット"
          >
            リセット
          </button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-bold mb-2">設定</h3>
          <div className="flex items-center mb-4">
            <label htmlFor="maxNumber" className="mr-2">最大番号:</label>
            <input
              id="maxNumber"
              type="number"
              min="10"
              max="99"
              value={tempMaxNumber}
              onChange={(e) => setTempMaxNumber(Number(e.target.value))}
              className="border rounded px-2 py-1 w-20 text-center"
            />
          </div>
          <button 
            onClick={handleSaveSettings}
            className="btn-primary py-2 px-4 text-sm"
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
      <div className="my-6">
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
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>{drawnNumbers.length} / {maxNumber} 番号</span>
          <span>{progress}% 完了</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className="bg-blue-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Drawn numbers list */}
      <NumberList numbers={drawnNumbers} maxNumber={maxNumber} />
    </div>
  );
};

export default BingoGame;