import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";
import vbitLogo from "./assets/vbit-logo.png";

// =====================================
// CONNECT TO LIVE RENDER SERVER
// =====================================

const socket = io("https://connectupvbit-server.onrender.com", {
  autoConnect: true,
  reconnection: true,
});

// =====================================
// APP
// =====================================

function App() {
  const [screen, setScreen] = useState("home");
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [connected, setConnected] = useState(false);
  const [skipState, setSkipState] = useState("skip");

  const typingTimeout = useRef(null);

  // =====================================
  // SOCKET EVENTS
  // =====================================

  useEffect(() => {
    // -----------------------------------
    // CONNECT
    // -----------------------------------

    const onConnect = () => {
      console.log("Connected to server:", socket.id);
    };

    // -----------------------------------
    // DISCONNECT
    // -----------------------------------

    const onDisconnect = () => {
      console.log("Disconnected from server");

      setConnected(false);
      setIsTyping(false);
    };

    // -----------------------------------
    // ONLINE USERS
    // -----------------------------------

    const onOnlineUsers = (count) => {
      setOnlineUsers(count);
    };

    // -----------------------------------
    // WAITING
    // -----------------------------------

    const onWaiting = () => {
      console.log("Waiting for stranger...");

      setScreen("search");
      setConnected(false);
      setIsTyping(false);
      setSkipState("skip");
    };

    // -----------------------------------
    // MATCHED
    // -----------------------------------

    const onMatched = () => {
      console.log("Stranger matched!");

      setScreen("chat");
      setConnected(true);
      setMessages([]);
      setMessage("");
      setIsTyping(false);
      setSkipState("skip");
    };

    // -----------------------------------
    // RECEIVE MESSAGE
    // -----------------------------------

    const onReceiveMessage = (data) => {
      const text =
        typeof data === "string"
          ? data
          : data?.message || data?.text || "";

      if (!text) {
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          text: text,
          sender: "stranger",
        },
      ]);
    };

    // -----------------------------------
    // STRANGER TYPING
    // -----------------------------------

    const onStrangerTyping = () => {
      setIsTyping(true);
    };

    // -----------------------------------
    // STRANGER STOP TYPING
    // -----------------------------------

    const onStrangerStopTyping = () => {
      setIsTyping(false);
    };

    // -----------------------------------
    // STRANGER DISCONNECTED
    // -----------------------------------

    const onStrangerDisconnected = () => {
      console.log("Stranger has disconnected");

      setConnected(false);
      setIsTyping(false);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          text: "Stranger has disconnected.",
          sender: "system",
        },
      ]);

      // Same button becomes NEXT
      setSkipState("next");
    };

    // -----------------------------------
    // YOU DISCONNECTED
    // -----------------------------------

    const onYouDisconnected = () => {
      console.log("You have disconnected");

      setConnected(false);
      setIsTyping(false);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          text: "You have disconnected.",
          sender: "system",
        },
      ]);

      // Same button becomes NEXT
      setSkipState("next");
    };

    // =====================================
    // REGISTER SOCKET EVENTS
    // =====================================

    socket.on("connect", onConnect);

    socket.on("disconnect", onDisconnect);

    socket.on(
      "online_users",
      onOnlineUsers
    );

    socket.on(
      "waiting",
      onWaiting
    );

    socket.on(
      "matched",
      onMatched
    );

    socket.on(
      "receive_message",
      onReceiveMessage
    );

    socket.on(
      "stranger_typing",
      onStrangerTyping
    );

    socket.on(
      "stranger_stop_typing",
      onStrangerStopTyping
    );

    socket.on(
      "stranger_disconnected",
      onStrangerDisconnected
    );

    socket.on(
      "you_disconnected",
      onYouDisconnected
    );

    // =====================================
    // CLEANUP
    // =====================================

    return () => {
      socket.off("connect", onConnect);

      socket.off(
        "disconnect",
        onDisconnect
      );

      socket.off(
        "online_users",
        onOnlineUsers
      );

      socket.off(
        "waiting",
        onWaiting
      );

      socket.off(
        "matched",
        onMatched
      );

      socket.off(
        "receive_message",
        onReceiveMessage
      );

      socket.off(
        "stranger_typing",
        onStrangerTyping
      );

      socket.off(
        "stranger_stop_typing",
        onStrangerStopTyping
      );

      socket.off(
        "stranger_disconnected",
        onStrangerDisconnected
      );

      socket.off(
        "you_disconnected",
        onYouDisconnected
      );
    };
  }, []);

  // =====================================
  // START / FIND STRANGER
  // =====================================

  const startChat = () => {
    console.log("Finding stranger...");

    setMessages([]);
    setMessage("");
    setIsTyping(false);
    setConnected(false);
    setSkipState("skip");

    setScreen("search");

    // EXACT SERVER EVENT
    socket.emit("find_stranger");
  };

  // =====================================
  // SEND MESSAGE
  // =====================================

  const sendMessage = () => {
    const text = message.trim();

    if (!text) {
      return;
    }

    if (!connected) {
      return;
    }

    console.log("Sending message:", text);

    // Send to stranger
    socket.emit(
      "send_message",
      text
    );

    // Show own message
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        text: text,
        sender: "me",
      },
    ]);

    setMessage("");

    socket.emit(
      "stop_typing"
    );
  };

  // =====================================
  // TYPING
  // =====================================

  const handleTyping = (e) => {
    const value = e.target.value;

    setMessage(value);

    if (!connected) {
      return;
    }

    if (value.length > 0) {
      socket.emit("typing");
    } else {
      socket.emit("stop_typing");
    }

    clearTimeout(
      typingTimeout.current
    );

    typingTimeout.current =
      setTimeout(() => {
        socket.emit(
          "stop_typing"
        );
      }, 900);
  };

  // =====================================
  // SKIP / SURE / NEXT
  // =====================================

  const handleSkip = () => {
    // -----------------------------------
    // SKIP
    // -----------------------------------

    if (skipState === "skip") {
      setSkipState("confirm");
      return;
    }

    // -----------------------------------
    // SURE?
    // -----------------------------------

    if (skipState === "confirm") {
      console.log(
        "Skipping current stranger..."
      );

      socket.emit(
        "next_stranger"
      );

      return;
    }

    // -----------------------------------
    // NEXT
    // -----------------------------------

    if (skipState === "next") {
      console.log(
        "Finding next stranger..."
      );

      startChat();
    }
  };

  // =====================================
  // BACK TO HOME
  // =====================================

  const handleBackToHome = () => {
    socket.emit(
      "stop_search"
    );

    setMessages([]);
    setMessage("");
    setIsTyping(false);
    setConnected(false);
    setSkipState("skip");

    setScreen("home");
  };

  // =====================================
  // BUTTON TEXT
  // =====================================

  const getSkipText = () => {
    if (skipState === "confirm") {
      return "Sure?";
    }

    if (skipState === "next") {
      return "Next";
    }

    return "Skip";
  };

  // =====================================
  // UI
  // =====================================

  return (
    <div className="app">

      {/* BACKGROUND */}

      <div className="background-glow glow-one"></div>

      <div className="background-glow glow-two"></div>


      <main className="chat-container">

        {/* =================================
            HEADER
        ================================= */}

        <header className="app-header">

          <div className="brand">

            <div className="brand-icon">

              <img
                src={vbitLogo}
                alt="VBIT Logo"
              />

            </div>

            <div>

              <h1>
                ConnectUpVBIT
              </h1>

              <span>
                Stranger conversations
              </span>

            </div>

          </div>


          <div className="online-pill">

            <span className="online-dot"></span>

            <strong>
              {onlineUsers}
            </strong>

            <span>
              online
            </span>

          </div>

        </header>


        {/* =================================
            HOME SCREEN
        ================================= */}

        {screen === "home" && (

          <section className="welcome-screen">

            <div className="welcome-icon">
              👋
            </div>


            <div className="eyebrow">
              VBIT COMMUNITY
            </div>


            <h2>

              Find someone
              <br />

              <span>
                new.
              </span>

            </h2>


            <p>
              Start a random conversation
              with someone from your college.
            </p>


            {/* FIND SOMEONE NEW */}

            <div className="find-new-card">

              <div className="find-new-content">

                <div className="find-new-text">

                  <h3>
                    Find someone new
                  </h3>

                  <p>
                    Meet a stranger and start
                    talking in seconds.
                  </p>

                </div>


                <div className="avatar-stack">

                  <div className="mini-avatar">
                    A
                  </div>

                  <div className="mini-avatar">
                    S
                  </div>

                  <div className="mini-avatar">
                    V
                  </div>

                  <div className="mini-avatar">
                    +
                  </div>

                </div>

              </div>

            </div>


            {/* START BUTTON */}

            <button
              className="primary-btn"
              onClick={startChat}
            >

              <span>
                Start
              </span>

              <span className="btn-arrow">
                →
              </span>

            </button>

          </section>

        )}


        {/* =================================
            SEARCH SCREEN
        ================================= */}

        {screen === "search" && (

          <section className="search-screen">

            <div className="search-animation">

              <div className="pulse-ring"></div>

              <div className="search-orb">
                ✦
              </div>

            </div>


            <h2>

              Finding someone
              <br />

              <span>
                new...
              </span>

            </h2>


            <p>

              Looking for someone from
              the VBIT community to chat with.

            </p>


            <div className="search-status">

              <span></span>

              Searching for a stranger

            </div>


            <button
              className="cancel-btn-modern"
              onClick={handleBackToHome}
            >
              Cancel
            </button>

          </section>

        )}


        {/* =================================
            CHAT SCREEN
        ================================= */}

        {screen === "chat" && (

          <section className="chat-screen">

            {/* STRANGER HEADER */}

            <div className="stranger-header">

              <div className="stranger-profile">

                <div className="avatar">
                  Stranger
                </div>


                <div>

                  <h3>
                    Stranger
                  </h3>


                  <span>

                    <i></i>

                    {connected
                      ? "Online"
                      : "Disconnected"}

                  </span>

                </div>

              </div>

            </div>


            {/* =================================
                MESSAGES
            ================================= */}

            <div className="messages">

              {/* EMPTY CHAT */}

              {messages.length === 0 &&
                connected && (

                  <div className="system-intro">

                    You are connected
                    with a stranger.

                    <br />

                    Say hello 👋

                  </div>

                )}


              {/* MESSAGE LIST */}

              {messages.map((item) => {

                // SYSTEM MESSAGE
                if (
                  item.sender === "system"
                ) {

                  return (

                    <div
                      key={item.id}
                      className="system-row"
                    >

                      <div className="system-message">

                        {item.text}

                      </div>

                    </div>

                  );

                }


                // NORMAL MESSAGE

                return (

                  <div
                    key={item.id}
                    className={`message-row ${
                      item.sender === "me"
                        ? "mine"
                        : "theirs"
                    }`}
                  >

                    {/* STRANGER LABEL */}

                    {item.sender ===
                      "stranger" && (

                      <span className="stranger-label">
                        Stranger
                      </span>

                    )}


                    <div
                      className={`message ${
                        item.sender === "me"
                          ? "my-message"
                          : "stranger-message"
                      }`}
                    >

                      {item.text}

                    </div>

                  </div>

                );

              })}


              {/* =================================
                  TYPING INDICATOR
              ================================= */}

              {isTyping &&
                connected && (

                  <div className="typing-row">

                    <div className="typing-bubble">

                      <span></span>
                      <span></span>
                      <span></span>

                    </div>


                    <span className="typing-text">

                      Stranger is typing...

                    </span>

                  </div>

                )}

            </div>


            {/* =================================
                BOTTOM MESSAGE AREA
            ================================= */}

            <div className="bottom-area">

              <div className="input-wrapper">

                {/* SKIP / SURE / NEXT */}

                <button
                  className={`skip-btn ${
                    skipState === "confirm"
                      ? "confirm"
                      : skipState === "next"
                      ? "next"
                      : ""
                  }`}
                  onClick={handleSkip}
                >

                  {getSkipText()}

                </button>


                {/* MESSAGE INPUT */}

                <div
                  className={`message-input ${
                    !connected
                      ? "disabled-input"
                      : ""
                  }`}
                >

                  <input
                    type="text"
                    value={message}
                    onChange={handleTyping}
                    onKeyDown={(e) => {

                      if (
                        e.key === "Enter"
                      ) {

                        sendMessage();

                      }

                    }}
                    placeholder={
                      connected
                        ? "Type a message..."
                        : "Disconnected"
                    }
                    disabled={!connected}
                  />


                  {/* SEND */}

                  <button
                    className="send-btn"
                    onClick={sendMessage}
                    disabled={
                      !connected ||
                      !message.trim()
                    }
                  >

                    ↑

                  </button>

                </div>

              </div>

            </div>

          </section>

        )}

      </main>

    </div>
  );
}

export default App;