# Youtube-Downloader

Youtube-Downloader lets you download the audio from Youtube videos and have them automatically uploaded to a specified location. It also creates the correct folder structure and sets ID3 tags. Works well with Plex!

### Setup

The following steps assume that you have already installed Node

1. Get Spotify API credentials from https://developer.spotify.com
   - Log in with a Spotify account
   - Go to the dashboard and click 'create an app'
   - Fill out the form and click next
   - Once you get to the project dashboard, copy the client ID and secret
2. `cd` to where you want the app to be installed (ex: `cd ~/user/Documents`)
3. Clone the repo (ex: `git clone https://github.com/samr28/Youtube-Downloader.git`)
4. cd into the directory: `cd Youtube-Downloader`
5. Install it: `npm install`
6. You also need to install foreverjs with `npm install forever -g` (https://github.com/foreverjs/forever)
7. Run the install script `./install`
   - This creates a run script, installs ytdl, ffmpeg, and id3tool
8. Edit `run`
   - Set `DOWNLOAD_LOCATION` to the folder that you want to store music in
   - Set `PASSWORD` to whatever you want
   - Set `WEB_PORT` to whatever port you want to use
   - Set `SPOTIFY_API_KEY` and `SPOTIFY_SECRET` to the credentials provided by Spotify (API Key is your client ID and secret is your client secret)
9. Type `./run` to start the app (if you encounter any errors, open an issue)

### Usage
1. Navigate to YOUR_IP:WEB_PORT (set in `run`)
2. Paste in a Youtube video URL into the link field
3. Hit `tab` or click on a different textbox (like the password box)
4. The server will make a request to the Spotify API and attempt to autofill the song metadata
   - In the case of incorrect metadata, scroll down to the autofill box and pick the correct suggestion
5. Next fill out the password field and click download

*Note that Plex defaults to updating libraries about once a day. If you don't see your music in Plex, you can force it to scan library files through the Plex webapp.*