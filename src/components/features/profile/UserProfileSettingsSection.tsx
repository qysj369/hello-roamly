import { Bell, MessageCircle, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { User } from '@/types/domain/user/user';
import { paths } from '@/router/paths';
import { getTravelMomentVisibilityLabel } from '@/utils/travelMomentVisibility';
import { getProfileVisibilityLabel } from '@/utils/userProfileView';
import { cn } from '@/utils/cn';

export type UserProfileSettingsSectionProps = {
  user: User;
  isOwnProfile: boolean;
  className?: string;
};

type SettingRowProps = {
  label: string;
  value: string;
};

function SettingRow({ label, value }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <dt className="text-sm text-slate-600">{label}</dt>
      <dd className="text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}

function boolLabel(on: boolean): string {
  return on ? '已开启' : '已关闭';
}

export default function UserProfileSettingsSection({
  user,
  isOwnProfile,
  className,
}: UserProfileSettingsSectionProps) {
  if (!isOwnProfile) {
    return null;
  }

  const { privacySettings: privacy, notificationPreferences: notify } = user;

  return (
    <section
      className={cn('rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6', className)}
      aria-labelledby="profile-settings-title"
    >
      <h2 id="profile-settings-title" className="text-sm font-semibold text-slate-900">
        设置
      </h2>
      <p className="mt-0.5 text-xs text-slate-500">仅自己可见</p>

      <Link
        to={paths.messages}
        className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-[#b7cdc4] bg-emerald-50/50 px-4 py-3 text-sm font-semibold text-[#2c6b58] hover:bg-emerald-50"
      >
        <span className="inline-flex items-center gap-2">
          <MessageCircle className="h-4 w-4" aria-hidden />
          站内消息
        </span>
        <span className="text-xs font-normal text-[#2c6b58]">查看会话 →</span>
      </Link>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            <Shield className="h-4 w-4 text-brand-600" aria-hidden />
            隐私
          </h3>
          <dl className="mt-2 divide-y divide-slate-200/80">
            <SettingRow
              label="主页可见性"
              value={getProfileVisibilityLabel(privacy.profileVisibility)}
            />
            <SettingRow label="展示去过的国家" value={boolLabel(privacy.showVisitedCountries)} />
            <SettingRow label="展示邮箱" value={boolLabel(privacy.showEmail)} />
            <SettingRow label="允许旅伴请求" value={boolLabel(privacy.allowCompanionRequests)} />
            <SettingRow
              label="瞬间默认可见性"
              value={getTravelMomentVisibilityLabel(privacy.defaultMomentVisibility)}
            />
          </dl>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            <Bell className="h-4 w-4 text-[#2c6b58]" aria-hidden />
            通知
          </h3>
          <dl className="mt-2 divide-y divide-slate-200/80">
            <SettingRow label="旅伴匹配" value={boolLabel(notify.companionMatch)} />
            <SettingRow label="行程提醒" value={boolLabel(notify.planReminder)} />
            <SettingRow label="新粉丝" value={boolLabel(notify.newFollower)} />
            <SettingRow label="动态互动" value={boolLabel(notify.momentEngagement)} />
            <SettingRow label="营销推送" value={boolLabel(notify.marketing)} />
          </dl>
        </div>
      </div>
    </section>
  );
}
