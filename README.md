# frontend-chat

> **En construcción** —  proyecto en desarrollo activo.

Frontend del chat en tiempo real construido con Angular, SockJS y STOMP.

![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=flat&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)
![SockJS](https://img.shields.io/badge/SockJS-1.6-000000?style=flat&logo=socketdotio&logoColor=white)
![StompJS](https://img.shields.io/badge/StompJS-2.3-000000?style=flat&logo=socketdotio&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-24-339933?style=flat&logo=nodedotjs&logoColor=white)

## Tecnologías

- Angular 21
- TypeScript
- SockJS
- StompJS

## Repositorio backend

[backend-chat](https://github.com/Keviin010/backend-chat) — Spring Boot + WebSocket + STOMP + MySQL

## Funcionalidades

- [x] Conexión al servidor WebSocket
- [x] Envío y recepción de mensajes en tiempo real
- [x] Notificación cuando un usuario se une o se va
- [x] Indicador de "está escribiendo"
- [x] Colores únicos por usuario

## Cómo ejecutar

1. Instalar dependencias:

```bash
npm install
```

2. Ejecutar la aplicación:

```bash
ng serve
```

La app levanta en `http://localhost:4200`. Requiere el backend corriendo en `http://localhost:8080`.

## Estado

Proyecto en construcción — se irán agregando funcionalidades progresivamente.
