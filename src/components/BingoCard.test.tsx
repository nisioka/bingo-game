import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BingoCard from './BingoCard';
import { useBingoStore } from '../store/bingoStore';

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

describe('BingoCard (miniature)', () => {
  beforeEach(() => {
    resetStore();
  });

  it('expands exactly once when a miniature cell is clicked', () => {
    useBingoStore.getState().setCardCount(1);
    const card = useBingoStore.getState().bingoCards[0];
    const cardId = card.id;
    // A real number on the card (row 0 / col 0 is never the free space).
    const target = card.cells[0][0].number;

    // Spy on the real toggle so we can assert it fires exactly once per click
    // while still performing the actual state change.
    const realToggle = useBingoStore.getState().toggleCardExpanded;
    const toggleSpy = jest.fn(realToggle);
    useBingoStore.setState({ toggleCardExpanded: toggleSpy });

    try {
      render(<BingoCard cardId={cardId} miniature />);

      expect(useBingoStore.getState().bingoCards[0].isExpanded).toBe(false);

      // Click an actual number cell. The click must bubble to the card
      // container and toggle expansion once. Regression guard: previously the
      // cell and the container both toggled, firing twice and flipping the card
      // straight back to collapsed.
      fireEvent.click(screen.getByText(String(target)));

      expect(toggleSpy).toHaveBeenCalledTimes(1);
      expect(useBingoStore.getState().bingoCards[0].isExpanded).toBe(true);
    } finally {
      // Restore the real action so it can't leak into other tests.
      useBingoStore.setState({ toggleCardExpanded: realToggle });
    }
  });
});
