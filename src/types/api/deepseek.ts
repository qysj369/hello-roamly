/** DeepSeek Chat API（OpenAI 兼容格式） */

export type DeepSeekChatRole = 'system' | 'user' | 'assistant';

export type DeepSeekChatMessage = {
  role: DeepSeekChatRole;
  content: string;
};

export type DeepSeekChatCompletionRequest = {
  model: string;
  messages: DeepSeekChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
};

export type DeepSeekChatCompletionChoice = {
  index: number;
  message: {
    role: 'assistant';
    content: string;
  };
  finish_reason: string | null;
};

export type DeepSeekChatCompletionResponse = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: DeepSeekChatCompletionChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type DeepSeekErrorResponse = {
  error?: {
    message?: string;
    type?: string;
    code?: string;
  };
};
