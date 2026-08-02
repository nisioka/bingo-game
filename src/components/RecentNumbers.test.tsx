import React from 'react';
import { render, screen } from '@testing-library/react';
import RecentNumbers from './RecentNumbers';

describe('RecentNumbers', () => {
  it('renders nothing when no numbers have been drawn', () => {
    const { container } = render(<RecentNumbers numbers={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when count is zero or negative', () => {
    const { container: zero } = render(
      <RecentNumbers numbers={[1, 2, 3]} count={0} />
    );
    expect(zero).toBeEmptyDOMElement();

    const { container: negative } = render(
      <RecentNumbers numbers={[1, 2, 3]} count={-1} />
    );
    expect(negative).toBeEmptyDOMElement();
  });

  it('renders each number as a list item for accessibility', () => {
    render(<RecentNumbers numbers={[5, 12, 33]} />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('33');
  });

  it('renders the newest number first', () => {
    const { container } = render(<RecentNumbers numbers={[5, 12, 33]} />);
    const tiles = container.querySelectorAll('.recent-number-item');
    // Newest (33) should be first, oldest shown (5) last.
    expect(Array.from(tiles).map((t) => t.textContent)).toEqual([
      '33',
      '12',
      '5',
    ]);
  });

  it('marks the latest number with an aria-label', () => {
    render(<RecentNumbers numbers={[5, 12, 33]} />);
    expect(screen.getByLabelText('最新の番号 33')).toHaveTextContent('33');
    expect(screen.getByLabelText('1つ前の番号 12')).toHaveTextContent('12');
  });

  it('limits the row to the requested count, keeping the most recent', () => {
    render(<RecentNumbers numbers={[1, 2, 3, 4, 5, 6, 7, 8]} count={3} />);
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.queryByText('5')).not.toBeInTheDocument();
  });

  it('applies the highlight class to the latest number only', () => {
    const { container } = render(<RecentNumbers numbers={[10, 20]} />);
    const highlighted = container.querySelectorAll('.recent-number-latest');
    expect(highlighted).toHaveLength(1);
    expect(highlighted[0]).toHaveTextContent('20');
  });
});
