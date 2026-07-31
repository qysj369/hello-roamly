import { Sparkles, Stars } from '@react-three/drei';

type CapsuleStarrySkyProps = {
  /** daylight = 浅色；night = 深空；ink = 宣纸留白（极淡星点） */
  mode?: 'daylight' | 'night' | 'ink';
};

/** 穹顶星尘 */
export default function CapsuleStarrySky({ mode = 'daylight' }: CapsuleStarrySkyProps) {
  if (mode === 'ink') {
    return (
      <group raycast={() => null}>
        <Sparkles
          count={48}
          scale={[90, 60, 90]}
          size={1.4}
          speed={0.03}
          opacity={0.12}
          color="#4a6fa5"
        />
      </group>
    );
  }

  if (mode === 'daylight') {
    return (
      <group raycast={() => null}>
        <Stars
          radius={220}
          depth={90}
          count={1800}
          factor={2.2}
          saturation={0.35}
          fade
          speed={0.04}
        />
        <Sparkles
          count={180}
          scale={[72, 48, 72]}
          size={2.2}
          speed={0.08}
          opacity={0.42}
          color="#00d1ff"
        />
        <Sparkles
          count={80}
          scale={[64, 42, 64]}
          size={3.2}
          speed={0.06}
          opacity={0.28}
          color="#9d7dff"
        />
      </group>
    );
  }

  return (
    <group raycast={() => null}>
      <Stars
        radius={280}
        depth={140}
        count={36000}
        factor={2.8}
        saturation={0.05}
        fade={false}
        speed={0.06}
      />
      <Stars
        radius={240}
        depth={110}
        count={15000}
        factor={3.6}
        saturation={0.07}
        fade={false}
        speed={0.1}
      />
      <Stars
        radius={200}
        depth={82}
        count={11000}
        factor={4.8}
        saturation={0.1}
        fade
        speed={0.14}
      />
      <Stars
        radius={165}
        depth={54}
        count={8500}
        factor={6}
        saturation={0.14}
        fade
        speed={0.24}
      />
      <Stars
        radius={128}
        depth={32}
        count={2800}
        factor={8.2}
        saturation={0.2}
        fade
        speed={0.34}
      />
      <Sparkles
        count={1200}
        scale={[92, 66, 92]}
        size={1.6}
        speed={0.18}
        opacity={0.72}
        color="#f4f7ff"
      />
      <Sparkles
        count={360}
        scale={[88, 62, 88]}
        size={2.8}
        speed={0.1}
        opacity={0.5}
        color="#fff8e6"
      />
    </group>
  );
}
