#!/bin/sh
set -eu

: "${STATION_NAME:=Your Station Name}"
: "${AZURACAST_BASE_URL:=http://host.docker.internal}"
: "${AZURACAST_STATION_SHORT_NAME:=station_short_name}"
: "${AZURACAST_MOUNT_NAME:=radio.mp3}"
: "${FALLBACK_UP_NEXT:=$STATION_NAME}"

# Sensible defaults. Keep these out of .env.example so the setup stays simple.
: "${TICKER_HEIGHT:=52}"
: "${AUDIO_AUTOPLAY:=true}"
: "${AUDIO_VOLUME:=1.0}"
: "${API_REFRESH_MS:=5000}"
: "${FALLBACK_TRACK:=Waiting for AzuraCast metadata...}"

# Remove trailing slash so proxy URLs are predictable.
AZURACAST_BASE_URL="${AZURACAST_BASE_URL%/}"
export AZURACAST_BASE_URL AZURACAST_STATION_SHORT_NAME AZURACAST_MOUNT_NAME

case "$AUDIO_AUTOPLAY" in
  true|false) ;;
  *) AUDIO_AUTOPLAY=true ;;
esac

case "$AUDIO_VOLUME" in
  ''|*[!0-9.]* ) AUDIO_VOLUME=1.0 ;;
esac

case "$API_REFRESH_MS" in
  ''|*[!0-9]* ) API_REFRESH_MS=5000 ;;
esac

case "$TICKER_HEIGHT" in
  ''|*[!0-9]* ) TICKER_HEIGHT=52 ;;
esac

js_escape() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

cat > /usr/share/nginx/html/config.js <<EOF2
window.OVERLAY_CONFIG = {
  stationName: "$(js_escape "$STATION_NAME")",
  azuracastBaseUrl: "$(js_escape "$AZURACAST_BASE_URL")",
  nowPlayingUrl: "/api/nowplaying_static",
  streamUrl: "/radio.mp3",
  audioAutoplay: $AUDIO_AUTOPLAY,
  audioVolume: $AUDIO_VOLUME,
  refreshMs: $API_REFRESH_MS,
  tickerHeight: $TICKER_HEIGHT,
  fallbackTrack: "$(js_escape "$FALLBACK_TRACK")",
  fallbackUpNext: "$(js_escape "$FALLBACK_UP_NEXT")"
};
EOF2

envsubst '${AZURACAST_BASE_URL} ${AZURACAST_STATION_SHORT_NAME} ${AZURACAST_MOUNT_NAME}' \
  < /etc/nginx/templates/obs-overlay.conf.template \
  > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
