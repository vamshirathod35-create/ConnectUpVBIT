const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

app.use(cors());

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
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
// REMOVE FROM WAITING
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
    console.log(
      `${socket.id} is already connected`
    );
    return;
  }

  // Already waiting
  if (waitingUsers.includes(socket.id)) {
    console.log(
      `${socket.id} is already waiting`
    );
    return;
  }

  // Find available stranger
  while (waitingUsers.length > 0) {
    const strangerId = waitingUsers.shift();

    const stranger =
      io.sockets.sockets.get(strangerId);

    // Stranger disconnected
    if (!stranger) {
      continue;
    }

    // Don't match with yourself
    if (stranger.id === socket.id) {
      continue;
    }

    // =================================
    // CREATE MATCH
    // =================================

    partners.set(socket.id, stranger.id);
    partners.set(stranger.id, socket.id);

    console.log(
      `Matched ${socket.id} <-> ${stranger.id}`
    );

    // Tell both users
    socket.emit("matched");

    stranger.emit("matched");

    return;
  }

  // =================================
  // NO STRANGER
  // =================================

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

  socket.on("find_stranger", () => {
    console.log(
      `Find stranger request: ${socket.id}`
    );

    findStranger(socket);
  });

  // ===================================
  // SEND MESSAGE
  // ===================================

  socket.on(
    "send_message",
    (message) => {
      const partnerId =
        partners.get(socket.id);

      if (!partnerId) {
        console.log(
          `No partner for ${socket.id}`
        );
        return;
      }

      const partner =
        io.sockets.sockets.get(partnerId);

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

  socket.on("typing", () => {
    const partnerId =
      partners.get(socket.id);

    if (!partnerId) {
      return;
    }

    io.to(partnerId).emit(
      "stranger_typing"
    );
  });

  // ===================================
  // STOP TYPING
  // ===================================

  socket.on("stop_typing", () => {
    const partnerId =
      partners.get(socket.id);

    if (!partnerId) {
      return;
    }

    io.to(partnerId).emit(
      "stranger_stop_typing"
    );
  });

  // ===================================
  // NEXT / SKIP
  // ===================================

  socket.on(
    "next_stranger",
    () => {
      console.log(
        `Next requested by ${socket.id}`
      );

      const partnerId =
        partners.get(socket.id);

      // =================================
      // USER HAS PARTNER
      // =================================

      if (partnerId) {
        // Remove old connection
        partners.delete(socket.id);
        partners.delete(partnerId);

        console.log(
          `${socket.id} skipped ${partnerId}`
        );

        // Tell stranger
        io.to(partnerId).emit(
          "stranger_disconnected"
        );

        // Tell current user
        socket.emit(
          "you_disconnected"
        );

        return;
      }

      // =================================
      // USER HAS NO PARTNER
      // =================================

      removeFromWaiting(socket.id);

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
      removeFromWaiting(socket.id);

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

      // Remove from waiting list
      removeFromWaiting(socket.id);

      // Find partner
      const partnerId =
        partners.get(socket.id);

      if (partnerId) {
        // Remove match
        partners.delete(socket.id);
        partners.delete(partnerId);

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

const PORT = 5000;

httpServer.listen(
  PORT,
  () => {
    console.log(
      `Server running on http://localhost:${PORT}`
    );
  }
);