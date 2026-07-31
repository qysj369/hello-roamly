import { useCallback, useEffect, useState } from 'react';
import type { User } from '@/types/domain/user/user';
import { Dialog } from '@/components/ui';
import { updateUserBasicInfoSchema } from '@/schemas/user/userBasic';
import { formatZodError } from '@/schemas/user/parse';
import { cn } from '@/utils/cn';

export type UserProfileEditDialogProps = {
  open: boolean;
  user: User;
  onClose: () => void;
  onSave: (patch: { username: string; bio: string; avatar?: string }) => void;
};

export default function UserProfileEditDialog({
  open,
  user,
  onClose,
  onSave,
}: UserProfileEditDialogProps) {
  const [username, setUsername] = useState<string>(user.username);
  const [bio, setBio] = useState<string>(user.bio ?? '');
  const [avatar, setAvatar] = useState<string>(user.avatar ?? '');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) {
      return;
    }
    setUsername(user.username);
    setBio(user.bio ?? '');
    setAvatar(user.avatar ?? '');
    setFieldErrors({});
  }, [open, user.username, user.bio, user.avatar]);

  const handleSave = useCallback(() => {
    const parsed = updateUserBasicInfoSchema.safeParse({
      username,
      bio,
      avatar: avatar.trim() || undefined,
    });

    if (!parsed.success) {
      setFieldErrors(formatZodError(parsed.error));
      return;
    }

    onSave({
      username: parsed.data.username ?? username,
      bio: parsed.data.bio ?? bio,
      avatar: parsed.data.avatar ?? undefined,
    });
    onClose();
  }, [avatar, bio, onClose, onSave, username]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="编辑资料"
      description="更新头像、昵称与个性签名，保存后立即生效。"
      confirmLabel="保存"
      cancelLabel="取消"
      onConfirm={handleSave}
      className="max-w-md"
    >
      <div className="space-y-4">
        <label htmlFor="profile-edit-username" className="block">
          <span className="text-sm font-medium text-slate-700">昵称</span>
          <input
            id="profile-edit-username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className={cn(
              'mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500',
              fieldErrors.username && 'border-red-400',
            )}
            autoComplete="username"
          />
          {fieldErrors.username && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.username}</p>
          )}
        </label>

        <label htmlFor="profile-edit-bio" className="block">
          <span className="text-sm font-medium text-slate-700">个性签名</span>
          <textarea
            id="profile-edit-bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={3}
            maxLength={120}
            placeholder="写一句介绍自己的话…"
            className={cn(
              'mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500',
              fieldErrors.bio && 'border-red-400',
            )}
          />
          <p className="mt-1 text-right text-xs text-slate-400">{bio.length}/120</p>
          {fieldErrors.bio && <p className="text-xs text-red-600">{fieldErrors.bio}</p>}
        </label>

        <label htmlFor="profile-edit-avatar" className="block">
          <span className="text-sm font-medium text-slate-700">头像链接（可选）</span>
          <input
            id="profile-edit-avatar"
            type="url"
            value={avatar}
            onChange={(event) => setAvatar(event.target.value)}
            placeholder="https://"
            className={cn(
              'mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500',
              fieldErrors.avatar && 'border-red-400',
            )}
          />
          {fieldErrors.avatar && <p className="mt-1 text-xs text-red-600">{fieldErrors.avatar}</p>}
        </label>
      </div>
    </Dialog>
  );
}
