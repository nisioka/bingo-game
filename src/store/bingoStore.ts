import create from 'zustand';
import { persist } from 'zustand/middleware';
import { openDB } from 'idb';

// Define the type for a bingo card cell
interface BingoCardCell {
  number: number;
  marked: boolean;
}

// Define the type for a bingo card
interface BingoCard {
  id: string;
  cells: BingoCardCell[][];
  color: string;
  position?: { x: number; y: number };
  isExpanded: boolean;
  hasReach: boolean;
  hasBingo: boolean;
}

// Define the type for our store state
interface BingoState {
  drawnNumbers: number[];
  currentNumber: number | null;
  isDrawing: boolean;
  maxNumber: number;
  bingoCards: BingoCard[];
  cardCount: number;

  // Actions
  drawNumber: () => Promise<void>;
  resetGame: () => Promise<void>;
  setMaxNumber: (max: number) => void;
  setCardCount: (count: number) => void;
  toggleCardMark: (cardId: string, row: number, col: number) => void;
  toggleCardExpanded: (cardId: string) => void;
  updateCardPosition: (cardId: string, position: { x: number; y: number }) => void;
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

// Generate a random bingo card
const generateBingoCard = (id: string, color: string): BingoCard => {
  // Standard bingo card has 5x5 grid with a center cell as free space
  const cells: BingoCardCell[][] = [];

  // For each column, generate 5 unique numbers in the appropriate range
  for (let col = 0; col < 5; col++) {
    const colCells: BingoCardCell[] = [];
    const min = col * 15 + 1;
    const max = min + 14;
    const numbers = new Set<number>();

    // Generate 5 unique numbers for this column
    while (numbers.size < 5) {
      const num = Math.floor(Math.random() * (max - min + 1)) + min;
      numbers.add(num);
    }

    // Convert to array and sort
    const numbersArray = Array.from(numbers).sort((a, b) => a - b);

    // Create cells for this column
    for (let row = 0; row < 5; row++) {
      // Center cell is free space
      if (row === 2 && col === 2) {
        colCells.push({ number: 0, marked: true });
      } else {
        colCells.push({ number: numbersArray[row], marked: false });
      }
    }

    cells.push(colCells);
  }

  // Transpose the grid to get rows instead of columns
  const transposedCells: BingoCardCell[][] = [];
  for (let row = 0; row < 5; row++) {
    const rowCells: BingoCardCell[] = [];
    for (let col = 0; col < 5; col++) {
      rowCells.push(cells[col][row]);
    }
    transposedCells.push(rowCells);
  }

  return {
    id,
    cells: transposedCells,
    color,
    isExpanded: false,
    hasReach: false,
    hasBingo: false
  };
};

// Check if a card has bingo
const checkBingo = (card: BingoCard): boolean => {
  const { cells } = card;

  // Check rows
  for (let row = 0; row < 5; row++) {
    if (cells[row].every(cell => cell.marked)) {
      return true;
    }
  }

  // Check columns
  for (let col = 0; col < 5; col++) {
    if (cells.every(row => row[col].marked)) {
      return true;
    }
  }

  // Check diagonals
  if (cells[0][0].marked && cells[1][1].marked && cells[2][2].marked && cells[3][3].marked && cells[4][4].marked) {
    return true;
  }

  return cells[0][4].marked && cells[1][3].marked && cells[2][2].marked && cells[3][1].marked && cells[4][0].marked;


};

// Check if a card has a reach (one away from bingo)
const checkReach = (card: BingoCard): boolean => {
  const { cells } = card;

  // Check rows
  for (let row = 0; row < 5; row++) {
    const markedCount = cells[row].filter(cell => cell.marked).length;
    if (markedCount === 4) {
      return true;
    }
  }

  // Check columns
  for (let col = 0; col < 5; col++) {
    const markedCount = cells.filter(row => row[col].marked).length;
    if (markedCount === 4) {
      return true;
    }
  }

  // Check diagonals
  const diag1 = [cells[0][0], cells[1][1], cells[2][2], cells[3][3], cells[4][4]];
  const diag2 = [cells[0][4], cells[1][3], cells[2][2], cells[3][1], cells[4][0]];

  if (diag1.filter(cell => cell.marked).length === 4) {
    return true;
  }

  return diag2.filter(cell => cell.marked).length === 4;


};

// Card colors
const CARD_COLORS = [
  'bg-red-100 border-red-500',
  'bg-blue-100 border-blue-500',
  'bg-green-100 border-green-500',
  'bg-yellow-100 border-yellow-500',
  'bg-purple-100 border-purple-500'
];

// Create the store with persistence
export const useBingoStore = create<BingoState>()(
  persist(
    (set, get) => ({
      drawnNumbers: [],
      currentNumber: null,
      isDrawing: false,
      maxNumber: 75, // Default max number for bingo
      bingoCards: [],
      cardCount: 0,

      drawNumber: async () => {
        const { drawnNumbers, maxNumber, isDrawing, bingoCards } = get();

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
            maxNumber,
            bingoCards,
            cardCount: get().cardCount
          });
        } catch (error) {
          console.error('Failed to save to IndexedDB:', error);
        }
      },

      resetGame: async () => {
        const { cardCount } = get();

        // Generate new bingo cards if needed
        const newBingoCards = [];
        for (let i = 0; i < cardCount; i++) {
          newBingoCards.push(generateBingoCard(`card-${i}`, CARD_COLORS[i]));
        }

        // Reset the state
        set({
          drawnNumbers: [],
          currentNumber: null,
          isDrawing: false,
          bingoCards: newBingoCards
        });

        // Clear IndexedDB
        try {
          const db = await initDB();
          await db.put('numbers', {
            id: 'gameState',
            drawnNumbers: [],
            currentNumber: null,
            maxNumber: get().maxNumber,
            bingoCards: newBingoCards,
            cardCount
          });
        } catch (error) {
          console.error('Failed to reset IndexedDB:', error);
        }
      },

      setMaxNumber: (max: number) => {
        set({ maxNumber: max });
      },

      setCardCount: (count: number) => {
        // Ensure the count is between 0 and 5
        const safeCount = Math.max(0, Math.min(5, count));
        const currentCards = get().bingoCards;

        // Generate new cards if needed
        const newBingoCards = [...currentCards];

        // Remove excess cards
        if (newBingoCards.length > safeCount) {
          newBingoCards.splice(safeCount);
        }

        // Add new cards if needed
        while (newBingoCards.length < safeCount) {
          const index = newBingoCards.length;
          newBingoCards.push(generateBingoCard(`card-${index}`, CARD_COLORS[index]));
        }

        // Update state
        set({
          cardCount: safeCount,
          bingoCards: newBingoCards
        });

        // Save to IndexedDB
        try {
          const db = initDB();
          db.then(db => {
            db.put('numbers', {
              id: 'gameState',
              drawnNumbers: get().drawnNumbers,
              currentNumber: get().currentNumber,
              maxNumber: get().maxNumber,
              bingoCards: newBingoCards,
              cardCount: safeCount
            });
          });
        } catch (error) {
          console.error('Failed to save card count to IndexedDB:', error);
        }
      },

      toggleCardMark: (cardId: string, row: number, col: number) => {
        const { bingoCards } = get();

        // Find the card
        const updatedCards = bingoCards.map((card: BingoCard) => {
          if (card.id === cardId) {
            // Create a deep copy of the cells
            const newCells = card.cells.map((r: BingoCardCell[]) => [...r]);

            // Toggle the marked state
            newCells[row][col].marked = !newCells[row][col].marked;

            // Check for bingo and reach
            const updatedCard = {
              ...card,
              cells: newCells
            };

            const hasBingo = checkBingo(updatedCard);
            const hasReach = !hasBingo && checkReach(updatedCard);

            return {
              ...updatedCard,
              hasBingo,
              hasReach
            };
          }
          return card;
        });

        // Update state
        set({ bingoCards: updatedCards });

        // Save to IndexedDB
        try {
          const db = initDB();
          db.then(db => {
            db.put('numbers', {
              id: 'gameState',
              drawnNumbers: get().drawnNumbers,
              currentNumber: get().currentNumber,
              maxNumber: get().maxNumber,
              bingoCards: updatedCards,
              cardCount: get().cardCount
            });
          });
        } catch (error) {
          console.error('Failed to save card mark to IndexedDB:', error);
        }
      },

      toggleCardExpanded: (cardId: string) => {
        const { bingoCards } = get();

        // Find the card and toggle its expanded state
        const updatedCards = bingoCards.map((card: BingoCard) => {
          if (card.id === cardId) {
            return {
              ...card,
              isExpanded: !card.isExpanded
            };
          }
          // Collapse other cards
          return {
            ...card,
            isExpanded: false
          };
        });

        // Update state
        set({ bingoCards: updatedCards });
      },

      updateCardPosition: (cardId: string, position: { x: number; y: number }) => {
        const { bingoCards } = get();

        // Find the card and update its position
        const updatedCards = bingoCards.map((card: BingoCard) => {
          if (card.id === cardId) {
            return {
              ...card,
              position
            };
          }
          return card;
        });

        // Update state
        set({ bingoCards: updatedCards });
      }
    }),
    {
      name: 'bingo-storage',
      getStorage: () => localStorage,
      onRehydrateStorage: () => {
        // When the store is rehydrated from localStorage, also check IndexedDB
        return async (state: any) => {
          try {
            const db = await initDB();
            const gameState = await db.get('numbers', 'gameState');

            if (gameState) {
              // Update the state with data from IndexedDB
              state?.setState({
                drawnNumbers: gameState.drawnNumbers || [],
                currentNumber: gameState.currentNumber || null,
                maxNumber: gameState.maxNumber || 75,
                bingoCards: gameState.bingoCards || [],
                cardCount: gameState.cardCount || 0
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
