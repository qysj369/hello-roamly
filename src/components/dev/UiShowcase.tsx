import { useState } from 'react';
import { TravelPlanCard } from '@/components/features/plans';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
} from '@/components/ui';
import { getRecentTravelPlans } from '@/data/recentTravelPlans';

/** 开发环境：基础 UI 组件示例 */
const demoPlan = getRecentTravelPlans(1)[0];

export default function UiShowcase() {
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <>
    <Card className="mt-6 border-dashed border-slate-300 bg-slate-50/80 shadow-none">
      <CardHeader>
        <CardTitle>开发 · UI 组件</CardTitle>
        <CardDescription>Button、Card、Dialog（Headless UI）</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button size="sm">Primary</Button>
        <Button size="sm" variant="secondary">
          Secondary
        </Button>
        <Button size="sm" variant="ghost">
          Ghost
        </Button>
        <Button size="sm" variant="danger">
          Danger
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setDialogOpen(true)}>
          打开 Dialog
        </Button>
      </CardContent>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Dialog 示例"
        description="基于 @headlessui/react，带标题、说明与确认区。"
        confirmLabel="知道了"
        onConfirm={() => setDialogOpen(false)}
      >
        <p>业务弹窗可在此区域放表单或提示文案。</p>
      </Dialog>
    </Card>

    {demoPlan && (
      <Card className="mt-6 border-dashed border-slate-300 bg-slate-50/80 shadow-none">
        <CardHeader>
          <CardTitle>开发 · TravelPlanCard</CardTitle>
          <CardDescription>完整计划卡片（含动效与互动）</CardDescription>
        </CardHeader>
        <CardContent className="max-w-xs">
          <TravelPlanCard plan={demoPlan} />
        </CardContent>
      </Card>
    )}
    </>
  );
}
