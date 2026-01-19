export type ConversationStep =
  | 'idle'
  | 'service'
  | 'date'
  | 'time'
  | 'confirm';

export interface ConversationContext {
  step: ConversationStep;
  service?: string;
  date?: string;
  time?: string;
}

const conversations = new Map<string, ConversationContext>();

export function getConversation(sessionId: string): ConversationContext {
  if (!conversations.has(sessionId)) {
    conversations.set(sessionId, { step: 'idle' });
  }
  return conversations.get(sessionId)!;
}

export function updateConversation(
  sessionId: string,
  data: Partial<ConversationContext>
) {
  const current = getConversation(sessionId);
  conversations.set(sessionId, { ...current, ...data });
}

export function resetConversation(sessionId: string) {
  conversations.set(sessionId, { step: 'idle' });
}
