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

    render(<BingoCard cardId={cardId} miniature />);

    expect(useBingoStore.getState().bingoCards[0].isExpanded).toBe(false);

    // Click an actual number cell. The click must bubble to the card container
    // and toggle expansion once. Regression guard: previously the cell and the
    // container both toggled, flipping it straight back to collapsed.
    fireEvent.click(screen.getByText(String(target)));

    expect(useBingoStore.getState().bingoCards[0].isExpanded).toBe(true);
  });
});
