const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

// =====================================
// CORS
// =====================================

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://connectupvbit.onrender.com",
    ],
    methods: ["GET", "POST"],
  })
);

const httpServer = http.createServer(app);

// =====================================
// SOCKET.IO
// =====================================

const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://connectupvbit.onrender.com",
    ],
    methods: ["GET", "POST"],
  },
});

// =====================================
// DATA
// =====================================

const waitingUsers = [];
const partners = new Map();

// =====================================
// HOME
// =====================================

app.get("/", (req, res) => {
  res.send("ConnectUpVBIT server is running!");
});

// =====================================
// ONLINE USERS
// =====================================

function updateOnlineUsers() {
  io.emit(
    "online_users",
    io.sockets.sockets.size
  );
}

// =====================================
// REMOVE USER FROM WAITING
// =====================================

function removeFromWaiting(socketId) {
  const index = waitingUsers.indexOf(socketId);

  if (index !== -1) {
    waitingUsers.splice(index, 1);
  }
}

// =====================================
// FIND STRANGER
// =====================================

function findStranger(socket) {

  // Already connected
  if (partners.has(socket.id)) {
    return;
  }

  // Already waiting
  if (waitingUsers.includes(socket.id)) {
    return;
  }

  while (waitingUsers.length > 0) {

    const strangerId = waitingUsers.shift();

    const stranger =
      io.sockets.sockets.get(strangerId);

    // User no longer exists
    if (!stranger) {
      continue;
    }

    // Don't match with yourself
    if (stranger.id === socket.id) {
      continue;
    }

    // Create match
    partners.set(
      socket.id,
      stranger.id
    );

    partners.set(
      stranger.id,
      socket.id
    );

    // Tell both users
    socket.emit("matched");

    stranger.emit("matched");

    console.log(
      `Matched ${socket.id} <-> ${stranger.id}`
    );

    return;
  }

  // Nobody available
  waitingUsers.push(socket.id);

  socket.emit("waiting");

  console.log(
    `Waiting for stranger: ${socket.id}`
  );
}

// =====================================
// CONNECTION
// =====================================

io.on("connection", (socket) => {

  console.log(
    "User connected:",
    socket.id
  );

  updateOnlineUsers();

  // ===================================
  // FIND STRANGER
  // ===================================

  socket.on(
    "find_stranger",
    () => {
      findStranger(socket);
    }
  );

  // ===================================
  // SEND MESSAGE
  // ===================================

  socket.on(
    "send_message",
    (message) => {

      const partnerId =
        partners.get(socket.id);

      if (!partnerId) {
        return;
      }

      const partner =
        io.sockets.sockets.get(
          partnerId
        );

      if (!partner) {
        return;
      }

      partner.emit(
        "receive_message",
        message
      );

      console.log(
        `Message from ${socket.id}: ${message}`
      );
    }
  );

  // ===================================
  // TYPING
  // ===================================

  socket.on(
    "typing",
    () => {

      const partnerId =
        partners.get(socket.id);

      if (!partnerId) {
        return;
      }

      io.to(partnerId).emit(
        "stranger_typing"
      );
    }
  );

  // ===================================
  // STOP TYPING
  // ===================================

  socket.on(
    "stop_typing",
    () => {

      const partnerId =
        partners.get(socket.id);

      if (!partnerId) {
        return;
      }

      io.to(partnerId).emit(
        "stranger_stop_typing"
      );
    }
  );

  // ===================================
  // SKIP CURRENT CHAT
  // ===================================

  socket.on(
    "next_stranger",
    () => {

      const partnerId =
        partners.get(socket.id);

      // --------------------------------
      // Current partner exists
      // --------------------------------

      if (partnerId) {

        // Remove match
        partners.delete(
          socket.id
        );

        partners.delete(
          partnerId
        );

        // Tell other user
        io.to(partnerId).emit(
          "stranger_disconnected"
        );

        // Tell user who skipped
        socket.emit(
          "you_disconnected"
        );

        console.log(
          `${socket.id} skipped ${partnerId}`
        );

        return;
      }

      // --------------------------------
      // Safety case
      // --------------------------------

      socket.emit(
        "you_disconnected"
      );
    }
  );

  // ===================================
  // STOP SEARCH
  // ===================================

  socket.on(
    "stop_search",
    () => {

      removeFromWaiting(
        socket.id
      );

      console.log(
        `Search stopped: ${socket.id}`
      );
    }
  );

  // ===================================
  // DISCONNECT
  // ===================================

  socket.on(
    "disconnect",
    () => {

      console.log(
        "User disconnected:",
        socket.id
      );

      // Remove from waiting
      removeFromWaiting(
        socket.id
      );

      // Check partner
      const partnerId =
        partners.get(socket.id);

      if (partnerId) {

        // Remove match
        partners.delete(
          socket.id
        );

        partners.delete(
          partnerId
        );

        // Tell partner
        io.to(partnerId).emit(
          "stranger_disconnected"
        );
      }

      updateOnlineUsers();
    }
  );
});

// =====================================
// START SERVER
// =====================================

const PORT = process.env.PORT || 5000;

httpServer.listen(
  PORT,
  () => {

    console.log(
      `Server running on port ${PORT}`
    );

  }
);