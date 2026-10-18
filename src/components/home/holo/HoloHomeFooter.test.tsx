import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import HoloHomeFooter from '@/components/home/holo/HoloHomeFooter';

describe('HoloHomeFooter', () => {
  it('keeps the platform disclaimer visible under the motto', () => {
    render(
      <MemoryRouter>
        <HoloHomeFooter isDesktop />
      </MemoryRouter>,
    );
    expect(screen.getByText(/AI行程规划工具/)).toBeTruthy();
    expect(screen.getByText(/不从事旅行社组团/)).toBeTruthy();
  });
});
