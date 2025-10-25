import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { initializeAgent } from './agent';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // URL of the Vite dev server
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);

  // Initialize agent logic for this client connection
  initializeAgent(socket);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
