import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });
let clientCount = 0;

wss.on('connection', function connection(ws) {
  clientCount++;
  console.log(`Client connected: ${clientCount}`);

  ws.on('message', function message(data) {
    console.log('Received:', data.toString());

    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data.toString());
      }
    });
  });

  ws.on('close', () => {
    clientCount--;
    console.log(`Client disconnected: ${clientCount}`);
  });
});

console.log('WebSocket server running on ws://localhost:8080');
