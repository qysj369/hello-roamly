import { useCallback, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { DRIVE_VIDEO_LIMITS, validateDriveVideoFile } from '@/lib/drive/driveVideoValidate';
import { useDriveContributionsStore } from '@/stores/driveContributions/store';

type DriveVideoContributeModalProps = {
  cityLabel: string;
  open: boolean;
  onClose: () => void;
  onSubmitted?: (result?: {
    source: 'cloud' | 'local';
    playUrl?: string;
    title?: string;
    autoApproved?: boolean;
  }) => void;
  labels: {
    title: string;
    desc: string;
    titlePlaceholder: string;
    dropIdle: string;
    dropActive: string;
    submit: string;
    cancel: string;
    success: string;
    limitHint: string;
  };
};

/** 本城漫游视频投稿（IndexedDB 本地保存，后续可换云存储） */
export default function DriveVideoContributeModal({
  cityLabel,
  open,
  onClose,
  onSubmitted,
  labels,
}: DriveVideoContributeModalProps) {
  const addContribution = useDriveContributionsStore((s) => s.addContribution);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  const onDrop = useCallback((accepted: File[]) => {
    const next = accepted[0];
    if (!next) {
      return;
    }
    const message = validateDriveVideoFile(next);
    if (message) {
      setError(message);
      setFile(null);
      return;
    }
    setError(null);
    setFile(next);
    setDone(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'video/mp4': ['.mp4'],
      'video/webm': ['.webm'],
      'video/quicktime': ['.mov'],
    },
    disabled: busy,
  });

  if (!open) {
    return null;
  }

  const handleSubmit = async () => {
    if (!file) {
      setError('请先选择视频');
      return;
    }
    const trimmed = title.trim().slice(0, DRIVE_VIDEO_LIMITS.maxTitleLength);
    setBusy(true);
    setError(null);
    try {
      const { assertContentAllowed } = await import('@/lib/moderation/moderate');
      await assertContentAllowed({
        scene: 'travel_moment',
        text: `${trimmed} ${cityLabel}`,
      });

      let cloudOk = false;
      try {
        const { uploadCloudDriveVideo } = await import('@/services/drive/driveVideosApi');
        const result = await uploadCloudDriveVideo({
          cityLabel,
          title: trimmed || `${cityLabel} 漫游投稿`,
          file,
        });
        cloudOk = true;
        setDone(true);
        onSubmitted?.({
          source: 'cloud',
          playUrl: result.item.playUrl,
          title: result.item.title,
          autoApproved: result.autoApproved,
        });
      } catch {
        // 云端不可用时回退本机 IndexedDB，保证功能可用
        await addContribution({
          cityLabel,
          title: trimmed || `${cityLabel} 漫游投稿`,
          file,
        });
        setDone(true);
        onSubmitted?.({ source: 'local' });
      }

      if (!cloudOk) {
        /* already handled */
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setBusy(false);
    }
  };

  const handleClose = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setTitle('');
    setError(null);
    setDone(false);
    onClose();
  };

  return (
    <div className="holo-drive__modal-mask" role="presentation" onClick={handleClose}>
      <div
        className="holo-drive__modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drive-contribute-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="drive-contribute-title">{labels.title}</h2>
        <p className="holo-drive__modal-desc">{labels.desc.replace('{city}', cityLabel)}</p>

        <label className="holo-drive__field">
          <span>标题</span>
          <input
            value={title}
            maxLength={DRIVE_VIDEO_LIMITS.maxTitleLength}
            placeholder={labels.titlePlaceholder}
            onChange={(event) => setTitle(event.target.value)}
            disabled={busy || done}
          />
        </label>

        <div
          {...getRootProps({
            className: `holo-drive__dropzone ${isDragActive ? 'is-active' : ''}`,
          })}
        >
          <input {...getInputProps()} />
          <p>{isDragActive ? labels.dropActive : labels.dropIdle}</p>
          <small>{labels.limitHint}</small>
          {file ? <strong>{file.name}</strong> : null}
        </div>

        {previewUrl ? (
          <video className="holo-drive__contribute-preview" src={previewUrl} controls muted playsInline />
        ) : null}

        {error ? <p className="holo-drive__modal-error">{error}</p> : null}
        {done ? <p className="holo-drive__modal-success">{labels.success}</p> : null}

        <div className="holo-drive__modal-actions">
          <button type="button" className="holo-drive__btn holo-drive__btn--ghost" onClick={handleClose}>
            {labels.cancel}
          </button>
          {!done ? (
            <button
              type="button"
              className="holo-drive__btn holo-drive__btn--primary"
              onClick={() => void handleSubmit()}
              disabled={busy || !file}
            >
              {busy ? '…' : labels.submit}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
