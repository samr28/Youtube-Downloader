const { exec } = require("child_process");

module.exports = {
  getTitle: function(data) {
    console.log(`Get title`, data);
    let downloadCmd =
    `./gettitle "${data.url}"`;
    let promise = new Promise(function(resolve, reject) {
      exec(downloadCmd, (err, stdout, stderr) => {
        if (err) {
          console.log(`gettitle error: `);
          console.log(err);
          reject(err);
        } else if (stderr) {
          console.log(`gettitle stderror: `);
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
