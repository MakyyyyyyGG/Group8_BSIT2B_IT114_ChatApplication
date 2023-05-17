var express = require("express");
var app = express();
const path = require("path");

const http = require("http");
const server = require("http").Server(app);
const io = require("socket.io")(server);
var count = 0;
// const PORT = process.end.PORT || 8000;

const defURL = "http://localhost:8000/";

app.use(express.static("public"));

app.set("view engine", "ejs");

app.get("/", function (req, res) {
  res.render("pages/main", {
    socketURL: defURL,
  });
});

app.get("/login", function (req, res) {
  res.render("pages/login", {
    socketURL: defURL,
  });
});

app.get("/signup", function (req, res) {
  res.render("pages/signup", {
    socketURL: defURL,
  });
});

app.get("/index", function (req, res) {
  res.render("pages/index", { socketURL: defURL });
});

//make javascipt working as a separate file
app.get("/index.js", function (req, res) {
  res.setHeader("Content-Type", "text/javascript");
  res.sendFile(path.join(__dirname, "index.js"));
});

// Server-side
io.on("connection", function (socket) {
  console.log("a user connected");
  count++;
  io.emit("usercnt", count);

  let username; // Store the username when the user connects

  socket.on("newuser", function (receivedUsername) {
    username = receivedUsername; // Store the username
    socket.broadcast.emit("update", username + " joined the conversation");
  });

  socket.on("disconnect", function () {
    console.log("a user disconnected");
    count--;
    io.emit("usercnt", count);

    if (username) {
      // Check if the username is available
      socket.broadcast.emit("update", username + " left the conversation");
    }
  });

  socket.on("chat", function (message) {
    socket.broadcast.emit("chat", message);
  });

  socket.on("typing", function () {
    if (username) {
      socket.broadcast.emit("isTyping", {
        username,
        typingIndicatorURL: "/public/typing.gif",
      });
    }
  });

  socket.on("stopTyping", function () {
    socket.broadcast.emit("stopTyping");
  });
});

server.listen(8000);
console.log("server is listening on port: 8000");
