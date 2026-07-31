import AIChatMessageInput, {
  type AIChatMessageInputProps,
} from '@/components/features/ai/AIChatMessageInput';

export type AiChatComposerProps = AIChatMessageInputProps;

/** @deprecated 请使用 AIChatMessageInput */
export default function AiChatComposer({
  composerId,
  isLoading,
  onSend,
  placeholder,
  travelParams,
  context,
}: AiChatComposerProps) {
  return (
    <AIChatMessageInput
      composerId={composerId}
      isLoading={isLoading}
      onSend={onSend}
      placeholder={placeholder}
      travelParams={travelParams}
      context={context}
    />
  );
}
