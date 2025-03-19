import { WebSocketServer } from 'ws';
const wss = new WebSocketServer({ port:8080 });

let clientCount = 0;

// Broadcast to all clients
function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// Send client count to all clients
function broadcastClientCount() {
  broadcast(JSON.stringify({
    type: 'clientCount',
    count: clientCount
  }));
}

wss.on('connection', function connection(ws) {
  clientCount++;
  console.log(`Client connected: ${clientCount}`);
  
  // Send current client count to the new client
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
