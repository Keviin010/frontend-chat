import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BACKEND_URL } from '../config';
import { ChatMessage } from '../models/chat-message.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private stompClient: Client | null = null;

  async getHistory(): Promise<ChatMessage[]> {
    const response = await fetch(`${BACKEND_URL}/api/messages`);
    if (!response.ok) {
      throw new Error('No se pudo leer el historial');
    }
    return response.json();
  }

  connect(
    username: string,
    onMessage: (msg: ChatMessage) => void,
    onTyping: (msg: ChatMessage) => void,
    onConnected: () => void,
    onError: () => void
  ): void {
    this.disconnect();

    const client = new Client({
      webSocketFactory: () => new SockJS(`${BACKEND_URL}/chat-websocket`),
      reconnectDelay: 4000,
      onConnect: () => {
        client.subscribe('/topic/chat', (payload: IMessage) => onMessage(JSON.parse(payload.body)));
        client.subscribe('/topic/typing', (payload: IMessage) => onTyping(JSON.parse(payload.body)));
        this.send('/app/sendMessage', { sender: username, content: '', type: 'JOIN' });
        onConnected();
      },
      onWebSocketClose: () => onError()
    });

    this.stompClient = client;
    client.activate();
  }

  sendMessage(message: ChatMessage): void {
    this.send('/app/sendMessage', message);
  }

  sendTyping(message: ChatMessage): void {
    this.send('/app/typing', message);
  }

  disconnect(): void {
    this.stompClient?.deactivate();
    this.stompClient = null;
  }

  private send(destination: string, message: ChatMessage): void {
    if (this.stompClient?.connected) {
      this.stompClient.publish({ destination, body: JSON.stringify(message) });
    }
  }
}
