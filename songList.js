const { exec } = require("child_process");

module.exports = {
  getSongs: function() {
    console.log(`Listing songs`);
    let listsongsCmd = './listsongs';
    let promise = new Promise(function(resolve, reject) {
      exec(listsongsCmd, (err, stdout, stderr) => {
        if (err) {
          console.log(`List songs error: ${err}`);
          console.log(err);
          reject(err);
        } else if (stderr) {
          console.log(`List songs stderror: ${stderr}`);
          console.log(stderr);
          reject(stderr);
        } else {
          // Convert download location to regex so that it can be removed from
          // the filepath
          let downloadLocation = process.env.DOWNLOAD_LOCATION;
          downloadLocation = downloadLocation.replace(/\//g, "\\/");

          let songlist = stdout.replace(new RegExp(downloadLocation, 'g'), '');
          songlist = songlist.replace(/\.mp3/g, '');
          // Convert to an array
          songlist = songlist.trim();
          songlist = songlist.split("\n");
          // Array of song objects
          let songs = [];
          for (let i = 0; i < songlist.length; i++) {
            let metadata = songlist[i].split("/");
            // Artist, Album, Title present
            if (metadata[0] && metadata[1] && metadata[2]) {
              songs.push({
                artist: metadata[0],
                album: metadata[1],
                title: metadata[2]
              });
            } else if (metadata[0] && metadata[1]) {
              songs.push({
                artist: metadata[0],
                title: metadata[1]
              });
            } else if (metadata[0]) {
              songs.push({
                title: metadata[0]
              });
            } else {
              reject(new Error("Invalid song metadata"));
            }
          }
          resolve(songs);
        }
      });
    });
    return promise;
  }
};
