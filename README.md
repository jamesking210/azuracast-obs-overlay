# AzuraCast OBS Overlay

Simple Docker-hosted OBS overlay for AzuraCast.

This gives DJs one easy browser source URL. It shows a clean 1920x1080 transparent page with the ticker locked to the bottom. It also plays the station audio through the OBS browser source.

---

## OBS Browser Source

Use your public overlay URL:

```text
URL: https://overlay.yourdomain.com
Width: 1920
Height: 1080
Check: Control audio via OBS
```

Or test it locally/LAN:

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

Help/test page:

```text
http://ipaddress:8089/help
```

---

## Assumptions

This is made for an AzuraCast server where AzuraCast is already running in Docker on the same machine.

The overlay container talks back to the host machine using:

```text
http://host.docker.internal
```

Default idea:

```text
AzuraCast: http://host.docker.internal
AzuraCast port: 80
Overlay port: 8089
Install folder: /opt/custom-dockers/azuracast-obs-overlay
```

---

## One-line install

Copy and paste this on the Ubuntu server:

```bash
sudo mkdir -p /opt/custom-dockers && sudo chown -R $USER:$USER /opt/custom-dockers && cd /opt/custom-dockers && git clone https://github.com/jamesking210/azuracast-obs-overlay.git && cd azuracast-obs-overlay && cp .env.example .env && nano .env && sudo docker compose up -d --build
```

Nano save/exit:

```text
CTRL + O
ENTER
CTRL + X
```

After you close nano, Docker will build and start the overlay.

---

## Basic `.env`

Edit this file:

```bash
nano /opt/custom-dockers/azuracast-obs-overlay/.env
```

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

`FALLBACK_UP_NEXT` can be left blank. If blank, it uses the station name.

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

So use:

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

So use:

```env
AZURACAST_MOUNT_NAME=radio.mp3
```

---

## Test it

On the Ubuntu server:

```bash
curl -I http://localhost:8089/
curl http://localhost:8089/api/nowplaying_static
curl -I http://localhost:8089/radio.mp3
```

From another computer:

```text
http://ipaddress:8089
http://ipaddress:8089/help
```

---

## Cloudflare Tunnel example

Point the public hostname to the overlay container:

```text
Public hostname: overlay.yourdomain.com
Service type: HTTP
Service URL: http://your-server-ip:8089
```

Example:

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

## Update

```bash
cd /opt/custom-dockers/azuracast-obs-overlay && git pull && sudo docker compose up -d --build
```

---

## Stop

```bash
cd /opt/custom-dockers/azuracast-obs-overlay && sudo docker compose down
```

---

## Logs

```bash
cd /opt/custom-dockers/azuracast-obs-overlay && sudo docker compose logs -f
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
