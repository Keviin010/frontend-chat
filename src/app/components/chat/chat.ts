import { Component, ElementRef, OnDestroy, afterRenderEffect, computed, inject, signal, viewChild } from '@angular/core';
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

  participantes = computed(() => {
    const presentes = new Map<string, boolean>();
    for (const msg of this.messages()) {
      if (msg.type === 'LEAVE') {
        presentes.set(msg.sender, false);
      } else if (msg.type === 'CHAT' || msg.type === 'JOIN') {
        presentes.set(msg.sender, true);
      }
    }
    const otros = [...presentes]
      .filter(([nombre, activo]) => activo && nombre !== this.username)
      .map(([nombre]) => nombre);
    return [this.username, ...otros];
  });

  textoEstado = computed(() => {
    switch (this.estado()) {
      case 'conectado':
        return 'En línea';
      case 'conectando':
        return 'Conectando…';
      case 'caido':
        return 'Reconectando…';
      default:
        return 'Sin conexión';
    }
  });

  lista = viewChild<ElementRef<HTMLDivElement>>('lista');

  private colores = ['#d13b40', '#b8590a', '#1a7a4f', '#0b6fd6', '#7c3fb5', '#c2287a', '#0e7c86', '#4f6b00'];
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
    let numero = 0;
    for (const letra of nombre) {
      numero = (numero * 131 + letra.charCodeAt(0)) % 1000003;
    }
    return this.colores[numero % this.colores.length];
  }

  inicial(nombre: string): string {
    return nombre.trim().charAt(0).toUpperCase();
  }

  esPrimeroDelGrupo(indice: number): boolean {
    const lista = this.messages();
    const anterior = lista[indice - 1];
    return !anterior || anterior.type !== 'CHAT' || anterior.sender !== lista[indice].sender;
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
