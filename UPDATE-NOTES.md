# Artwork-left update

This replaces the LIVE pill on the left with current track artwork.

Behavior:

- If AzuraCast provides artwork, the 42x42 image shows on the left.
- If no artwork loads, it falls back to the small LIVE badge.
- The solid bottom bar and full-width progress glow stay.
- The small timer progress bar stays.

Files changed:

- site/index.html
- site/styles.css
- site/app.js
- docker-entrypoint.sh
- nginx.conf.template

After uploading these to GitHub, update the server:

```bash
cd /opt/custom-dockers/azuracast-obs-overlay
git pull
sudo docker compose up -d --build
```

Then refresh the OBS browser source cache.

If OBS does not update right away:

```text
Right-click Browser Source
Properties
Refresh cache of current page
OK
```

If needed, remove and re-add the browser source.
