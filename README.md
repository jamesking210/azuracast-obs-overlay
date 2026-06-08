# AzuraCast OBS Overlay

A simple OBS browser overlay for AzuraCast.

This is made for people running their own AzuraCast server and wanting an easy overlay for OBS. It runs in Docker, uses your AzuraCast metadata, and gives you one clean browser source URL.

The overlay is a transparent 1920x1080 page with a solid bottom ticker bar. The ticker shows the station name, current song, progress timer, up next, and plays the station audio through OBS.

The bottom bar is 100% opaque so it can cover the Windows taskbar or anything behind it. The background of the bar also fills as the current track plays.

---

## What it shows

- LIVE badge
- Station name
- Current track
- Song progress timer
- Small progress bar
- Full-width progress glow behind the ticker
- Up next
- Station audio in OBS

---

## OBS Browser Source

Use your public overlay URL:

```text
URL: https://overlay.yourdomain.com
Width: 1920
Height: 1080
Check: Control audio via OBS
```

Or test it on your LAN:

```text
URL: http://ipaddress:8089
Width: 1920
Height: 1080
Check: Control audio via OBS
```

Example:

```text
http://192.168.1.17:8089
```

Help and audio test page:

```text
http://ipaddress:8089/help
```

---

## The setup this is made for

This assumes AzuraCast is already running in Docker on the same Linux/Ubuntu machine.

The overlay runs as its own Docker container and talks back to AzuraCast using:

```text
http://host.docker.internal
```

Default setup:

```text
AzuraCast: same machine
AzuraCast local URL: http://host.docker.internal
Overlay port: 8089
Install folder: /opt/custom-dockers/azuracast-obs-overlay
```

The container listens on port `8089`.

---

## One-line install

Run this on the server that is already running AzuraCast:

```bash
sudo mkdir -p /opt/custom-dockers && sudo chown -R $USER:$USER /opt/custom-dockers && cd /opt/custom-dockers && git clone https://github.com/jamesking210/azuracast-obs-overlay.git && cd azuracast-obs-overlay && cp .env.example .env && nano .env && sudo docker compose up -d --build
```

When nano opens, edit the `.env` file.

Save and exit nano:

```text
CTRL + O
ENTER
CTRL + X
```

After nano closes, Docker will build and start the overlay.

---

## Basic `.env`

Example:

```env
STATION_NAME=Your Station Name
AZURACAST_BASE_URL=http://host.docker.internal
AZURACAST_STATION_SHORT_NAME=station_short_name
AZURACAST_MOUNT_NAME=radio.mp3
OVERLAY_PORT=8089
FALLBACK_UP_NEXT=
```

DJMixHub example:

```env
STATION_NAME=DJMixHub.com
AZURACAST_BASE_URL=http://host.docker.internal
AZURACAST_STATION_SHORT_NAME=djmixhub
AZURACAST_MOUNT_NAME=radio.mp3
OVERLAY_PORT=8089
FALLBACK_UP_NEXT=
```

`FALLBACK_UP_NEXT` can be left blank. If it is blank, the overlay uses the station name.

---

## Finding your AzuraCast station short name

Look at your AzuraCast now playing URL.

Example:

```text
http://your-server/api/nowplaying_static/djmixhub.json
```

The station short name is:

```text
djmixhub
```

So your `.env` should have:

```env
AZURACAST_STATION_SHORT_NAME=djmixhub
```

---

## Finding your stream mount name

Look at your AzuraCast listen URL.

Example:

```text
http://your-server/listen/djmixhub/radio.mp3
```

The mount name is:

```text
radio.mp3
```

So your `.env` should have:

```env
AZURACAST_MOUNT_NAME=radio.mp3
```

---

## Start / rebuild

From the project folder:

```bash
cd /opt/custom-dockers/azuracast-obs-overlay
sudo docker compose up -d --build
```

---

## Check if it is running

```bash
cd /opt/custom-dockers/azuracast-obs-overlay
sudo docker compose ps
```

Logs:

```bash
cd /opt/custom-dockers/azuracast-obs-overlay
sudo docker compose logs -f
```

---

## Test it

On the server:

```bash
curl -I http://localhost:8089/
curl http://localhost:8089/api/nowplaying_static
curl -I http://localhost:8089/radio.mp3
```

From another computer on your network:

```text
http://ipaddress:8089
http://ipaddress:8089/help
```

Example:

```text
http://192.168.1.17:8089
http://192.168.1.17:8089/help
```

---

## Cloudflare Tunnel example

Point the public hostname to the overlay container.

Example:

```text
Public hostname: overlay.yourdomain.com
Service type: HTTP
Service URL: http://your-server-ip:8089
```

DJMixHub example:

```text
Public hostname: overlay.djmixhub.com
Service type: HTTP
Service URL: http://192.168.1.17:8089
```

Then OBS uses:

```text
https://overlay.yourdomain.com
```

---

## Update later

If you installed from GitHub:

```bash
cd /opt/custom-dockers/azuracast-obs-overlay
git pull
sudo docker compose up -d --build
```

Then refresh the OBS browser source:

```text
Right-click Browser Source
Properties
Refresh cache of current page
OK
```

If OBS still shows the old version, remove and re-add the browser source.

---

## Stop it

```bash
cd /opt/custom-dockers/azuracast-obs-overlay
sudo docker compose down
```

---

## Notes

`.env.example` is only the example file.

The real config file must be named:

```text
.env
```

Normal web browsers may block autoplay audio. OBS usually plays the audio when this is checked:

```text
Control audio via OBS
```

If the overlay loads but the song info or audio does not work, test AzuraCast from the server:

```bash
curl http://localhost/api/nowplaying_static/station_short_name.json
curl -I http://localhost/listen/station_short_name/radio.mp3
```

Replace `station_short_name` with your real AzuraCast short name.

---

## File layout

```text
.
├── .env.example
├── .gitignore
├── Dockerfile
├── README.md
├── docker-compose.yml
├── docker-entrypoint.sh
├── nginx.conf.template
└── site
    ├── app.js
    ├── help.html
    ├── index.html
    └── styles.css
```
