# Некий mock веб-сокет сервер на Socket.IO

[Дока socket.io](https://socket.io/docs/v3/)

В качестве пакетного менеджера используется Bun, как установить на винде - [Дока Bun](https://bun.sh/docs/installation#windows)

## Как завести?

Все крайне просто

```bash
bun install
```

```bash
bun start:dev
```

## Подключение со стороны клиента

```typescript
export const socket = io('http://localhost:8080/test', {
  transports: ['websocket'],
});
```

### Функционал 

- Event > user:registerTeam - для регистрации команды соответственно
- Event > user:verifyCode - для верификации кода
- Event > game:start - А-ля начало игры.

Все тела запросов можно в коде глянуть, сваггера не будет, так как ws он не поддерживает🤡.

Вопросы, предложения, пятое и десятое - issue или [telega](https://t.me/goodnight_left_side)
