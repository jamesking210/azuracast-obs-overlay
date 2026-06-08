(() => {
  const cfg = window.OVERLAY_CONFIG || {};

  const stationName = cfg.stationName || "Station";
  document.title = `${stationName} OBS Overlay`;

  const root = document.documentElement;
  root.style.setProperty("--ticker-height", `${Number(cfg.tickerHeight || 52)}px`);

  const stationNameEl = document.getElementById("stationName");
  const currentTrackEl = document.getElementById("currentTrack");
  const upNextEl = document.getElementById("upNext");
  const elapsedTimeEl = document.getElementById("elapsedTime");
  const durationTimeEl = document.getElementById("durationTime");
  const progressFillEl = document.getElementById("progressFill");
  const audioEl = document.getElementById("stationAudio");

  const API_URL = cfg.nowPlayingUrl || "/api/nowplaying_static";
  const STREAM_URL = cfg.streamUrl || "/radio.mp3";
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

  function formatSong(songObj, fallback = FALLBACK_UP_NEXT) {
    if (!songObj) return fallback;

    const song = songObj.song || songObj;
    const artist = clean(song.artist);
    const title = clean(song.title);
    const text = clean(song.text);

    if (artist && title) return `${artist} - ${title}`;
    if (text) return text;
    if (title) return title;
    if (artist) return artist;

    return fallback;
  }

  function formatTime(seconds) {
    seconds = Number(seconds);
    if (!isFinite(seconds) || seconds <= 0) return "--:--";

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
    fitText(currentTrackEl, 27, 19);
    fitText(upNextEl, 21, 15);
    fitText(stationNameEl, 25, 18);
  }

  function renderProgress() {
    const hasDuration = currentDuration > 0;
    const safeElapsed = Math.max(0, Math.min(currentElapsed, currentDuration || 0));
    const percent = hasDuration ? (safeElapsed / currentDuration) * 100 : 0;
    const safePercent = Math.max(0, Math.min(percent, 100));

    elapsedTimeEl.textContent = hasDuration ? formatTime(safeElapsed) : "--:--";
    durationTimeEl.textContent = hasDuration ? formatTime(currentDuration) : "--:--";
    progressFillEl.style.width = `${safePercent}%`;
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

      currentElapsed = Number(data.now_playing?.elapsed ?? 0);
      currentDuration = Number(data.now_playing?.duration ?? 0);

      currentTrackEl.textContent = currentTrack;
      currentTrackEl.title = currentTrack;

      upNextEl.textContent = upNext;
      upNextEl.title = upNext;

      renderProgress();
      startProgressTimer();

      requestAnimationFrame(fitAllText);
    } catch (err) {
      currentTrackEl.textContent = FALLBACK_TRACK;
      upNextEl.textContent = FALLBACK_UP_NEXT;

      currentElapsed = 0;
      currentDuration = 0;

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

  updateOverlay();
  startAudio();

  setInterval(updateOverlay, REFRESH_MS);
  window.addEventListener("resize", fitAllText);
})();
