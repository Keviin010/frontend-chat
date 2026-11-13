# frontend-chat

Interfaz de un chat en tiempo real hecha con Angular 21, SockJS y @stomp/stompjs.

**Demo en línea:** https://frontend-chat-3rd4.vercel.app/

El demo corre en planes gratuitos. Si nadie lo visitó en los últimos 15 minutos, el servidor tarda cerca de un minuto en despertar y la pantalla muestra "Conectando" hasta que lo logra.

![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=flat&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)
![SockJS](https://img.shields.io/badge/SockJS-1.6-000000?style=flat&logo=socketdotio&logoColor=white)
![StompJS](https://img.shields.io/badge/StompJS-7-000000?style=flat&logo=socketdotio&logoColor=white)

Backend: [backend-chat](https://github.com/Keviin010/backend-chat) (Spring Boot, WebSocket, STOMP y PostgreSQL).

## Qué hace

- Pide un nombre y entra a una sala compartida con todos los usuarios.
- Envía y recibe mensajes en tiempo real.
- Muestra el historial de los últimos 50 mensajes al entrar.
- Avisa cuando alguien entra, se va o está escribiendo.
- Muestra la hora de cada mensaje y un color distinto por usuario.
- Baja sola hasta el último mensaje.
- Si el servidor está dormido o se cae, lo indica y reintenta la conexión cada 4 segundos. Si no logra conectar tras 20 intentos, ofrece un botón para reintentar.

## Tecnologías

Angular 21 con signals, TypeScript, SockJS, @stomp/stompjs y Vitest.

## Cómo ejecutarlo en tu computador

1. Instala las dependencias:

```bash
npm install
```

2. Ejecuta la aplicación:

```bash
npm start
```

La aplicación queda en `http://localhost:4200` y se conecta al backend en `http://localhost:8080`.

3. Pruebas:

```bash
npm test
```

## Dirección del backend

La dirección del servidor está en `src/app/config.ts`. En `localhost` usa `http://localhost:8080`. En cualquier otra dirección usa la del servicio en Render. Si cambias el servicio del backend, cambia esa dirección y vuelve a desplegar.

## Despliegue

El demo en línea usa tres servicios gratuitos:

| Parte | Servicio |
| --- | --- |
| Frontend | Vercel |
| Backend | Render, construido con el `Dockerfile` del repositorio backend-chat |
| Base de datos | Neon (PostgreSQL) |

Para publicar el frontend en Vercel:

1. Importa este repositorio en Vercel. Detecta Angular solo y deja el Root Directory en `./`.
2. Pulsa Deploy.
3. Si el backend no acepta tu dirección, agrégala en la variable `FRONTEND_URL` del backend. Por defecto acepta cualquier dirección `*.vercel.app`.

## Autor

Kevin Dair Royo Cuesta
