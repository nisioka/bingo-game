import { useBingoStore } from './bingoStore';

// Reset the store to a known state before each test.
const resetStore = () => {
  useBingoStore.setState({
    drawnNumbers: [],
    currentNumber: null,
    isDrawing: false,
    maxNumber: 75,
    bingoCards: [],
    cardCount: 0,
    soundEnabled: true,
  });
};

describe('bingoStore', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('drawNumber', () => {
    it('adds a new number to drawnNumbers and sets currentNumber', async () => {
      useBingoStore.setState({ maxNumber: 10 });
      await useBingoStore.getState().drawNumber();

      const { drawnNumbers, currentNumber } = useBingoStore.getState();
      expect(drawnNumbers).toHaveLength(1);
      expect(currentNumber).toBe(drawnNumbers[0]);
      expect(currentNumber).toBeGreaterThanOrEqual(1);
      expect(currentNumber).toBeLessThanOrEqual(10);
    });

    it('never draws duplicate numbers', async () => {
      useBingoStore.setState({ maxNumber: 10 });

      for (let i = 0; i < 10; i++) {
        await useBingoStore.getState().drawNumber();
      }

      const { drawnNumbers } = useBingoStore.getState();
      expect(drawnNumbers).toHaveLength(10);
      // All 10 numbers should be unique.
      expect(new Set(drawnNumbers).size).toBe(10);
      // And should be exactly 1..10.
      expect([...drawnNumbers].sort((a, b) => a - b)).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
      ]);
    });

    it('does not draw beyond maxNumber', async () => {
      useBingoStore.setState({ maxNumber: 3 });

      for (let i = 0; i < 5; i++) {
        await useBingoStore.getState().drawNumber();
      }

      expect(useBingoStore.getState().drawnNumbers).toHaveLength(3);
    });

    it('leaves isDrawing false after drawing completes', async () => {
      useBingoStore.setState({ maxNumber: 10 });
      await useBingoStore.getState().drawNumber();
      expect(useBingoStore.getState().isDrawing).toBe(false);
    });
  });

  describe('resetGame', () => {
    it('clears drawn numbers and current number', async () => {
      useBingoStore.setState({
        drawnNumbers: [1, 2, 3],
        currentNumber: 3,
      });

      await useBingoStore.getState().resetGame();

      const { drawnNumbers, currentNumber } = useBingoStore.getState();
      expect(drawnNumbers).toEqual([]);
      expect(currentNumber).toBeNull();
    });

    it('regenerates the configured number of bingo cards', async () => {
      useBingoStore.getState().setCardCount(2);
      useBingoStore.setState({ drawnNumbers: [1, 2] });

      await useBingoStore.getState().resetGame();

      expect(useBingoStore.getState().bingoCards).toHaveLength(2);
    });
  });

  describe('setMaxNumber', () => {
    it('updates the maximum number', () => {
      useBingoStore.getState().setMaxNumber(50);
      expect(useBingoStore.getState().maxNumber).toBe(50);
    });
  });

  describe('setSoundEnabled', () => {
    it('toggles the sound preference', () => {
      useBingoStore.getState().setSoundEnabled(false);
      expect(useBingoStore.getState().soundEnabled).toBe(false);
      useBingoStore.getState().setSoundEnabled(true);
      expect(useBingoStore.getState().soundEnabled).toBe(true);
    });
  });

  describe('setCardCount', () => {
    it('creates the requested number of cards', () => {
      useBingoStore.getState().setCardCount(3);
      expect(useBingoStore.getState().bingoCards).toHaveLength(3);
      expect(useBingoStore.getState().cardCount).toBe(3);
    });

    it('clamps the count between 0 and 5', () => {
      useBingoStore.getState().setCardCount(10);
      expect(useBingoStore.getState().cardCount).toBe(5);

      useBingoStore.getState().setCardCount(-2);
      expect(useBingoStore.getState().cardCount).toBe(0);
    });

    it('generates valid 5x5 cards with a free center cell', () => {
      useBingoStore.getState().setCardCount(1);
      const card = useBingoStore.getState().bingoCards[0];

      expect(card.cells).toHaveLength(5);
      card.cells.forEach((row) => expect(row).toHaveLength(5));

      // Center cell is the free space: number 0 and pre-marked.
      expect(card.cells[2][2].number).toBe(0);
      expect(card.cells[2][2].marked).toBe(true);
    });
  });

  describe('toggleCardMark and bingo detection', () => {
    it('detects a bingo when a full row is marked', () => {
      useBingoStore.getState().setCardCount(1);
      const cardId = useBingoStore.getState().bingoCards[0].id;

      // Mark the entire top row (row 0).
      for (let col = 0; col < 5; col++) {
        useBingoStore.getState().toggleCardMark(cardId, 0, col);
      }

      const card = useBingoStore.getState().bingoCards[0];
      expect(card.hasBingo).toBe(true);
    });

    it('detects a reach when four cells of a row are marked', () => {
      useBingoStore.getState().setCardCount(1);
      const cardId = useBingoStore.getState().bingoCards[0].id;

      // Mark 4 of the 5 cells in the top row.
      for (let col = 0; col < 4; col++) {
        useBingoStore.getState().toggleCardMark(cardId, 0, col);
      }

      const card = useBingoStore.getState().bingoCards[0];
      expect(card.hasReach).toBe(true);
      expect(card.hasBingo).toBe(false);
    });

    it('toggles a cell mark on and off', () => {
      useBingoStore.getState().setCardCount(1);
      const cardId = useBingoStore.getState().bingoCards[0].id;

      const before = useBingoStore.getState().bingoCards[0].cells[0][0].marked;
      useBingoStore.getState().toggleCardMark(cardId, 0, 0);
      const afterOn = useBingoStore.getState().bingoCards[0].cells[0][0].marked;
      expect(afterOn).toBe(!before);

      useBingoStore.getState().toggleCardMark(cardId, 0, 0);
      const afterOff = useBingoStore.getState().bingoCards[0].cells[0][0].marked;
      expect(afterOff).toBe(before);
    });
  });

  describe('toggleCardExpanded', () => {
    it('toggles a single card open and closed', () => {
      useBingoStore.getState().setCardCount(1);
      const cardId = useBingoStore.getState().bingoCards[0].id;

      expect(useBingoStore.getState().bingoCards[0].isExpanded).toBe(false);
      useBingoStore.getState().toggleCardExpanded(cardId);
      expect(useBingoStore.getState().bingoCards[0].isExpanded).toBe(true);
      useBingoStore.getState().toggleCardExpanded(cardId);
      expect(useBingoStore.getState().bingoCards[0].isExpanded).toBe(false);
    });
  });

  describe('toggleCardAutoOpen', () => {
    it('defaults new cards to auto-open off', () => {
      useBingoStore.getState().setCardCount(1);
      expect(useBingoStore.getState().bingoCards[0].autoOpen).toBe(false);
    });

    it('enabling auto-open marks the card expanded and gives it a position', () => {
      useBingoStore.getState().setCardCount(1);
      const cardId = useBingoStore.getState().bingoCards[0].id;

      useBingoStore.getState().toggleCardAutoOpen(cardId);

      const card = useBingoStore.getState().bingoCards[0];
      expect(card.autoOpen).toBe(true);
      expect(card.isExpanded).toBe(true);
      expect(card.position).toBeDefined();
    });

    it('disabling auto-open turns the setting off', () => {
      useBingoStore.getState().setCardCount(1);
      const cardId = useBingoStore.getState().bingoCards[0].id;

      useBingoStore.getState().toggleCardAutoOpen(cardId);
      useBingoStore.getState().toggleCardAutoOpen(cardId);

      expect(useBingoStore.getState().bingoCards[0].autoOpen).toBe(false);
    });

    it('only affects the targeted card', () => {
      useBingoStore.getState().setCardCount(2);
      const [first, second] = useBingoStore.getState().bingoCards;

      useBingoStore.getState().toggleCardAutoOpen(first.id);

      const cards = useBingoStore.getState().bingoCards;
      expect(cards.find((c) => c.id === first.id)?.autoOpen).toBe(true);
      expect(cards.find((c) => c.id === second.id)?.autoOpen).toBe(false);
    });
  });
});
