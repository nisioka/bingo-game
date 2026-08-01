import React from 'react';
import { render, screen } from '@testing-library/react';
import NumberDisplay from './NumberDisplay';

describe('NumberDisplay', () => {
  it('renders the given number', () => {
    render(<NumberDisplay number={42} animating={false} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders a placeholder when the number is null', () => {
    render(<NumberDisplay number={null} animating={false} />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('applies the pop animation class while animating', () => {
    const { container } = render(
      <NumberDisplay number={7} animating={true} />
    );
    expect(container.querySelector('.number-display')).toHaveClass(
      'animate-pop'
    );
  });

  it('does not apply the pop animation class when idle', () => {
    const { container } = render(
      <NumberDisplay number={7} animating={false} />
    );
    expect(container.querySelector('.number-display')).not.toHaveClass(
      'animate-pop'
    );
  });
});
