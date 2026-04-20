import { Injectable } from '@angular/core';
import { Client, over } from 'stompjs';
import SockJS from 'sockjs-client';
import { ChatMessage } from '../models/chat-message.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private stompClient: Client | null = null;

  connect(username: string, onMessage: (msg: ChatMessage) => void, onTyping: (msg: ChatMessage) => void): void {
    const socket = new SockJS('http://localhost:8080/chat-websocket');
    this.stompClient = over(socket);
    this.stompClient.debug = () => {};

    this.stompClient.connect({}, () => {
      const joinMessage: ChatMessage = { sender: username, content: '', type: 'JOIN' };
      this.stompClient!.send('/app/sendMessage', {}, JSON.stringify(joinMessage));

      this.stompClient!.subscribe('/topic/chat', (payload: any) => {
        onMessage(JSON.parse(payload.body));
      });

      this.stompClient!.subscribe('/topic/typing', (payload: any) => {
        onTyping(JSON.parse(payload.body));
      });
    });
  }

  sendMessage(message: ChatMessage): void {
    this.stompClient?.send('/app/sendMessage', {}, JSON.stringify(message));
  }

  sendTyping(message: ChatMessage): void {
    this.stompClient?.send('/app/typing', {}, JSON.stringify(message));
  }

  disconnect(): void {
    this.stompClient?.disconnect(() => {});
  }
}