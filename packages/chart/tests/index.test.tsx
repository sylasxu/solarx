import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { ScatterPlot } from '../src';

test('The button should have correct background color', async () => {
  render(<ScatterPlot  />);
  const button = screen.getByText('Demo Button');
  expect(button).toHaveStyle({
    backgroundColor: '#ccc',
  });
});
