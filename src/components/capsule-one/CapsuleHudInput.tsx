import { CAPSULE_INPUT_PLACEHOLDER, CAPSULE_INPUT_PLACEHOLDER_LOCKED } from '@/components/capsule-one/capsulePrompts';
import { useCapsuleLaunchToAi } from '@/hooks/capsule/useCapsuleLaunchToAi';
import { useCapsuleOneStore } from '@/stores/capsuleOne/store';
import { cn } from '@/utils/cn';
import { useEffect, useRef } from 'react';

type CapsuleHudInputProps = {
  layout?: 'overlay' | 'dock';
};

/** 驾驶舱文字输入 — 固定 DOM，兼容中文 IME */
export default function CapsuleHudInput({ layout = 'dock' }: CapsuleHudInputProps) {
  const lockedCity = useCapsuleOneStore((state) => state.lockedCity);
  const draftText = useCapsuleOneStore((state) => state.draftText);
  const setDraftText = useCapsuleOneStore((state) => state.setDraftText);
  const launchToAi = useCapsuleLaunchToAi();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const composingRef = useRef(false);
  const isDock = layout === 'dock';

  useEffect(() => {
    if (!lockedCity) {
      return;
    }
    const node = inputRef.current;
    if (!node) {
      return;
    }
    node.value = draftText;
    const timer = window.setTimeout(() => {
      node.focus({ preventScroll: true });
      const end = node.value.length;
      node.setSelectionRange(end, end);
    }, 80);
    return () => window.clearTimeout(timer);
  }, [draftText, lockedCity?.id]);

  return (
    <div className={cn('capsule-overlay__input', isDock && 'capsule-overlay__input--dock')}>
      <div className={cn('capsule-hud-input', isDock && 'capsule-hud-input--dock capsule-hud-input--embedded')}>
        <div className="capsule-hud-input__ring" aria-hidden />
        <textarea
          ref={inputRef}
          key={lockedCity?.id ?? 'capsule-input'}
          rows={isDock ? 1 : 2}
          lang="zh-CN"
          autoComplete="off"
          spellCheck={false}
          autoFocus={!isDock}
          placeholder={lockedCity ? CAPSULE_INPUT_PLACEHOLDER_LOCKED : CAPSULE_INPUT_PLACEHOLDER}
          className="capsule-hud-input__field"
          defaultValue={draftText}
          onCompositionStart={() => {
            composingRef.current = true;
          }}
          onCompositionEnd={(event) => {
            composingRef.current = false;
            setDraftText(event.currentTarget.value);
          }}
          onInput={(event) => {
            const value = event.currentTarget.value;
            if (!composingRef.current) {
              setDraftText(value);
            }
          }}
          onKeyDown={(event) => {
            if (composingRef.current) {
              return;
            }
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              launchToAi(event.currentTarget.value);
            }
          }}
        />
      </div>
    </div>
  );
}
