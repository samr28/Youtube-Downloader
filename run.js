var app = require("express")();
var express = require("express");
var http = require("http").Server(app);
var io = require("socket.io")(http);
var validator = require("validator");

var Spotify = require('node-spotify-api');

var spotify = new Spotify({
  id: process.env.SPOTIFY_API_KEY,
  secret: process.env.SPOTIFY_SECRET
});

var downloader = require("./downloader.js");
var songlist = require("./songList.js");

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

app.use(express.static(__dirname + '/public'));

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
            socket.emit("resetform");
            songlist.getSongs().then(function (songs) {
              socket.emit("songlist", constructTable(songs));
            })
            .catch(function(err) {
              socket.emit("msg", "error", err);
            });
          })
          .catch(function(err) {
            socket.emit("msg", "error", err.toString());
          });
      }
    } else {
      socket.emit("msg", "error", "Incorrect password");
    }
  });
  songlist.getSongs().then(function (songs) {
    socket.emit("songlist", constructTable(songs));
  })
  .catch(function(err) {
    socket.emit("msg", "error", err);
  });
  socket.on("autocomplete", function(data) {
    if (data.title) {
      spotify.search({
        type: 'track',
        query: data.title
      }, function(err, data) {
        if (err) {
          return console.log(err);
        }
        let suggestion = {};
        suggestion.title = data.tracks.items[0].name;
        suggestion.artist = data.tracks.items[0].artists[0].name;
        suggestion.album = data.tracks.items[0].album.name
        socket.emit("complete", suggestion);
      });
    }
  });
});

// Listen for connections on WEB_PORT
http.listen(process.env.WEB_PORT, function() {
  console.log(`listening on *:${process.env.WEB_PORT}`);
});


function constructTable(songs) {
  let tableHTML = `
  <table id="dtSongList" class="table table-striped table-bordered table-sm" cellspacing="0" width="100%">
    <thead>
      <tr>
        <th class="th-sm">Title
          <i class="fa fa-sort float-right" aria-hidden="true"></i>
        </th>
        <th class="th-sm">Artist
          <i class="fa fa-sort float-right" aria-hidden="true"></i>
        </th>
        <th class="th-sm">Album
          <i class="fa fa-sort float-right" aria-hidden="true"></i>
        </th>
      </tr>
    </thead>
    <tbody>
    `;
    for (let i = 0; i < songs.length; i++) {
      tableHTML += `
        <tr>
          <td>${songs[i].title || ''}</td>
          <td>${songs[i].artist || ''}</td>
          <td>${songs[i].album || ''}</td>
        </tr>
      `;
    }
  tableHTML += `
    </tbody>
  </table>
  `;
  return tableHTML;
}
