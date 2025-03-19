import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });
let clientCount = 0;

wss.on("connection", function connection(ws) {
  clientCount++;
  console.log(`Client connected: ${clientCount}`);

  // Send updated client count to all clients
  broadcastClientCount();

  ws.on("message", function message(data) {
    console.log("Received:", data.toString());

    // Broadcast received message to all clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data.toString());
      }
    });
  });

  ws.on("close", () => {
    clientCount--;
    console.log(`Client disconnected: ${clientCount}`);
    broadcastClientCount();
  });
});

function broadcastClientCount() {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: "clientCount", count: clientCount }));
    }
  });
}

console.log("WebSocket server running on ws://localhost:8080");
