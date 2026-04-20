import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { ChatMessage } from '../../models/chat-message.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class ChatComponent implements OnDestroy {

  username: string = '';
  messageContent: string = '';
  messages: ChatMessage[] = [];
  connected: boolean = false;
  typingUser: string = '';
  typingTimeout: any;

  userColors: Map<string, string> = new Map();
  colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#e91e63'];

  constructor(private chatService: ChatService, private cdr: ChangeDetectorRef) {}

  getColor(sender: string): string {
    if (!this.userColors.has(sender)) {
      const color = this.colors[this.userColors.size % this.colors.length];
      this.userColors.set(sender, color);
    }
    return this.userColors.get(sender)!;
  }

  connect(): void {
    if (!this.username.trim()) return;
    this.chatService.connect(
      this.username,
      (msg) => this.onMessage(msg),
      (msg) => this.onTyping(msg)
    );
    this.connected = true;
  }

  onMessage(msg: ChatMessage): void {
    this.messages.push(msg);
    this.typingUser = '';
    this.cdr.detectChanges();
  }

  onTyping(msg: ChatMessage): void {
    if (msg.sender !== this.username) {
      this.typingUser = msg.sender;
      clearTimeout(this.typingTimeout);
      this.typingTimeout = setTimeout(() => {
        this.typingUser = '';
        this.cdr.detectChanges();
      }, 2000);
      this.cdr.detectChanges();
    }
  }

  sendMessage(): void {
    if (!this.messageContent.trim()) return;
    const msg: ChatMessage = { sender: this.username, content: this.messageContent, type: 'CHAT' };
    this.chatService.sendMessage(msg);
    this.messageContent = '';
  }

  onTypingEvent(): void {
    const msg: ChatMessage = { sender: this.username, content: '', type: 'TYPING' };
    this.chatService.sendTyping(msg);
  }

  ngOnDestroy(): void {
    this.chatService.disconnect();
  }
}