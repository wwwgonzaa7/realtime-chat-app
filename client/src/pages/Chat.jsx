import React, { useEffect, useState } from "react";
import socket from "../services/socket";

function Chat() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [isTyping, setIsTyping] = useState("");

  // 🧑‍💻 pedir nombre al iniciar
  useEffect(() => {
    const name = prompt("Ingresa tu nombre:");
    setUsername(name || "Usuario");

    socket.emit("join", name || "Usuario");
  }, []);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      if (data.id !== socket.id) {
        setChat((prev) => [...prev, data]);
      }
    });

    socket.on("users_list", (list) => {
      setUsers(list);
    });

    // ✍️ ESCUCHANDO "ESCRIBIENDO"
    socket.on("typing", (name) => {
      setIsTyping(name);

      setTimeout(() => {
        setIsTyping("");
      }, 1500);
    });

    return () => {
      socket.off("receive_message");
      socket.off("users_list");
      socket.off("typing");
    };
  }, []);

  const sendMessage = () => {
    if (message.trim() === "") return;

    const data = {
      text: message,
      id: socket.id,
      name: username
    };

    setChat((prev) => [...prev, data]);
    socket.emit("send_message", data);

    setMessage("");
  };

  // ✍️ detectar escritura
  const handleTyping = (e) => {
    setMessage(e.target.value);
    socket.emit("typing", username);
  };

  // 🎨 avatar automático
  const getAvatar = (name) => {
    return `https://ui-avatars.com/api/?name=${name}&background=1e90ff&color=fff`;
  };

  return (
    <div style={styles.app}>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h2 style={styles.logo}>💬 ChatPro</h2>

        {users.map((user, i) => (
          <div key={i} style={styles.user}>
            <img src={getAvatar(user)} alt="" style={styles.avatarImg} />
            <span>{user}</span>
          </div>
        ))}
      </div>

      {/* CHAT */}
      <div style={styles.chatContainer}>

        {/* HEADER */}
        <div style={styles.header}>
          <img src={getAvatar(username)} alt="" style={styles.avatarImg} />
          <span>{username}</span>
        </div>

        {/* MENSAJES */}
        <div style={styles.messages}>
          {chat.map((msg, i) => (
            <div
              key={i}
              style={{
                ...styles.messageContainer,
                justifyContent:
                  msg.id === socket.id ? "flex-end" : "flex-start"
              }}
            >
              {msg.id !== socket.id && (
                <img src={getAvatar(msg.name)} alt="" style={styles.avatarSmall} />
              )}

              <div
                style={{
                  ...styles.message,
                  background:
                    msg.id === socket.id
                      ? "linear-gradient(135deg, #1e90ff, #00c6ff)"
                      : "#2c2c2c"
                }}
              >
                <strong>{msg.name}</strong>
                <div>{msg.text}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ✍️ ESCRIBIENDO */}
        {isTyping && (
          <div style={styles.typing}>
            {isTyping} está escribiendo...
          </div>
        )}

        {/* INPUT */}
        <div style={styles.inputArea}>
          <input
            style={styles.input}
            value={message}
            onChange={handleTyping}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            placeholder="Escribe un mensaje..."
          />

          <button style={styles.button} onClick={sendMessage}>
            ➤
          </button>
        </div>

      </div>
    </div>
  );
}

const styles = {
  app: {
    display: "flex",
    height: "100vh",
    fontFamily: "Segoe UI",
    background: "#0f172a"
  },
  sidebar: {
    width: "260px",
    background: "linear-gradient(180deg, #020617, #0f172a)",
    color: "white",
    padding: "15px",
    boxShadow: "2px 0 10px rgba(0,0,0,0.5)"
  },
  logo: {
    marginBottom: "20px"
  },
  user: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px",
    borderRadius: "10px"
  },
  avatarImg: {
    width: "40px",
    height: "40px",
    borderRadius: "50%"
  },
  avatarSmall: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    marginRight: "5px"
  },
  chatContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column"
  },
  header: {
    padding: "15px",
    background: "#1e293b",
    color: "white",
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  messages: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "15px",
    overflowY: "auto"
  },
  messageContainer: {
    display: "flex",
    alignItems: "flex-end",
    marginBottom: "10px"
  },
  message: {
    padding: "10px",
    borderRadius: "10px",
    color: "white",
    maxWidth: "60%"
  },
  typing: {
    color: "#aaa",
    marginLeft: "15px",
    fontStyle: "italic"
  },
  inputArea: {
    display: "flex",
    padding: "15px",
    background: "#1e293b"
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "20px",
    border: "none",
    outline: "none"
  },
  button: {
    marginLeft: "10px",
    padding: "10px",
    borderRadius: "50%",
    border: "none",
    background: "#1e90ff",
    color: "white",
    cursor: "pointer"
  }
};

export default Chat;