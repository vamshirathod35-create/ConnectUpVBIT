import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";
import vbitLogo from "./assets/vbit-logo.png";

// =====================================
// LIVE BACKEND
// =====================================

const socket = io(
  "https://connectupvbit-server.onrender.com",
  {
    autoConnect: true,
    reconnection: true,
  }
);

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

  // =====================================
  // INTERNET STATUS
  // =====================================

  const [isOnline, setIsOnline] = useState(
    navigator.onLine
  );

  const [showBackOnline, setShowBackOnline] =
    useState(false);

  const typingTimeout = useRef(null);

  // =====================================
  // INTERNET CONNECTION CHECK
  // =====================================

  useEffect(() => {
    const handleOffline = () => {
      console.log("Internet disconnected");

      setIsOnline(false);
      setShowBackOnline(false);
    };

    const handleOnline = () => {
      console.log("Internet connected");

      setIsOnline(true);
      setShowBackOnline(true);

      // Hide "Back online" after 3 seconds
      setTimeout(() => {
        setShowBackOnline(false);
      }, 3000);

      // Reconnect socket if needed
      if (!socket.connected) {
        socket.connect();
      }
    };

    window.addEventListener(
      "offline",
      handleOffline
    );

    window.addEventListener(
      "online",
      handleOnline
    );

    return () => {
      window.removeEventListener(
        "offline",
        handleOffline
      );

      window.removeEventListener(
        "online",
        handleOnline
      );
    };
  }, []);

  // =====================================
  // SOCKET EVENTS
  // =====================================

  useEffect(() => {
    const onConnect = () => {
      console.log(
        "Connected to server:",
        socket.id
      );
    };

    const onDisconnect = () => {
      console.log(
        "Disconnected from server"
      );

      setConnected(false);
      setIsTyping(false);
    };

    const onOnlineUsers = (count) => {
      setOnlineUsers(count);
    };

    const onWaiting = () => {
      console.log(
        "Waiting for stranger..."
      );

      setScreen("search");

      setConnected(false);

      setIsTyping(false);

      setSkipState("skip");
    };

    const onMatched = () => {
      console.log(
        "Stranger matched!"
      );

      setScreen("chat");

      setConnected(true);

      setMessages([]);

      setMessage("");

      setIsTyping(false);

      setSkipState("skip");
    };

    const onReceiveMessage = (data) => {
      const text =
        typeof data === "string"
          ? data
          : data?.message ||
            data?.text ||
            "";

      if (!text) {
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id:
            Date.now() +
            Math.random(),
          text: text,
          sender: "stranger",
        },
      ]);
    };

    const onStrangerTyping = () => {
      setIsTyping(true);
    };

    const onStrangerStopTyping = () => {
      setIsTyping(false);
    };

    const onStrangerDisconnected = () => {
      console.log(
        "Stranger disconnected"
      );

      setConnected(false);

      setIsTyping(false);

      setMessages((prev) => [
        ...prev,
        {
          id:
            Date.now() +
            Math.random(),
          text:
            "Stranger has disconnected.",
          sender: "system",
        },
      ]);

      setSkipState("next");
    };

    const onYouDisconnected = () => {
      console.log(
        "You disconnected"
      );

      setConnected(false);

      setIsTyping(false);

      setMessages((prev) => [
        ...prev,
        {
          id:
            Date.now() +
            Math.random(),
          text:
            "You have disconnected.",
          sender: "system",
        },
      ]);

      setSkipState("next");
    };

    // =====================================
    // REGISTER EVENTS
    // =====================================

    socket.on(
      "connect",
      onConnect
    );

    socket.on(
      "disconnect",
      onDisconnect
    );

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
      socket.off(
        "connect",
        onConnect
      );

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
  // START CHAT
  // =====================================

  const startChat = () => {
    // Don't start without internet
    if (!isOnline) {
      return;
    }

    console.log(
      "Finding stranger..."
    );

    setMessages([]);

    setMessage("");

    setIsTyping(false);

    setConnected(false);

    setSkipState("skip");

    setScreen("search");

    socket.emit(
      "find_stranger"
    );
  };

  // =====================================
  // SEND MESSAGE
  // =====================================

  const sendMessage = () => {
    const text =
      message.trim();

    if (!text) {
      return;
    }

    if (!connected) {
      return;
    }

    if (!isOnline) {
      return;
    }

    socket.emit(
      "send_message",
      text
    );

    setMessages((prev) => [
      ...prev,
      {
        id:
          Date.now() +
          Math.random(),
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
    const value =
      e.target.value;

    setMessage(value);

    if (!connected) {
      return;
    }

    if (!isOnline) {
      return;
    }

    if (value.length > 0) {
      socket.emit(
        "typing"
      );
    } else {
      socket.emit(
        "stop_typing"
      );
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
  // SKIP
  // =====================================

  const handleSkip = () => {
    if (!isOnline) {
      return;
    }

    if (
      skipState === "skip"
    ) {
      setSkipState(
        "confirm"
      );

      return;
    }

    if (
      skipState === "confirm"
    ) {
      socket.emit(
        "next_stranger"
      );

      return;
    }

    if (
      skipState === "next"
    ) {
      startChat();
    }
  };

  // =====================================
  // BACK HOME
  // =====================================

  const handleBackToHome =
    () => {
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
    if (
      skipState === "confirm"
    ) {
      return "Sure?";
    }

    if (
      skipState === "next"
    ) {
      return "Next";
    }

    return "Skip";
  };

  // =====================================
  // UI
  // =====================================

  return (
    <div className="app">

      {/* =================================
          INTERNET WARNING
      ================================= */}

      {!isOnline && (
        <div className="internet-warning">

          <div className="internet-warning-icon">
            !
          </div>

          <div>
            <strong>
              No Internet Connection
            </strong>

            <span>
              Please check your internet connection.
            </span>
          </div>

        </div>
      )}

      {/* =================================
          BACK ONLINE
      ================================= */}

      {isOnline &&
        showBackOnline && (
          <div className="internet-success">

            <div className="internet-success-icon">
              ✓
            </div>

            <div>
              <strong>
                Back Online
              </strong>

              <span>
                Your internet connection is restored.
              </span>
            </div>

          </div>
        )}

      {/* =================================
          BACKGROUND
      ================================= */}

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
            HOME
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


            <button
              className="primary-btn"
              onClick={startChat}
              disabled={!isOnline}
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
            SEARCH
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
              onClick={
                handleBackToHome
              }
            >
              Cancel
            </button>

          </section>

        )}


        {/* =================================
            CHAT
        ================================= */}

        {screen === "chat" && (

          <section className="chat-screen">

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

              {messages.length === 0 &&
                connected && (

                  <div className="system-intro">

                    You are connected
                    with a stranger.

                    <br />

                    Say hello 👋

                  </div>

                )}


              {messages.map(
                (item) => {

                  if (
                    item.sender ===
                    "system"
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


                  return (

                    <div
                      key={item.id}
                      className={`message-row ${
                        item.sender ===
                        "me"
                          ? "mine"
                          : "theirs"
                      }`}
                    >

                      {item.sender ===
                        "stranger" && (

                        <span className="stranger-label">
                          Stranger
                        </span>

                      )}


                      <div
                        className={`message ${
                          item.sender ===
                          "me"
                            ? "my-message"
                            : "stranger-message"
                        }`}
                      >

                        {item.text}

                      </div>

                    </div>

                  );

                }
              )}


              {/* =================================
                  TYPING
              ================================= */}

              {isTyping &&
                connected &&
                isOnline && (

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
                MESSAGE INPUT
            ================================= */}

            <div className="bottom-area">

              <div className="input-wrapper">

                <button
                  className={`skip-btn ${
                    skipState ===
                    "confirm"
                      ? "confirm"
                      : skipState ===
                        "next"
                      ? "next"
                      : ""
                  }`}
                  onClick={
                    handleSkip
                  }
                  disabled={!isOnline}
                >

                  {getSkipText()}

                </button>


                <div
                  className={`message-input ${
                    !connected ||
                    !isOnline
                      ? "disabled-input"
                      : ""
                  }`}
                >

                  <input
                    type="text"
                    value={message}
                    onChange={
                      handleTyping
                    }
                    onKeyDown={(e) => {

                      if (
                        e.key ===
                        "Enter"
                      ) {

                        sendMessage();

                      }

                    }}
                    placeholder={
                      !isOnline
                        ? "No internet connection"
                        : connected
                        ? "Type a message..."
                        : "Disconnected"
                    }
                    disabled={
                      !connected ||
                      !isOnline
                    }
                  />


                  <button
                    className="send-btn"
                    onClick={
                      sendMessage
                    }
                    disabled={
                      !connected ||
                      !isOnline ||
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