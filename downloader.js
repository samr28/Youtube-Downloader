const { exec } = require("child_process");

module.exports = {
  download: function(data) {
    let cmd = `cd ${process.env.DOWNLOAD_LOCATION}; `;
    if (data.artist) {
      // Have artist, make dir and cd in
      cmd += `if [ ! -d '${data.artist}' ]; then mkdir '${data.artist}'; fi; `;
      cmd += `cd '${data.artist}'; `;
    }
    if (data.album) {
      // Have album, make dir and cd in
      cmd += `if [ ! -d '${data.album}' ]; then mkdir '${data.album}'; fi; `;
      cmd += `cd '${data.album}'; `;
    }
    cmd +=
      "youtube-dl -x --audio-format mp3 -o '" +
      data.title +
      ".%(ext)s' " +
      data.url;

    let promise = new Promise(function(resolve, reject) {
      exec(cmd, (err, stdout, stderr) => {
        if (err) {
          reject(err);
        } else if (stderr) {
          reject(stderr);
        } else {
          resolve(stdout);
        }
      });
    });
    return promise;
  }
};
