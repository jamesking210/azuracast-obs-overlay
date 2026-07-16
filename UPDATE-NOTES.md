# Top / bottom overlay URL options

Changed files:
- site/styles.css
- site/app.js
- nginx.conf.template

URLs:
- https://overlay.djmixhub.com = bottom
- https://overlay.djmixhub.com/bottom = bottom
- https://overlay.djmixhub.com/top = top
- https://overlay.djmixhub.com/?position=top = top
- https://overlay.djmixhub.com/?position=bottom = bottom

After uploading to GitHub:

```bash
cd /opt/custom-dockers/azuracast-obs-overlay
git pull
sudo docker compose up -d --build
```

Then refresh OBS browser source cache.
