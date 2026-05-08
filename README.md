# AzuraCast OBS Overlay

A simple OBS browser overlay for AzuraCast.

This runs in Docker and gives you one easy OBS URL. It shows a clean bottom ticker with the station name, current song, progress timer, up next, and station audio.

I built this so DJs can add a radio station overlay without messing with a bunch of OBS positioning.

---

## What it looks like in OBS

Use a normal 1920x1080 OBS Browser Source.

The page is transparent and the ticker sits at the bottom.

```text
URL: https://overlay.yourdomain.com
Width: 1920
Height: 1080
Check: Control audio via OBS
```

For local testing, use the server IP instead:

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

There is also a simple help page:

```text
http://ipaddress:8089/help
```

---

## The simple setup this is made for

This project assumes AzuraCast is running on the same Ubuntu server as this Docker overlay.

Example setup:

```text
AzuraCast: http://host.docker.internal
AzuraCast port: 80
Overlay Docker port: 8089
OBS overlay URL: http://ipaddress:8089
```

For a public OBS URL, point your tunnel or reverse proxy to:

```text
http://your-server-ip:8089
```

Example Cloudflare Tunnel setup:

```text
Public hostname: overlay.yourdomain.com
Service type: HTTP
Service URL: http://192.168.1.17:8089
```

Then OBS uses:

```text
https://overlay.yourdomain.com
```

---

## Install on Ubuntu for dummies

These commands install the overlay to:

```text
/opt/custom-dockers/azuracast-obs-overlay
```

### 1. SSH into your Ubuntu server

```bash
ssh your-user@your-server-ip
```

Example:

```bash
ssh jim@192.168.1.17
```

---

### 2. Install Docker if you do not already have it

If Docker is already installed, you can skip this step.

```bash
sudo apt update
sudo apt install -y curl git
curl -fsSL https://get.docker.com | sudo sh
sudo systemctl enable --now docker
```

Check Docker:

```bash
sudo docker --version
sudo docker compose version
```

---

### 3. Create your custom Docker folder

```bash
sudo mkdir -p /opt/custom-dockers
sudo chown -R $USER:$USER /opt/custom-dockers
cd /opt/custom-dockers
```

---

### 4. Download this repo

```bash
git clone https://github.com/jamesking210/azuracast-obs-overlay.git
cd azuracast-obs-overlay
```

---

### 5. Create your `.env` file

```bash
cp .env.example .env
nano .env
```

Basic example:

```env
STATION_NAME=Your Station Name
AZURACAST_BASE_URL=http://host.docker.internal
AZURACAST_STATION_SHORT_NAME=station_short_name
AZURACAST_MOUNT_NAME=radio.mp3
OVERLAY_PORT=8089
FALLBACK_UP_NEXT=
```

For DJMixHub, mine would look like this:

```env
STATION_NAME=DJMixHub.com
AZURACAST_BASE_URL=http://host.docker.internal
AZURACAST_STATION_SHORT_NAME=djmixhub
AZURACAST_MOUNT_NAME=radio.mp3
OVERLAY_PORT=8089
FALLBACK_UP_NEXT=
```

Save the file in nano:

```text
CTRL + O
ENTER
CTRL + X
```

---

## How to find your AzuraCast station short name

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

## How to find your stream mount name

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

## Start it

From the project folder:

```bash
cd /opt/custom-dockers/azuracast-obs-overlay
sudo docker compose up -d --build
```

Check that it is running:

```bash
sudo docker compose ps
```

Watch logs:

```bash
sudo docker compose logs -f
```

---

## Test it

On the Ubuntu server:

```bash
curl -I http://localhost:8089/
curl http://localhost:8089/api/nowplaying_static
curl -I http://localhost:8089/radio.mp3
```

From another computer on the same network:

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

## Update later

```bash
cd /opt/custom-dockers/azuracast-obs-overlay
git pull
sudo docker compose up -d --build
```

---

## Stop it

```bash
cd /opt/custom-dockers/azuracast-obs-overlay
sudo docker compose down
```

---

## Notes

`.env.example` is just the example file.

The real settings file must be named:

```text
.env
```

Normal web browsers may block autoplay audio until you click something.

OBS usually plays the stream when this is checked:

```text
Control audio via OBS
```

If the overlay loads but metadata or audio does not work, test AzuraCast from the Ubuntu server first:

```bash
curl http://localhost/api/nowplaying_static/station_short_name.json
curl -I http://localhost/listen/station_short_name/radio.mp3
```

Replace `station_short_name` with your real AzuraCast short name.
