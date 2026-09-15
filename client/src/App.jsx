import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";
import vbitLogo from "./assets/vbit-logo.png";
import interfaceImage from "./assets/interface.png";

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

const getInfoPageFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const page = params.get("page");

  const validPages = [
    "about",
    "how",
    "safety",
    "privacy",
    "terms",
    "contact",
  ];

  return validPages.includes(page) ? page : null;
};

function App() {
  const initialInfoPage = getInfoPageFromUrl();

  const [screen, setScreen] = useState(
    initialInfoPage ? "info" : "home"
  );

  const [messages, setMessages] = useState([]);

  const [message, setMessage] = useState("");

  const [isTyping, setIsTyping] = useState(false);

  const [onlineUsers, setOnlineUsers] = useState(0);

  const [connected, setConnected] = useState(false);

  const [skipState, setSkipState] = useState("skip");

  // =====================================
  // PUBLIC INFORMATION PAGES
  // =====================================

  const [infoPage, setInfoPage] = useState(initialInfoPage);

  const openInfoPage = (page) => {
    setInfoPage(page);
    setScreen("info");

    window.history.pushState(
      {},
      "",
      `/?page=${encodeURIComponent(page)}`
    );

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goHome = () => {
    setInfoPage(null);
    setScreen("home");

    window.history.pushState({}, "", "/");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handlePopState = () => {
      const page = getInfoPageFromUrl();

      setInfoPage(page);
      setScreen(page ? "info" : "home");

      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const infoPages = {
    about: {
      title: "About ConnectUpVBIT",
      subtitle: "A simple way to meet and talk to someone new.",
      sections: [
        {
          heading: "What is ConnectUpVBIT?",
          text:
            "ConnectUpVBIT is a random conversation platform created for the VBIT community. It helps students discover a stranger from the community and start a real-time conversation."
        },
        {
          heading: "Our goal",
          text:
            "The goal is to make meeting new people simple, friendly, and easy. You can start with text conversations and, where available, use audio or video calling."
        },
        {
          heading: "How conversations work",
          text:
            "When you choose to find someone, ConnectUpVBIT looks for another available user. Once two compatible users are matched, they can communicate in real time."
        },
        {
          heading: "Your conversations",
          text:
            "Chat messages are relayed in real time and ConnectUpVBIT is not designed to maintain a permanent chat database. Technical infrastructure may still process normal connection or service information needed to operate the website."
        }
      ]
    },

    how: {
      title: "How It Works",
      subtitle: "Start a conversation in a few simple steps.",
      sections: [
        {
          heading: "1. Start",
          text:
            "Click Start on the home screen when you are ready to meet someone."
        },
        {
          heading: "2. Choose a mode",
          text:
            "Choose the communication mode available to you, such as Text, Audio, or Video."
        },
        {
          heading: "3. Search",
          text:
            "ConnectUpVBIT searches for another available user who selected a compatible mode."
        },
        {
          heading: "4. Connect",
          text:
            "When a match is found, the conversation starts. In text mode you can send messages. In audio or video mode, your browser can establish a peer-to-peer WebRTC call."
        },
        {
          heading: "5. Meet someone new",
          text:
            "If you do not want to continue the current conversation, use the Skip control and confirm when asked. You can then move on to the next stranger."
        }
      ]
    },

    safety: {
      title: "Safety & Community Guidelines",
      subtitle: "Keep conversations respectful and safe.",
      sections: [
        {
          heading: "Be respectful",
          text:
            "Treat other users with respect. Do not harass, threaten, bully, discriminate against, or deliberately disturb another person."
        },
        {
          heading: "Protect personal information",
          text:
            "Do not share passwords, financial information, private documents, precise personal details, or other sensitive information with strangers."
        },
        {
          heading: "Use the platform responsibly",
          text:
            "Do not use ConnectUpVBIT for illegal activity, scams, impersonation, harmful activity, or content intended to seriously harm or exploit another person."
        },
        {
          heading: "Use Skip when needed",
          text:
            "You never have to continue a conversation that makes you uncomfortable. Use Skip to leave the current stranger and search for another."
        },
        {
          heading: "Serious safety concerns",
          text:
            "If a conversation involves an immediate threat or serious illegal activity, stop interacting and contact the appropriate local authorities or emergency services when necessary."
        }
      ]
    },

    privacy: {
      title: "Privacy Policy",
      subtitle: "A clear explanation of how ConnectUpVBIT handles information.",
      sections: [
        {
          heading: "Information used to operate the service",
          text:
            "ConnectUpVBIT may process information required to establish connections, match users, maintain the website, prevent abuse, and provide the requested communication features."
        },
        {
          heading: "Chat messages",
          text:
            "Chat messages are relayed in real time between matched users. ConnectUpVBIT is not designed to store conversations permanently in a chat database."
        },
        {
          heading: "Audio and video calls",
          text:
            "Audio and video communication uses browser WebRTC technology. Depending on the connection path, normal networking information such as IP addresses may be processed by internet, hosting, or communication infrastructure."
        },
        {
          heading: "Cookies, analytics and advertising",
          text:
            "If analytics, advertising, or similar third-party services are introduced, those services may process information according to their own policies. Any future advertising or analytics implementation should be configured in accordance with applicable privacy and platform requirements."
        },
        {
          heading: "Third-party infrastructure",
          text:
            "The service may rely on third-party hosting, networking, or software services to deliver the website. Those providers can process technical information as necessary to provide their services."
        },
        {
          heading: "Changes to this policy",
          text:
            "This Privacy Policy may be updated as ConnectUpVBIT develops. The latest version published on this website will apply to future use of the service."
        }
      ]
    },

    terms: {
      title: "Terms of Service",
      subtitle: "The basic rules for using ConnectUpVBIT.",
      sections: [
        {
          heading: "Acceptable use",
          text:
            "You agree to use ConnectUpVBIT lawfully and responsibly. You must not use the service to harass, threaten, scam, impersonate, exploit, or harm other people."
        },
        {
          heading: "User responsibility",
          text:
            "You are responsible for what you say, share, and do while using the platform. Do not share sensitive personal information with strangers."
        },
        {
          heading: "Service availability",
          text:
            "ConnectUpVBIT is provided on an availability basis. Connections can fail because of internet problems, browser restrictions, server issues, or other technical conditions."
        },
        {
          heading: "No identity guarantee",
          text:
            "Random matching does not guarantee that another user is who they claim to be. Use appropriate caution when interacting with strangers."
        },
        {
          heading: "Access and termination",
          text:
            "Access to the service may be limited or terminated when necessary to protect the platform, users, or the service from misuse."
        },
        {
          heading: "Updates",
          text:
            "These terms may change as the service evolves. Continued use of ConnectUpVBIT after an update means you accept the updated terms."
        }
      ]
    },

    contact: {
      title: "Contact Us",
      subtitle: "Questions, feedback, safety concerns, or partnership enquiries.",
      sections: [
        {
          heading: "General support",
          text:
            "For questions or feedback about ConnectUpVBIT, please use the support contact below."
        },
        {
          heading: "Email",
          text: (
            <>
              For inquiries, please contact us at{" "}
              <a
                href="mailto:connectupvbit@gmail.com"
                style={{
                  color: "#e94b91",
                  fontWeight: 700,
                  textDecoration: "none"
                }}
              >
                connectupvbit@gmail.com
              </a>
            </>
          )
        },
        {
          heading: "Safety concerns",
          text:
            "If you experience serious harassment, threats, or another urgent safety issue, stop the conversation and contact the appropriate local authorities or emergency services when necessary."
        },
        {
          heading: "Business and promotions",
          text:
            "For advertising, partnership, or other business enquiries, use the official contact channel provided by the project owner."
        }
      ]
    }
  };


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
    <div className={`app ${screen === "search" ? "search-transition-active" : ""}`}>
      {screen === "search" && (
        <div className="search-pink-transition" aria-hidden="true">
          <div className="search-pink-transition-orb">✦</div>
        </div>
      )}

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

              <div className="header-decoration" aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
              </div>

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

          <section className="welcome-screen" style={{ position: "relative", overflow: "visible" }}>

            <div
              className="home-reference-decor home-reference-left"
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "4%",
                top: "560px",
                zIndex: 50,
                display: "flex",
                flexDirection: "column",
                color: "#ef78ab",
                fontSize: "16px",
                lineHeight: "1.18",
                fontWeight: 600,
                fontStyle: "italic",
                textAlign: "left",
                transform: "rotate(-7deg)",
                pointerEvents: "none",
              }}
            >
              <span>Different</span>
              <span>People</span>
              <span>Same Campus</span>
              <b style={{ fontSize: "25px", marginTop: "8px", fontWeight: 400 }}>♡</b>
            </div>

            <div
              className="home-reference-decor home-reference-right"
              aria-hidden="true"
              style={{
                position: "absolute",
                right: "4%",
                top: "520px",
                zIndex: 50,
                display: "flex",
                flexDirection: "column",
                color: "#ef78ab",
                fontSize: "16px",
                lineHeight: "1.18",
                fontWeight: 600,
                fontStyle: "italic",
                textAlign: "left",
                transform: "rotate(6deg)",
                pointerEvents: "none",
              }}
            >
              <span>Good</span>
              <span>Conversations</span>
              <span>Brighter Days</span>
              <b style={{ fontSize: "25px", marginTop: "8px", fontWeight: 400 }}>♡</b>
            </div>

            <div className="home-connection-illustration">
              <img
                src={interfaceImage}
                alt="Students connecting through conversation"
              />
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

          <section className="search-screen start-transition">

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

        {/* =================================
            PUBLIC INFORMATION PAGES
        ================================= */}

        {screen === "info" && infoPage && (
          <section className="info-page">
            <div className="info-header">
              <div className="info-brand">
                <div className="info-brand-logo">
                  <img src={vbitLogo} alt="VBIT Logo" />
                </div>

                <div className="info-brand-text">
                  <strong>ConnectUpVBIT</strong>
                  <span
                    className="info-community-text"
                    style={{
                      display: "block",
                      marginTop: "6px",
                      color: "#e94b91",
                      fontSize: "14px",
                      fontWeight: 600
                    }}
                  >
                    VBIT Community
                  </span>
                </div>
              </div>
            </div>

            <div className="info-content">
              <div className="eyebrow">CONNECTUPVBIT</div>

              <h2>{infoPages[infoPage].title}</h2>

              <p className="info-subtitle">
                {infoPages[infoPage].subtitle}
              </p>

              {infoPages[infoPage].sections.map((section, index) => (
                <article className="info-section" key={index}>
                  <h3>{section.heading}</h3>
                  <p>{section.text}</p>
                </article>
              ))}

              <button
                className="primary-btn info-primary-button"
                onClick={goHome}
                type="button"
              >
                <span>Back Home</span>
                <span className="btn-arrow">→</span>
              </button>
            </div>
          </section>
        )}

        {/* =================================
            PUBLIC SITE FOOTER
        ================================= */}

        {screen === "home" && (
          <footer className="site-footer">
            <a
              href="/?page=about"
              onClick={(e) => {
                e.preventDefault();
                openInfoPage("about");
              }}
            >
              About
            </a>

            <a
              href="/?page=how"
              onClick={(e) => {
                e.preventDefault();
                openInfoPage("how");
              }}
            >
              How It Works
            </a>

            <a
              href="/?page=safety"
              onClick={(e) => {
                e.preventDefault();
                openInfoPage("safety");
              }}
            >
              Safety
            </a>

            <a
              href="/?page=privacy"
              onClick={(e) => {
                e.preventDefault();
                openInfoPage("privacy");
              }}
            >
              Privacy
            </a>

            <a
              href="/?page=terms"
              onClick={(e) => {
                e.preventDefault();
                openInfoPage("terms");
              }}
            >
              Terms
            </a>

            <a
              href="/?page=contact"
              onClick={(e) => {
                e.preventDefault();
                openInfoPage("contact");
              }}
            >
              Contact
            </a>
          </footer>
        )}

      </main>

    </div>
  );
}

export default App;