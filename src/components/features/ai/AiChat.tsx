import AIChatInterface, { type AIChatInterfaceProps } from '@/components/features/ai/AIChatInterface';

export type AiChatProps = AIChatInterfaceProps;

/** @deprecated 请优先使用 AIChatInterface */
export default function AiChat({
  className,
  context,
  seedAssistant,
  autoPrompt,
}: AiChatProps) {
  return (
    <AIChatInterface
      className={className}
      context={context}
      seedAssistant={seedAssistant}
      autoPrompt={autoPrompt}
    />
  );
}
