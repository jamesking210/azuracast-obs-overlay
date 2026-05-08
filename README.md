# AzuraCast OBS Overlay

A simple Docker-hosted OBS browser overlay for AzuraCast stations.

It shows a clean 1920x1080 transparent OBS source with a 52px ticker pinned to the bottom.

The ticker shows:

- LIVE
- Station name
- Current track
- Progress timer
- Up next
- Station audio in OBS

No extra pages to choose from. The main overlay is `/`.

---

## OBS Browser Source

Use your public overlay URL if you have a tunnel or reverse proxy:

```text
URL: https://overlay.yourdomain.com
Width: 1920
Height: 1080
Check: Control audio via OBS
```

Or test it directly on your LAN:

```text
URL: http://ipaddress:8089
Width: 1920
Height: 1080
Check: Control audio via OBS
```

Example LAN URL:

```text
http://192.168.1.17:8089
```

---

## Basic setup idea

This project is meant for the common setup where:

```text
AzuraCast is running on the same Linux machine
AzuraCast is reachable from that machine on port 80
This overlay runs in Docker on port 8089
```

Inside Docker, `host.docker.internal` points back to the Linux host machine.

So the overlay container talks to AzuraCast like this:

```text
http://host.docker.internal/api/nowplaying_static/station_short_name.json
http://host.docker.internal/listen/station_short_name/radio.mp3
```

The OBS user only sees this:

```text
https://overlay.yourdomain.com
```

or this:

```text
http://ipaddress:8089
```

---

## Files

```text
.
├── Dockerfile
├── docker-compose.yml
├── docker-entrypoint.sh
├── nginx.conf.template
├── .env.example
├── .gitignore
└── site/
    ├── index.html
    ├── help.html
    ├── styles.css
    └── app.js
```

---

## Install from GitHub

Replace the GitHub URL with your own repo URL.

```bash
cd ~
git clone https://github.com/YOUR_USERNAME/azuracast-obs-overlay.git
cd azuracast-obs-overlay
cp .env.example .env
nano .env
```

---

## Edit `.env`

The example `.env` is intentionally basic:

```env
STATION_NAME=Your Station Name
AZURACAST_BASE_URL=http://host.docker.internal
AZURACAST_STATION_SHORT_NAME=station_short_name
AZURACAST_MOUNT_NAME=radio.mp3
OVERLAY_PORT=8089
FALLBACK_UP_NEXT=
```

### What to change

`STATION_NAME` is the name shown in the ticker.

`AZURACAST_BASE_URL` is where the overlay container can reach AzuraCast.

For AzuraCast on the same Linux host using normal port 80, use:

```env
AZURACAST_BASE_URL=http://host.docker.internal
```

Use `https://...` only if your AzuraCast server is actually reachable with HTTPS from inside the Docker container.

`AZURACAST_STATION_SHORT_NAME` is the AzuraCast short name.

Example:

```text
http://host.docker.internal/api/nowplaying_static/djmixhub.json
```

The short name is:

```text
djmixhub
```

`AZURACAST_MOUNT_NAME` is the stream mount filename.

Example:

```text
http://host.docker.internal/listen/djmixhub/radio.mp3
```

The mount name is:

```text
radio.mp3
```

`OVERLAY_PORT` is the port for the overlay Docker site.

Default:

```env
OVERLAY_PORT=8089
```

`FALLBACK_UP_NEXT` can be left blank. If it is blank, the overlay uses your `STATION_NAME`.

---

## DJMixHub example `.env`

```env
STATION_NAME=DJMixHub.com
AZURACAST_BASE_URL=http://host.docker.internal
AZURACAST_STATION_SHORT_NAME=djmixhub
AZURACAST_MOUNT_NAME=radio.mp3
OVERLAY_PORT=8089
FALLBACK_UP_NEXT=
```

---

## Start the overlay

```bash
docker compose up -d --build
```

---

## Test locally

On the Linux Docker host:

```bash
curl -I http://localhost:8089/
curl http://localhost:8089/api/nowplaying_static
curl -I http://localhost:8089/radio.mp3
```

From another computer on your LAN:

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

Point your public hostname to the Docker service.

```text
Public hostname: overlay.yourdomain.com
Service type: HTTP
Service URL: http://192.168.1.17:8089
```

If the tunnel runs on the same Linux machine as this overlay container, this can also work:

```text
Service URL: http://localhost:8089
```

Then OBS uses:

```text
https://overlay.yourdomain.com
```

---

## Help page

A simple help and audio-test page is included:

```text
http://ipaddress:8089/help
```

or:

```text
https://overlay.yourdomain.com/help
```

Normal browsers may block autoplay audio. OBS Browser Source usually allows it when `Control audio via OBS` is checked.
