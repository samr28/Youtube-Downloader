const { exec } = require("child_process");

module.exports = {
  download: function(data) {
    let cmd = "cd " + process.env.DOWNLOAD_LOCATION + "; ";
    cmd +=
      "youtube-dl -x --audio-format mp3 -o '" +
      data.artist +
      " - " +
      data.album +
      " - " +
      data.title +
      ".%(ext)s' " +
      data.url;

    console.log(cmd);

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
