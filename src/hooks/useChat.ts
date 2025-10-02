import { useEffect, useState } from "react";
import { socket } from "../services/socket";

interface User {
  id: number;
  username: string;
  avatar: string;
}

interface Message {
  id: string;
  content: string;
  username: string;
  avatar: string;
  timestamp: string;
  userId: number;
}

interface Room {
  name: string;
  description: string;
  userCount: number;
  lastActivity: string;
  unreadCount: number;
}

export function useChat(roomName: string, username: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Conectar y unirse como usuario
    socket.emit("join user", {
      username,
      room: roomName,
    });

    // Escuchar cuando el usuario se une exitosamente
    socket.on("user joined", (data: { user: User; room: string }) => {
      setCurrentUser(data.user);
    });

    // Recibir historial de mensajes
    socket.on("message history", (msgs: Message[]) => {
      setMessages(msgs);
    });

    // Recibir nuevos mensajes
    socket.on("chat message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Recibir lista de salas
    socket.on("rooms list", (roomsList: Room[]) => {
      setRooms(roomsList);
    });

    // Notificaciones de usuarios conectándose
    socket.on(
      "user connected",
      (data: { username: string; avatar: string }) => {
        console.log(`${data.username} se conectó`);
      }
    );

    // Notificaciones de usuarios desconectándose
    socket.on("user disconnected", (data: { username: string }) => {
      console.log(`${data.username} se desconectó`);
    });

    return () => {
      socket.off("user joined");
      socket.off("message history");
      socket.off("chat message");
      socket.off("rooms list");
      socket.off("user connected");
      socket.off("user disconnected");
    };
  }, [roomName, username]);

  const sendMessage = (content: string) => {
    if (content.trim()) {
      socket.emit("chat message", content);
    }
  };

  const changeRoom = (newRoomName: string) => {
    socket.emit("join room", newRoomName);
  };

  const getRooms = () => {
    socket.emit("get rooms");
  };

  return {
    messages,
    rooms,
    currentUser,
    sendMessage,
    changeRoom,
    getRooms,
  };
}
