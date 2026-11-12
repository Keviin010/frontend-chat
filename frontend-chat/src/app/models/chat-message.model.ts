export interface ChatMessage {
  id?: number;
  sender: string;
  content: string;
  type: 'CHAT' | 'JOIN' | 'LEAVE' | 'TYPING';
  timestamp?: string;
}
