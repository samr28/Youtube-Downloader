const { exec } = require("child_process");

module.exports = {
  download: function(data) {
    let downloadCmd = `./download ${data.url} ${data.title} ${data.artist} ${
      data.album
    }`;
    let promise = new Promise(function(resolve, reject) {
      exec(downloadCmd, (err, stdout, stderr) => {
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
