import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import SavedUserPlanDetailPage from '@/pages/plans/SavedUserPlanDetailPage';
import { DEMO_CURRENT_USER_ID } from '@/data/demoUsers';
import { encodeSearchPlanSessionContent } from '@/lib/home/searchPlanSession';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';
import type { UserPlanRecord } from '@/types/api/userPlans';

vi.mock('@/hooks/api/useUserPlans', () => ({
  useUserPlanDetail: vi.fn(),
}));

vi.mock('@/components/features/profile/SavedUserPlanShareControls', () => ({
  default: () => <div>分享控件</div>,
}));

vi.mock('@/components/features/profile/SavedUserPlanManagePanel', () => ({
  default: () => <section>方案管理</section>,
}));

import { useUserPlanDetail } from '@/hooks/api/useUserPlans';

const structured: SearchStructuredPlan = {
  baseInfo: {
    startCity: '济南',
    targetCity: '上海',
    days: 4,
    peopleType: '情侣',
    budget: null,
    theme: null,
  },
  budgetList: [{ item: '合计', perPerson: 2000, tip: '' }],
  globalTips: ['地铁为主'],
  dayList: [
    {
      day: 1,
      title: '外滩闲逛',
      hotelArea: '外滩',
      tips: '',
      traffic: [],
      spots: [{ name: '外滩', intro: '必体验' }],
      foods: [],
    },
    {
      day: 2,
      title: '武康路',
      hotelArea: '外滩',
      tips: '',
      traffic: [],
      spots: [{ name: '武康路', intro: '' }],
      foods: [],
    },
    {
      day: 3,
      title: '豫园',
      hotelArea: '外滩',
      tips: '',
      traffic: [],
      spots: [{ name: '豫园', intro: '' }],
      foods: [],
    },
    {
      day: 4,
      title: '返程',
      hotelArea: '外滩',
      tips: '',
      traffic: [],
      spots: [{ name: '静安寺', intro: '' }],
      foods: [],
    },
  ],
};

function planRecord(overrides: Partial<UserPlanRecord> & { assistant?: string }): UserPlanRecord {
  const { assistant, ...rest } = overrides;
  return {
    id: 'plan-share-1',
    userId: DEMO_CURRENT_USER_ID,
    title: '上海4天情侣',
    isPublic: true,
    isSaved: true,
    createdAt: '',
    updatedAt: '',
    content: {
      planId: 'plan-share-1',
      locationName: '上海',
      lng: 121.47,
      lat: 31.23,
      fullHistory: [
        { role: 'user', content: '上海 4天 情侣' },
        { role: 'assistant', content: assistant ?? '上海 · 4天 · 情侣\n【第1天】\n- 外滩' },
      ],
    },
    ...rest,
  };
}

function renderPage(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/saved-plans/:planId" element={<SavedUserPlanDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('SavedUserPlanDetailPage share landing', () => {
  it('shows old copy-text itinerary and hides manage on QR landing', () => {
    vi.mocked(useUserPlanDetail).mockReturnValue({
      data: { item: planRecord({}) },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    renderPage('/saved-plans/plan-share-1?from=share');

    expect(screen.getByRole('heading', { name: '上海4天情侣' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: '每日行程' })).toBeTruthy();
    expect(screen.getByText('外滩')).toBeTruthy();
    expect(screen.queryByText('方案管理')).toBeNull();
    expect(screen.getByRole('link', { name: /返回首页/ })).toBeTruthy();
  });

  it('renders structured day cards when the session has markup', () => {
    vi.mocked(useUserPlanDetail).mockReturnValue({
      data: { item: planRecord({ assistant: encodeSearchPlanSessionContent(structured) }) },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    renderPage('/saved-plans/plan-share-1?from=share');

    expect(screen.getByRole('heading', { name: '每日行程' })).toBeTruthy();
    expect(screen.getByText('外滩闲逛')).toBeTruthy();
    expect(screen.getByText(/上海 · 4天 · 情侣 · 约/)).toBeTruthy();
    expect(screen.getByRole('button', { name: '用AI改成我的' })).toBeTruthy();
    expect(screen.queryByText('未设置预算')).toBeNull();
    expect(screen.queryByText('往返大交通')).toBeNull();
    expect(screen.queryByText('方案管理')).toBeNull();
  });

  it('shows a loading placeholder before the itinerary arrives', () => {
    vi.mocked(useUserPlanDetail).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    } as never);

    renderPage('/saved-plans/plan-share-1?from=share');
    expect(screen.getByRole('status').textContent).toContain('正在加载完整行程');
  });

  it('shows a retryable error when the request fails', () => {
    vi.mocked(useUserPlanDetail).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('network down'),
      refetch: vi.fn(),
    } as never);

    renderPage('/saved-plans/plan-share-1?from=share');
    expect(screen.getByText('行程加载失败')).toBeTruthy();
    expect(screen.getByRole('button', { name: '重新加载' })).toBeTruthy();
  });
});
