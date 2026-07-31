import { Html } from '@react-three/drei';
import { type ThreeEvent, type ComponentProps } from 'react';
import {
  CAPSULE_DEFAULT_PROMPTS,
  lockedDestinationPrompt,
} from '@/components/capsule-one/capsulePrompts';
import { speakCapsuleSystemLine } from '@/lib/capsule/capsuleSystemVoice';
import { useCapsuleOneStore } from '@/stores/capsuleOne/store';
import { useEffect, useMemo, useState } from 'react';

type CapsuleInteractiveObjectProps = ComponentProps<'group'>;

/** 中心引导文案 — 无 3D 几何，仅留白与文字 */
export default function CapsuleInteractiveObject(props: CapsuleInteractiveObjectProps) {
  const [promptIndex, setPromptIndex] = useState(0);

  const phase = useCapsuleOneStore((state) => state.phase);
  const lockedCity = useCapsuleOneStore((state) => state.lockedCity);
  const blindBoxActive = useCapsuleOneStore((state) => state.blindBoxActive);
  const inputOpen = useCapsuleOneStore((state) => state.inputOpen);
  const openInput = useCapsuleOneStore((state) => state.openInput);
  const triggerPulse = useCapsuleOneStore((state) => state.triggerPulse);

  const promptText = useMemo(() => {
    if (blindBoxActive || inputOpen) {
      return '';
    }
    if (lockedCity) {
      return lockedDestinationPrompt(lockedCity.label);
    }
    return CAPSULE_DEFAULT_PROMPTS[promptIndex] ?? CAPSULE_DEFAULT_PROMPTS[0];
  }, [blindBoxActive, inputOpen, lockedCity, promptIndex]);

  useEffect(() => {
    if (lockedCity || inputOpen) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      setPromptIndex((index) => (index + 1) % CAPSULE_DEFAULT_PROMPTS.length);
    }, 4800);
    return () => window.clearInterval(timer);
  }, [inputOpen, lockedCity]);

  const handleOpenInput = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (phase === 'launching') {
      return;
    }
    triggerPulse(0.45);
    openInput();
    const muted = useCapsuleOneStore.getState().muted;
    void speakCapsuleSystemLine('inviteJourney', muted);
  };

  if (!promptText) {
    return null;
  }

  return (
    <group {...props}>
      <mesh onClick={handleOpenInput} visible={false}>
        <planeGeometry args={[5, 2.5]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <Html center distanceFactor={11} className="capsule-prompt-html" zIndexRange={[80, 0]}>
        {promptText}
      </Html>
    </group>
  );
}
