import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SpiralOrbitOverlay from '@/components/capsule-one/spiral-home/SpiralOrbitOverlay';

describe('SpiralOrbitOverlay', () => {
  it('keeps waypoints and a lightweight SVG coil', () => {
    const { container } = render(<SpiralOrbitOverlay />);
    expect(container.querySelector('.spiral-home__coil')).toBeTruthy();
    expect(container.querySelectorAll('.spiral-home__spark')).toHaveLength(4);
    expect(container.querySelectorAll('.spiral-home__mote')).toHaveLength(5);
    expect(screen.getByRole('button', { name: '淄博' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '潍坊' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '济南历下' })).toBeTruthy();
  });
});
