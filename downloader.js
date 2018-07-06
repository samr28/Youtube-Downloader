const { exec } = require("child_process");

module.exports = {
  download: function(url) {
    // let url =
    // "https://www.youtube.com/watch?v=6E5m_XtCX3c&t=0s&list=PLkjulCzCH58CwPle-00iXVTR7wkVX0UP_&index=2";

    let cmd = "cd " + process.env.DOWNLOAD_LOCATION + "; ";
    cmd += "youtube-dl -x --audio-format mp3 " + url;

    let promise = new Promise(function(resolve, reject) {
      exec(cmd, (err, stdout, stderr) => {
        if (err) {
          reject(err);
        } else if (stderr) {
          console.log(typeof stderr);
          reject(stderr);
        } else {
          resolve(stdout);
        }
      });
    });
    return promise;
  }
};
