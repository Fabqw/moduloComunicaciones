import { io } from "socket.io-client";

// Conecta al backend (ajusta según el puerto de tu servidor)
export const socket = io("http://localhost:3001", {
  transports: ["websocket"],
  autoConnect: true,
});
