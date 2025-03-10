import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
  console.log('Client connected');

  ws.on('message', function message(data) {
    console.log('Received:', data.toString());

    wss.clients.forEach(client => {
      if (client.readyState === ws.OPEN) {
        client.send(data.toString());
      }
    });
  });

  ws.on('close', () => console.log('Client disconnected'));
});

console.log('WebSocket server running on ws://localhost:8080');
