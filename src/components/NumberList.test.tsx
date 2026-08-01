import React from 'react';
import { render, screen } from '@testing-library/react';
import NumberList from './NumberList';

describe('NumberList', () => {
  it('renders every number from 1 to maxNumber', () => {
    const { container } = render(<NumberList numbers={[]} maxNumber={10} />);
    const items = container.querySelectorAll('.number-item');
    expect(items).toHaveLength(10);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('marks drawn numbers as active', () => {
    const { container } = render(
      <NumberList numbers={[3, 7]} maxNumber={10} />
    );
    const active = container.querySelectorAll('.number-item.active');
    expect(active).toHaveLength(2);
    const activeTexts = Array.from(active).map((el) => el.textContent);
    expect(activeTexts).toEqual(expect.arrayContaining(['3', '7']));
  });

  it('highlights the most recently drawn number', () => {
    const { container } = render(
      <NumberList numbers={[3, 7]} maxNumber={10} />
    );
    const latest = container.querySelectorAll('.number-item.animate-pop');
    expect(latest).toHaveLength(1);
    expect(latest[0]).toHaveTextContent('7');
  });

  it('shows a helper message when no numbers have been drawn', () => {
    render(<NumberList numbers={[]} maxNumber={10} />);
    expect(
      screen.getByText(/まだ番号が出ていません/)
    ).toBeInTheDocument();
  });

  it('hides the helper message once numbers exist', () => {
    render(<NumberList numbers={[1]} maxNumber={10} />);
    expect(
      screen.queryByText(/まだ番号が出ていません/)
    ).not.toBeInTheDocument();
  });
});
