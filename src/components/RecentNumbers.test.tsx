import React from 'react';
import { render, screen } from '@testing-library/react';
import RecentNumbers from './RecentNumbers';

describe('RecentNumbers', () => {
  it('shows an empty message when no numbers have been drawn', () => {
    render(<RecentNumbers numbers={[]} />);
    expect(screen.getByText('まだ番号が出ていません。')).toBeInTheDocument();
  });

  it('renders the newest number first with a "最新" label', () => {
    render(<RecentNumbers numbers={[5, 12, 33]} />);

    // The latest drawn number (33) should be labelled "最新".
    expect(screen.getByText('最新')).toBeInTheDocument();
    expect(screen.getByText('1つ前')).toBeInTheDocument();

    // The latest number tile should show 33.
    const latest = screen.getByLabelText('最新の番号 33');
    expect(latest).toHaveTextContent('33');
  });

  it('labels the number before the latest as "1つ前"', () => {
    render(<RecentNumbers numbers={[5, 12, 33]} />);
    const previous = screen.getByLabelText('1つ前の番号 12');
    expect(previous).toHaveTextContent('12');
  });

  it('limits the row to the requested count, keeping the most recent', () => {
    render(<RecentNumbers numbers={[1, 2, 3, 4, 5, 6, 7, 8]} count={3} />);

    // Only the last 3 numbers should be shown.
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
