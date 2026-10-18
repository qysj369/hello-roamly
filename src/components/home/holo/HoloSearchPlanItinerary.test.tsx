import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import HoloSearchPlanItinerary from '@/components/home/holo/HoloSearchPlanItinerary';
import { matchSearchPlanGoldExample } from '@/lib/home/searchPlanGoldExamples';

const couple = matchSearchPlanGoldExample({
  startCity: '济南',
  targetCity: '上海',
  days: 3,
  peopleType: '情侣',
  budget: null,
  theme: null,
})!;

describe('HoloSearchPlanItinerary', () => {
  it('keeps day cards short and folds traffic plus tips by default', () => {
    render(<HoloSearchPlanItinerary plan={couple} />);
    expect(screen.getByText('外滩源')).toBeTruthy();
    expect(screen.getByText(/错峰走背街/)).toBeTruthy();
    const fold = screen.getAllByText('展开交通与贴士')[0]?.closest('details');
    expect(fold?.open).toBeFalsy();
    expect(fold?.textContent).toMatch(/地铁2\/10号线南京东路/);
  });

  it('reveals traffic after expanding the day note', async () => {
    const user = userEvent.setup();
    render(<HoloSearchPlanItinerary plan={couple} />);
    await user.click(screen.getAllByText('展开交通与贴士')[0]!);
    expect(screen.getByText(/地铁2\/10号线南京东路/)).toBeTruthy();
  });
});
