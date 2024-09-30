// hooks/useStartAssistant.ts
import { useEffect } from 'react';
import ChatManager from '../services/ChatManager';

export const useStartAssistant = (assistantId: string | null, chatManager: ChatManager | null, initialThreadMessage: string, initialThreadId?: string) => {
  useEffect(() => {
    if (assistantId && chatManager) {
      console.log('Assistant ID gefunden:', assistantId);
      chatManager.startAssistantWithId(assistantId, initialThreadMessage, initialThreadId);
    } else {
      console.warn('Assistant ID nicht gefunden');
    }
  }, [assistantId, chatManager, initialThreadMessage, initialThreadId]);
};