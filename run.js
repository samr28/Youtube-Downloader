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
var gettitle = require("./gettitle.js");
var songlist = require("./songList.js");

var version = require("./package.json").version;

var debug = false;
if (process.env.DEBUG == 1) {
  debug = true;
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
            socket.emit("songlist", constructSongListTable(songs));
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

  // Fill songlist
  songlist.getSongs().then(function (songs) {
    socket.emit("songlist", constructSongListTable(songs));
  })
  .catch(function(err) {
    socket.emit("msg", "error", err);
  });

  // Autocomplete based on title
  socket.on("autocomplete-title", function(data) {
    if (data.title) {
      spotify.search({
        type: 'track',
        query: data.title
      }, function(err, data) {
        if (err) {
          socket.emit("msg", "error", "Spotify API Error!");
          return console.log("Spotify API ERROR: ", err);
        }
        let suggestion = {};
        if (!data.tracks.items[0]) {
          socket.emit("msg", "error", "No songs found");
          return console.log("No songs found")
        }
        suggestion.title = data.tracks.items[0].name;
        suggestion.artist = data.tracks.items[0].artists[0].name;
        suggestion.album = data.tracks.items[0].album.name;
        socket.emit("complete", suggestion);
      });
    }
  });

  // Autocomplete based on utl
  socket.on("autocomplete-url", function(data) {
    if (data.url) {
      gettitle
      .getTitle(data)
      .then(function(stdout) {
        // Remove junk from title
        let title = stdout.replace(/[\(\[{].*[}\)\]]/gi, "");
        // let title = stdout.replace(/[\(\[](?:official)?(?: )?(?:animated)?(?: )?(?:music)?(?: )?(?:video)?(?: )?(?:audio)?(?: )?(?:hq audio)?(?: )?(?:monstercat release)?[\)\]]/gi, "");
        title = title.trim();
        // Search spotify for the track from the url
        spotify.search({
          type: 'album,artist,track',
          query: title
        }, function(err, spotifyData) {
          if (err) {
            return console.log(err);
          }
          let suggestions = [];
          if (!spotifyData || !spotifyData.tracks || !spotifyData.tracks.items || !spotifyData.tracks.items[0]) {
            socket.emit("suggestions", constructSuggestionsNoMatch(title));
            return;
          }
          let tracks = spotifyData.tracks.items;

          // Top suggestion
          let suggestion = {
            title: tracks[0].name,
            artist: tracks[0].artists[0].name,
            album: tracks[0].album.name
          };
          socket.emit("complete", suggestion);

          // Other suggestions
          for (let i = 0; i < tracks.length; i++) {
            suggestions[i] = {
              title: tracks[i].name,
              artist: tracks[i].artists[0].name,
              album: tracks[i].album.name
            };
          }
          socket.emit("suggestions", constructSuggestionsTable(suggestions), suggestions);
        });
      })
      .catch(function(err) {
        socket.emit("msg", "error", err.toString());
      });
    }
  });
});

// Listen for connections on WEB_PORT
http.listen(process.env.WEB_PORT, function() {
  console.log(`listening on *:${process.env.WEB_PORT}`);
});

function constructSuggestionsNoMatch(title) {
  let suggestionHTML = `
    <h4 class="text-center">
      No matches for "${title}"
    </h4>
  `;

  suggestionHTML += `
    <h3 class="text-center">
      Try another search with:
    </h3>
  `;

  let words = title.split(" ");

  for (let i = 0; i < words.length; i++) {
    if (words[i] != "" && words[i] != "-") {
      suggestionHTML += `
        <div class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input" id="suggestionWord${i}">
            <label id="suggestionWord${i}" class="custom-control-label" for="suggestionWord${i}">${words[i]}</label>
        </div>
      `;
    }
  }

  suggestionHTML += `<button id="suggestionWordSearch" class="btn blue-gradient">Search</button>`;

  console.log(words);

  return suggestionHTML;
}

function constructSuggestionsTable(suggestions) {
  let tableHTML = `
  <table id="dtSuggestions" class="table table-striped table-bordered table-sm" cellspacing="0" width="100%">
  <thead>
  <tr>
  <th class="th-sm">
  <i class="fa fa-sort float-right" aria-hidden="true"></i>
  </th>
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
  for (let i = 0; i < suggestions.length; i++) {
    tableHTML += `
    <tr>
    <td>
      <button class="btn btn-sm center blue-gradient" onclick="pickSuggestion(${i})">
        <i class="fas fa-chevron-up"></i>
      </button>
    </td>
    <td>${suggestions[i].title || ''}</td>
    <td>${suggestions[i].artist || ''}</td>
    <td>${suggestions[i].album || ''}</td>
    </tr>
    `;
  }
  tableHTML += `
  </tbody>
  </table>
  `;
  return tableHTML;
}

function constructSongListTable(songs) {
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
