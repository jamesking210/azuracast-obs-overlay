(() => {
  const cfg = window.OVERLAY_CONFIG || {};

  const stationName = cfg.stationName || "Station";
  document.title = `${stationName} OBS Overlay`;

  const root = document.documentElement;
  root.style.setProperty("--ticker-height", `${Number(cfg.tickerHeight || 52)}px`);

  const stationLogoSlotEl = document.getElementById("stationLogoSlot");
  const stationLogoEl = document.getElementById("stationLogo");
  const currentArtworkSlotEl = document.getElementById("currentArtworkSlot");
  const currentArtworkEl = document.getElementById("currentArtwork");
  const nextArtworkSlotEl = document.getElementById("nextArtworkSlot");
  const nextArtworkEl = document.getElementById("nextArtwork");
  const stationNameEl = document.getElementById("stationName");
  const currentTrackEl = document.getElementById("currentTrack");
  const upNextEl = document.getElementById("upNext");
  const elapsedTimeEl = document.getElementById("elapsedTime");
  const remainingTimeEl = document.getElementById("remainingTime");
  const progressFillEl = document.getElementById("progressFill");
  const audioEl = document.getElementById("stationAudio");

  const API_URL = cfg.nowPlayingUrl || "/api/nowplaying_static";
  const STREAM_URL = cfg.streamUrl || "/radio.mp3";
  const AZURACAST_BASE_URL = cfg.azuracastBaseUrl || "";
  const STATION_LOGO_URL = cfg.stationLogoUrl || "";
  const REFRESH_MS = Number(cfg.refreshMs || 5000);
  const FALLBACK_TRACK = cfg.fallbackTrack || "Waiting for AzuraCast metadata...";
  const FALLBACK_UP_NEXT = cfg.fallbackUpNext || stationName;

  let currentElapsed = 0;
  let currentDuration = 0;
  let progressTimer = null;

  if (stationNameEl) {
    stationNameEl.textContent = stationName;
  }

  if (upNextEl) {
    upNextEl.textContent = FALLBACK_UP_NEXT;
  }

  function clean(value, fallback = "") {
    if (!value) return fallback;
    return String(value).replace(/\s+/g, " ").trim();
  }

  function getSongParts(songObj) {
    const song = songObj?.song || songObj || {};
    return {
      artist: clean(song.artist),
      title: clean(song.title),
      text: clean(song.text)
    };
  }

  function formatSong(songObj, fallback) {
    const { artist, title, text } = getSongParts(songObj);

    if (artist && title) return `${artist} - ${title}`;
    if (text) return text;
    if (title) return title;
    if (artist) return artist;

    return fallback;
  }

  function getArtworkUrl(songObj) {
    if (!songObj) return "";

    const song = songObj.song || songObj;
    const candidates = [
      song.art,
      song.album_art,
      song.artwork,
      song.thumbnail,
      songObj.art,
      songObj.album_art,
      songObj.artwork
    ];

    const found = candidates.find((value) => clean(value));
    return found ? normalizeArtworkUrl(clean(found)) : "";
  }

  function normalizeArtworkUrl(url) {
    if (!url) return "";

    try {
      if (url.startsWith("/")) {
        return url;
      }

      const parsed = new URL(url);

      if (parsed.pathname.startsWith("/api/station/")) {
        return `${parsed.pathname}${parsed.search}`;
      }

      if (AZURACAST_BASE_URL) {
        const azura = new URL(AZURACAST_BASE_URL);
        if (parsed.hostname === azura.hostname && parsed.pathname.startsWith("/api/")) {
          return `${parsed.pathname}${parsed.search}`;
        }
      }

      return url;
    } catch (err) {
      return url;
    }
  }

  function setArtwork(slotEl, imgEl, url) {
    if (!slotEl || !imgEl) return;

    if (!url) {
      slotEl.classList.remove("has-artwork");
      slotEl.classList.remove("has-logo");
      imgEl.removeAttribute("src");
      return;
    }

    imgEl.onload = () => {
      slotEl.classList.add(slotEl === stationLogoSlotEl ? "has-logo" : "has-artwork");
    };

    imgEl.onerror = () => {
      slotEl.classList.remove("has-artwork");
      slotEl.classList.remove("has-logo");
      imgEl.removeAttribute("src");
    };

    if (imgEl.src !== url) {
      imgEl.src = url;
    }
  }

  function formatTime(seconds) {
    seconds = Number(seconds);
    if (!isFinite(seconds) || seconds < 0) return "--:--";

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, "0")}`;
  }

  function fitText(el, maxSize, minSize) {
    if (!el) return;

    el.style.fontSize = `${maxSize}px`;

    let loops = 0;
    while (
      el.scrollWidth > el.clientWidth &&
      parseInt(el.style.fontSize, 10) > minSize &&
      loops < 60
    ) {
      el.style.fontSize = `${parseInt(el.style.fontSize, 10) - 1}px`;
      loops++;
    }
  }

  function fitAllText() {
    fitText(currentTrackEl, 24, 17);
    fitText(upNextEl, 19, 14);
    fitText(stationNameEl, 22, 16);
  }

  function renderProgress() {
    const hasDuration = currentDuration > 0;
    const safeElapsed = Math.max(0, Math.min(currentElapsed, currentDuration || 0));
    const remaining = hasDuration ? Math.max(0, currentDuration - safeElapsed) : 0;
    const percent = hasDuration ? (safeElapsed / currentDuration) * 100 : 0;
    const safePercent = Math.max(0, Math.min(percent, 100));

    if (elapsedTimeEl) {
      elapsedTimeEl.textContent = hasDuration ? formatTime(safeElapsed) : "--:--";
    }

    if (remainingTimeEl) {
      remainingTimeEl.textContent = hasDuration ? `-${formatTime(remaining)}` : "-:--";
    }

    if (progressFillEl) {
      progressFillEl.style.width = `${safePercent}%`;
    }

    root.style.setProperty("--bar-progress", hasDuration ? `${safePercent}%` : "0%");
  }

  function startProgressTimer() {
    if (progressTimer) clearInterval(progressTimer);

    progressTimer = setInterval(() => {
      if (currentDuration > 0 && currentElapsed < currentDuration) {
        currentElapsed += 1;
        renderProgress();
      }
    }, 1000);
  }

  async function updateOverlay() {
    try {
      const response = await fetch(`${API_URL}?t=${Date.now()}`, {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error(`Now playing request failed: ${response.status}`);
      }

      const data = await response.json();

      const currentTrack = formatSong(data.now_playing, FALLBACK_TRACK);
      const upNext = formatSong(data.playing_next, FALLBACK_UP_NEXT);
      const currentArtworkUrl = getArtworkUrl(data.now_playing);
      const nextArtworkUrl = getArtworkUrl(data.playing_next);

      currentElapsed = Number(data.now_playing?.elapsed ?? 0);
      currentDuration = Number(data.now_playing?.duration ?? 0);

      currentTrackEl.textContent = currentTrack;
      currentTrackEl.title = currentTrack;

      upNextEl.textContent = upNext;
      upNextEl.title = upNext;

      setArtwork(currentArtworkSlotEl, currentArtworkEl, currentArtworkUrl);
      setArtwork(nextArtworkSlotEl, nextArtworkEl, nextArtworkUrl);

      renderProgress();
      startProgressTimer();

      requestAnimationFrame(fitAllText);
    } catch (err) {
      currentTrackEl.textContent = FALLBACK_TRACK;
      upNextEl.textContent = FALLBACK_UP_NEXT;

      currentElapsed = 0;
      currentDuration = 0;

      setArtwork(currentArtworkSlotEl, currentArtworkEl, "");
      setArtwork(nextArtworkSlotEl, nextArtworkEl, "");

      renderProgress();
      requestAnimationFrame(fitAllText);
    }
  }

  async function startAudio() {
    if (!audioEl) return;

    audioEl.src = STREAM_URL;
    audioEl.volume = Number(cfg.audioVolume ?? 1);

    if (cfg.audioAutoplay === false) return;

    try {
      await audioEl.play();
    } catch (err) {
      // Normal browsers may block autoplay. OBS Browser Source usually allows it.
      // The /help page has a click-to-test audio button.
    }
  }

  setArtwork(stationLogoSlotEl, stationLogoEl, normalizeArtworkUrl(STATION_LOGO_URL));
  updateOverlay();
  startAudio();

  setInterval(updateOverlay, REFRESH_MS);
  window.addEventListener("resize", fitAllText);
})();
