# Logo + current + coming up layout update

New format:

[station logo] StationName  |  [current artwork] Artist - Song Title  |  elapsed / remaining progress bar  |  COMING UP: [next artwork] Song Title

Files changed:

- .env.example
- site/index.html
- site/styles.css
- site/app.js
- docker-entrypoint.sh
- nginx.conf.template

New optional .env value:

STATION_LOGO_URL=

Examples:

STATION_LOGO_URL=https://example.com/logo.png
STATION_LOGO_URL=/logo.png

If blank, the logo hides cleanly.
