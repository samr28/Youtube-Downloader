var app = require("express")();
var express = require("express");
var http = require("http").Server(app);
var io = require("socket.io")(http);
var validator = require("validator");
var downloader = require("./downloader.js");

var version = require("./package.json").version;

var debug;
if (process.env.DEBUG == 1) {
  debug = true;
} else {
  debug = false;
}

console.log(`[${new Date()}] Starting v${version}`);

// Serve index
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.use(express.static("css"));

// Update inner html and refresh when buttons are clicked
io.on("connection", function(socket) {
  socket.on("submit", function(data, password) {
    if (password === process.env.PASSWORD) {
      if (!validator.isURL(data.url)) {
        socket.emit("msg", "error", "Invalid url: " + data.url);
      } else {
        socket.emit("msg", "info", "Download started");
        downloader
          .download(data)
          .then(function(stdout) {
            socket.emit("msg", "success", "Download complete");
          })
          .catch(function(err) {
            socket.emit("msg", "error", err.toString());
          });
      }
    } else {
      socket.emit("msg", "error", "Incorrect password");
    }
  });
});

// Listen for connections on WEB_PORT
http.listen(process.env.WEB_PORT, function() {
  console.log(`listening on *:${process.env.WEB_PORT}`);
});
