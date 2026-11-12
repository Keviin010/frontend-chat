import { Component, ElementRef, OnDestroy, afterRenderEffect, inject, signal, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { ChatMessage } from '../../models/chat-message.model';

type Estado = 'inicio' | 'conectando' | 'conectado' | 'caido' | 'error';

@Component({
  selector: 'app-chat',
  imports: [FormsModule, DatePipe],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class ChatComponent implements OnDestroy {

  private chatService = inject(ChatService);

  username = '';
  texto = '';

  estado = signal<Estado>('inicio');
  messages = signal<ChatMessage[]>([]);
  typingUser = signal('');

  lista = viewChild<ElementRef<HTMLDivElement>>('lista');

  private colores = ['#e74c3c', '#2980b9', '#27ae60', '#d35400', '#8e44ad', '#16a085', '#c0392b', '#e91e63'];
  private intentos = 0;
  private saliendo = false;
  private ultimoAviso = 0;
  private temporizadorEscribiendo: number | undefined;

  constructor() {
    afterRenderEffect(() => {
      this.messages();
      const caja = this.lista()?.nativeElement;
      if (caja) {
        caja.scrollTop = caja.scrollHeight;
      }
    });
  }

  entrar(): void {
    const nombre = this.username.trim();
    if (!nombre) {
      return;
    }
    this.username = nombre;
    this.saliendo = false;
    this.intentos = 0;
    this.messages.set([]);
    this.estado.set('conectando');
    this.conectar();
  }

  reintentar(): void {
    this.intentos = 0;
    this.estado.set('conectando');
    this.conectar();
  }

  salir(): void {
    this.saliendo = true;
    this.chatService.disconnect();
    this.messages.set([]);
    this.typingUser.set('');
    this.estado.set('inicio');
  }

  enviar(): void {
    const contenido = this.texto.trim();
    if (!contenido || this.estado() !== 'conectado') {
      return;
    }
    this.chatService.sendMessage({ sender: this.username, content: contenido, type: 'CHAT' });
    this.texto = '';
  }

  avisarEscribiendo(): void {
    const ahora = Date.now();
    if (this.estado() !== 'conectado' || ahora - this.ultimoAviso < 1500) {
      return;
    }
    this.ultimoAviso = ahora;
    this.chatService.sendTyping({ sender: this.username, content: '', type: 'TYPING' });
  }

  colorDe(nombre: string): string {
    let suma = 0;
    for (const letra of nombre) {
      suma += letra.charCodeAt(0);
    }
    return this.colores[suma % this.colores.length];
  }

  private conectar(): void {
    this.chatService.connect(
      this.username,
      (msg) => this.recibir(msg),
      (msg) => this.alguienEscribe(msg),
      () => this.alConectar(),
      () => this.alFallar()
    );
  }

  private alConectar(): void {
    this.intentos = 0;
    this.estado.set('conectado');
    this.cargarHistorial();
  }

  private alFallar(): void {
    if (this.saliendo || this.estado() === 'error') {
      return;
    }
    this.intentos++;
    if (this.intentos >= 20) {
      this.chatService.disconnect();
      this.estado.set('error');
      return;
    }
    if (this.estado() === 'conectado') {
      this.estado.set('caido');
    }
  }

  private async cargarHistorial(): Promise<void> {
    try {
      const historial = await this.chatService.getHistory();
      const ids = new Set(historial.map((msg) => msg.id));
      const nuevos = this.messages().filter((msg) => msg.id === undefined || !ids.has(msg.id));
      this.messages.set([...historial, ...nuevos]);
    } catch (error) {
      console.warn('No se pudo cargar el historial');
    }
  }

  private recibir(msg: ChatMessage): void {
    this.messages.update((lista) => [...lista, msg].slice(-200));
    if (msg.sender === this.typingUser()) {
      this.typingUser.set('');
    }
  }

  private alguienEscribe(msg: ChatMessage): void {
    if (msg.sender === this.username) {
      return;
    }
    this.typingUser.set(msg.sender);
    window.clearTimeout(this.temporizadorEscribiendo);
    this.temporizadorEscribiendo = window.setTimeout(() => this.typingUser.set(''), 3000);
  }

  ngOnDestroy(): void {
    this.saliendo = true;
    window.clearTimeout(this.temporizadorEscribiendo);
    this.chatService.disconnect();
  }
}
