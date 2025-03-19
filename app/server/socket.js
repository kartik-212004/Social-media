import { WebSocketServer } from "ws";
import { WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });
let clientCount = 0;

wss.on("connection", function connection(ws) {
  clientCount++;
  console.log(`Client connected: ${clientCount}`);

  broadcastClientCount();

  ws.on("message", function message(data) {
    try {
      const messageData = JSON.parse(data.toString());
      console.log("Received:", messageData);

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(messageData));
        }
      });
    } catch (error) {
      console.error("Error processing message:", error);
    }
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