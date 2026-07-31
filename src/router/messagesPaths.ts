import { paths } from '@/router/paths';

export function messagesInboxPath(): string {
  return paths.messages;
}

export function messagesThreadPath(peerUserId: string): string {
  return `${paths.messages}/${encodeURIComponent(peerUserId)}`;
}
