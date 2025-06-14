import create from 'zustand';
import { persist } from 'zustand/middleware';
import { openDB } from 'idb';

// Define the type for our store state
interface BingoState {
  drawnNumbers: number[];
  currentNumber: number | null;
  isDrawing: boolean;
  maxNumber: number;
  
  // Actions
  drawNumber: () => Promise<void>;
  resetGame: () => Promise<void>;
  setMaxNumber: (max: number) => void;
}

// Initialize IndexedDB
const initDB = async () => {
  return openDB('bingo-game-db', 1, {
    upgrade(db) {
      // Create a store for bingo numbers if it doesn't exist
      if (!db.objectStoreNames.contains('numbers')) {
        db.createObjectStore('numbers', { keyPath: 'id' });
      }
    },
  });
};

// Generate a random number that hasn't been drawn yet
const generateRandomNumber = (max: number, drawnNumbers: number[]): number => {
  // If all numbers have been drawn, return null
  if (drawnNumbers.length >= max) {
    return -1;
  }
  
  // Generate a random number between 1 and max
  let randomNum;
  do {
    randomNum = Math.floor(Math.random() * max) + 1;
  } while (drawnNumbers.includes(randomNum));
  
  return randomNum;
};

// Create the store with persistence
export const useBingoStore = create<BingoState>()(
  persist(
    (set, get) => ({
      drawnNumbers: [],
      currentNumber: null,
      isDrawing: false,
      maxNumber: 75, // Default max number for bingo
      
      drawNumber: async () => {
        const { drawnNumbers, maxNumber, isDrawing } = get();
        
        // Prevent drawing if already in progress or all numbers drawn
        if (isDrawing || drawnNumbers.length >= maxNumber) {
          return;
        }
        
        set({ isDrawing: true });
        
        // Generate a new random number
        const newNumber = generateRandomNumber(maxNumber, drawnNumbers);
        
        // If all numbers have been drawn
        if (newNumber === -1) {
          set({ isDrawing: false });
          return;
        }
        
        // Update the state with the new number
        const updatedDrawnNumbers = [...drawnNumbers, newNumber];
        set({ 
          currentNumber: newNumber,
          drawnNumbers: updatedDrawnNumbers,
          isDrawing: false
        });
        
        // Save to IndexedDB
        try {
          const db = await initDB();
          await db.put('numbers', { 
            id: 'gameState', 
            drawnNumbers: updatedDrawnNumbers,
            currentNumber: newNumber,
            maxNumber
          });
        } catch (error) {
          console.error('Failed to save to IndexedDB:', error);
        }
      },
      
      resetGame: async () => {
        // Reset the state
        set({ 
          drawnNumbers: [],
          currentNumber: null,
          isDrawing: false
        });
        
        // Clear IndexedDB
        try {
          const db = await initDB();
          await db.put('numbers', { 
            id: 'gameState', 
            drawnNumbers: [],
            currentNumber: null,
            maxNumber: get().maxNumber
          });
        } catch (error) {
          console.error('Failed to reset IndexedDB:', error);
        }
      },
      
      setMaxNumber: (max: number) => {
        set({ maxNumber: max });
      }
    }),
    {
      name: 'bingo-storage',
      getStorage: () => localStorage,
      onRehydrateStorage: () => {
        // When the store is rehydrated from localStorage, also check IndexedDB
        return async (state) => {
          try {
            const db = await initDB();
            const gameState = await db.get('numbers', 'gameState');
            
            if (gameState) {
              // Update the state with data from IndexedDB
              state?.setState({
                drawnNumbers: gameState.drawnNumbers || [],
                currentNumber: gameState.currentNumber || null,
                maxNumber: gameState.maxNumber || 75
              });
            }
          } catch (error) {
            console.error('Failed to load from IndexedDB:', error);
          }
        };
      }
    }
  )
);