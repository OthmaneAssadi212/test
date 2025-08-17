export const runtime = 'edge';

const clients = new Set<WebSocket>();

export async function GET(request: Request) {
  if (request.headers.get('upgrade') !== 'websocket') {
    return new Response('Expected websocket', { status: 400 });
  }
  const { 0: client, 1: server } = Object.values(new WebSocketPair());
  server.accept();
  clients.add(server);

  server.addEventListener('message', event => {
    clients.forEach(ws => {
      try {
        ws.send(event.data);
      } catch (err) {
        // ignore broken connections
      }
    });
  });

  server.addEventListener('close', () => {
    clients.delete(server);
  });

  return new Response(null, { status: 101, webSocket: client });
}
