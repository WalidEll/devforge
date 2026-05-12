---
title: "WebSocket Protocol Guide"
slug: "websocket-protocol-guide"
description: "Understand how WebSockets work, when to use them over HTTP, and how to implement real-time bidirectional communication in your applications."
category: "web"
difficulty: "intermediate"
keywords:
  - websocket
  - real-time communication
  - ws protocol
  - bidirectional communication
  - http upgrade
  - server-sent events
icon: "WS"
readingTime: 8
date: "2026-05-08"
relatedSlugs:
  - rest-api-design-basics
  - http-status-codes-explained
toolSlugs: []
---

## What WebSockets Solve

HTTP is request-response: the client asks, the server answers, and the connection closes. For real-time features — chat, live dashboards, collaborative editing, multiplayer games — polling HTTP is wasteful. Each poll opens a new TCP connection, sends headers, waits, and closes. At high frequency this burns CPU and bandwidth on both sides.

**WebSocket** upgrades an existing HTTP connection into a persistent, full-duplex channel. Once open, either side can send a frame at any time without the overhead of a new handshake. A single TCP connection replaces hundreds of polling requests.

## The Handshake

WebSocket starts as HTTP. The client sends an `Upgrade` request; if the server agrees, it responds with `101 Switching Protocols` and both sides flip into WebSocket framing mode.

```http
GET /chat HTTP/1.1
Host: example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
```

After the server replies with `101 Switching Protocols`, HTTP is gone. The connection is now a raw WebSocket stream and either side can send frames at any time.

## Implementing a WebSocket Server

Node.js `ws` is the minimal, dependency-light choice. For production use with rooms, namespaces, and automatic reconnection, Socket.IO wraps `ws` with a higher-level API.

```javascript
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (socket) => {
  socket.on("message", (data) => {
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data.toString());
      }
    }
  });
});
```

## Browser API

The browser `WebSocket` constructor connects synchronously but the handshake is async. Attach event handlers before the connection opens or you may miss early messages.

```javascript
const ws = new WebSocket("wss://example.com/chat");

ws.addEventListener("open", () => ws.send(JSON.stringify({ type: "join" })));
ws.addEventListener("message", (event) => {
  const msg = JSON.parse(event.data);
  console.log("received:", msg);
});
ws.addEventListener("close", (event) => {
  console.log("closed:", event.code, event.reason);
});
```

## When Not to Use WebSockets

WebSockets are not always the right tool:

- **Simple notifications to the client** — use **Server-Sent Events (SSE)** instead. SSE is unidirectional, works over plain HTTP/2, and reconnects automatically.
- **Infrequent updates** — polling every 30 seconds is simpler to deploy and debug than a persistent socket.
- **Multiple server instances** — WebSockets require sticky sessions or a pub/sub broker (Redis, NATS) to work across instances. Plan for this before scaling horizontally.

Use WebSockets when you need **low-latency bidirectional messaging** at high frequency and the infrastructure complexity is justified.

## Production Considerations

Running WebSockets at scale introduces operational concerns that HTTP endpoints don't have:

- **Connection limits** — each open socket holds a file descriptor. Tune `ulimit -n` and `net.core.somaxconn` for high-concurrency servers.
- **Heartbeats** — proxies (nginx, AWS ALB) time out idle connections. Send a ping frame every 25–30 seconds to keep them alive.
- **Graceful shutdown** — send a `1001 Going Away` close frame and drain open sockets before restarting the server process.
- **TLS** — always use `wss://` in production. Plain `ws://` traffic is trivially intercepted.
