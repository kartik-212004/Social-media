import { WebSocketServer } from 'ws';
import { WebSocket } from 'ws';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 8081;

const wss = new WebSocketServer({ port:8080 });

let clientCount = 0;

function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

function broadcastClientCount() {
  broadcast(JSON.stringify({
    type: 'clientCount',
    count: clientCount
  }));
}

wss.on('connection', function connection(ws) {
  clientCount++;
  console.log(`Client connected: ${clientCount}`);
  
  broadcastClientCount();

  ws.on('message', function message(data) {
    console.log('Received:', data.toString());
    broadcast(data.toString());
  });

  ws.on('close', () => {
    clientCount--;
    console.log(`Client disconnected: ${clientCount}`);
    broadcastClientCount();
  });
});

app.get('/', (req, res) => {
  res.send('WebSocket server is running');
});

app.listen(PORT, () => {
  console.log(`HTTP server listening on port ${PORT}`);
});

console.log('WebSocket server initialized on port 8080');
