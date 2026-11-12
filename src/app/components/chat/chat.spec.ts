import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatComponent } from './chat';
import { ChatService } from '../../services/chat.service';
import { ChatMessage } from '../../models/chat-message.model';

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;

  const servicio = {
    connect: vi.fn(),
    getHistory: vi.fn(),
    sendMessage: vi.fn(),
    sendTyping: vi.fn(),
    disconnect: vi.fn()
  };

  function entrarComo(nombre: string): void {
    component.username = nombre;
    component.entrar();
  }

  function avisosDelServicio() {
    const llamada = servicio.connect.mock.calls[0];
    return {
      alRecibir: llamada[1] as (msg: ChatMessage) => void,
      alEscribir: llamada[2] as (msg: ChatMessage) => void,
      alConectar: llamada[3] as () => void,
      alFallar: llamada[4] as () => void
    };
  }

  beforeEach(async () => {
    vi.clearAllMocks();
    servicio.getHistory.mockResolvedValue([]);

    await TestBed.configureTestingModule({
      imports: [ChatComponent],
      providers: [{ provide: ChatService, useValue: servicio }]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('shows the name screen at the start', () => {
    const pantalla = fixture.nativeElement as HTMLElement;
    expect(pantalla.querySelector('.entrada')).not.toBeNull();
    expect(pantalla.querySelector('.sala')).toBeNull();
  });

  it('does not enter with an empty name', () => {
    entrarComo('   ');
    expect(component.estado()).toBe('inicio');
    expect(servicio.connect).not.toHaveBeenCalled();
  });

  it('connects with the typed name', () => {
    entrarComo(' Kevin ');
    expect(component.estado()).toBe('conectando');
    expect(servicio.connect.mock.calls[0][0]).toBe('Kevin');
  });

  it('shows a received message', async () => {
    entrarComo('Kevin');
    const { alConectar, alRecibir } = avisosDelServicio();
    alConectar();
    alRecibir({ id: 1, sender: 'Ana', content: 'Hola a todos', type: 'CHAT', timestamp: '2026-11-12T15:30:00Z' });
    await fixture.whenStable();

    const texto = (fixture.nativeElement as HTMLElement).textContent;
    expect(component.estado()).toBe('conectado');
    expect(texto).toContain('Hola a todos');
    expect(texto).toContain('Ana');
  });

  it('does not repeat a message that also arrives in the history', async () => {
    const mensaje: ChatMessage = { id: 7, sender: 'Ana', content: 'Hola', type: 'CHAT' };
    servicio.getHistory.mockResolvedValue([mensaje]);
    entrarComo('Kevin');
    const { alConectar, alRecibir } = avisosDelServicio();
    alRecibir(mensaje);
    alConectar();
    await fixture.whenStable();

    expect(component.messages().length).toBe(1);
  });

  it('shows who is leaving and joining', async () => {
    entrarComo('Kevin');
    const { alConectar, alRecibir } = avisosDelServicio();
    alConectar();
    alRecibir({ sender: 'Ana', content: '', type: 'JOIN' });
    alRecibir({ sender: 'Ana', content: '', type: 'LEAVE' });
    await fixture.whenStable();

    const texto = (fixture.nativeElement as HTMLElement).textContent;
    expect(texto).toContain('Ana se unió al chat');
    expect(texto).toContain('Ana salió del chat');
  });

  it('sends the message and clears the box', () => {
    entrarComo('Kevin');
    avisosDelServicio().alConectar();
    component.texto = '  Buenas  ';
    component.enviar();

    expect(servicio.sendMessage).toHaveBeenCalledWith({ sender: 'Kevin', content: 'Buenas', type: 'CHAT' });
    expect(component.texto).toBe('');
  });

  it('does not send empty text or while disconnected', () => {
    entrarComo('Kevin');
    component.texto = 'Hola';
    component.enviar();
    avisosDelServicio().alConectar();
    component.texto = '   ';
    component.enviar();

    expect(servicio.sendMessage).not.toHaveBeenCalled();
  });

  it('shows who is typing but ignores the own user', () => {
    entrarComo('Kevin');
    const { alEscribir } = avisosDelServicio();
    alEscribir({ sender: 'Kevin', content: '', type: 'TYPING' });
    expect(component.typingUser()).toBe('');
    alEscribir({ sender: 'Ana', content: '', type: 'TYPING' });
    expect(component.typingUser()).toBe('Ana');
  });

  it('gives the same color to the same name', () => {
    expect(component.colorDe('Ana')).toBe(component.colorDe('Ana'));
  });

  it('goes back to the start when leaving', () => {
    entrarComo('Kevin');
    component.salir();
    expect(servicio.disconnect).toHaveBeenCalled();
    expect(component.estado()).toBe('inicio');
  });
});
