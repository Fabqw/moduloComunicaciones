import { useState, useEffect } from "react";
import { useChat } from "./hooks/useChat";

function App() {
  const [roomName, setRoomName] = useState("General");
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [input, setInput] = useState("");

  const { messages, rooms, currentUser, sendMessage, changeRoom, getRooms } =
    useChat(roomName, username);

  useEffect(() => {
    if (isLoggedIn) {
      getRooms();
    }
  }, [isLoggedIn, getRooms]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() !== "") {
      setIsLoggedIn(true);
    }
  };

  const handleSend = () => {
    if (input.trim() !== "") {
      sendMessage(input);
      setInput("");
    }
  };

  const handleChangeRoom = (newRoom: string) => {
    setRoomName(newRoom);
    changeRoom(newRoom);
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Pantalla de login con estilos del CSS
  if (!isLoggedIn) {
    return (
      <div className="tg-login">
        <div className="tg-login-card">
          <div className="tg-login-icon">💬</div>
          <h1>Telegram Chat</h1>
          <p>Conéctate con tus amigos</p>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu nombre de usuario"
              required
            />
            <button type="submit">Iniciar sesión</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="tg-shell">
      {/* Sidebar */}
      <aside className="tg-sidebar">
        {/* Header del sidebar */}
        <div className="tg-sidebar-header">
          <div className="tg-user">
            <div className="tg-avatar">{getInitials(username)}</div>
            <div className="tg-user-meta">
              <span className="name">{username}</span>
              <span className="status online">en línea</span>
            </div>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="tg-search-wrap">
          <input type="text" className="tg-search" placeholder="Buscar..." />
          <button className="tg-refresh" onClick={getRooms}>
            🔄
          </button>
        </div>

        {/* Lista de salas */}
        <div className="tg-room-list">
          {rooms.map((room) => (
            <button
              key={room.name}
              onClick={() => handleChangeRoom(room.name)}
              className={`tg-room-item ${
                roomName === room.name ? "active" : ""
              }`}
            >
              <div className="room-avatar">{getInitials(room.name)}</div>
              <div className="room-body">
                <div className="room-row">
                  <span className="room-name">{room.name}</span>
                  <span>
                    {room.lastActivity ? formatTime(room.lastActivity) : "---"}
                  </span>
                </div>
                <div className="room-row sub">
                  <span>{room.description || "Sala de chat"}</span>
                  {room.unreadCount > 0 && (
                    <span className="badge">{room.unreadCount}</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Botón nueva sala */}
        <div className="tg-new-room">
          <button
            onClick={() => {
              const newRoomName = prompt("Nombre del nuevo chat:");
              if (newRoomName?.trim()) {
                handleChangeRoom(newRoomName.trim());
              }
            }}
          >
            + Nuevo Chat
          </button>
        </div>
      </aside>

      {/* Chat principal */}
      <main className="tg-main">
        {/* Header del chat */}
        <header className="tg-chat-header">
          <div className="chat-info">
            <div className="chat-avatar">{getInitials(roomName)}</div>
            <div>
              <h2>#{roomName}</h2>
              <div className="sub">
                {rooms.find((r) => r.name === roomName)?.description ||
                  "Sala de chat"}
              </div>
            </div>
          </div>
        </header>

        {/* Mensajes */}
        <div className="tg-messages">
          {messages.length === 0 ? (
            <div className="tg-empty">
              <p>No hay mensajes aún</p>
              <p>¡Sé el primero en escribir algo!</p>
            </div>
          ) : (
            <>
              <div className="tg-day-separator">
                <span>Hoy</span>
              </div>
              {messages.map((m, index) => {
                const isOwnMessage = m.username === currentUser?.username;
                const showAvatar =
                  !isOwnMessage &&
                  (index === 0 || messages[index - 1].username !== m.username);
                const addMarginTop =
                  index === 0 || messages[index - 1].username !== m.username;

                return (
                  <div
                    key={m.id}
                    className={`tg-msg-row ${isOwnMessage ? "own" : ""}`}
                  >
                    {!isOwnMessage && (
                      <div className="tg-msg-avatar">
                        {showAvatar && (
                          <img
                            src={
                              m.avatar ||
                              `https://ui-avatars.com/api/?name=${m.username}&background=2b5278&color=fff`
                            }
                            alt="avatar"
                          />
                        )}
                      </div>
                    )}
                    <div className={`tg-bubble ${addMarginTop ? "mt" : ""}`}>
                      {!isOwnMessage && showAvatar && (
                        <div className="sender">{m.username}</div>
                      )}
                      <div className="content">{m.content}</div>
                      <div className="meta">{formatTime(m.timestamp)}</div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Barra de entrada */}
        <div className="tg-input-bar">
          <div className="tg-input-wrap">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Escribe un mensaje..."
            />
          </div>
          <button
            onClick={handleSend}
            className="tg-send"
            disabled={!input.trim()}
          >
            ➤
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
