export interface ChatMessage {
  user: string;
  message: string;
  timestamp: string;
  connectionId?: string;
}