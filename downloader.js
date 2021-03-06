const { exec } = require("child_process");

module.exports = {
  download: function(data) {
    // Escape quotes
    data.title = data.title.replace(/\"/g, '\\"');
    data.album = data.album.replace(/\"/g, '\\"');
    data.artist = data.artist.replace(/\"/g, '\\"');
    console.log(`Download started`, data);
    let downloadCmd =
    `./download "${data.url}" "${data.title}" "${data.artist}" "${data.album}"`;
    let promise = new Promise(function(resolve, reject) {
      exec(downloadCmd, (err, stdout, stderr) => {
        if (err) {
          console.log(`Downloader error: ${err}`);
          console.log(err);
          reject(err);
        } else if (stderr) {
          console.log(`Downloader stderror: ${stderr}`);
          console.log(stderr);
          reject(stderr);
        } else {
          resolve(stdout);
        }
      });
    });
    return promise;
  }
};
