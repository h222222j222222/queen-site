const STORAGE_KEY = "queen-bgm-enabled-v2";
const TIME_KEY = "queen-bgm-time-v2";
const AUDIO_CANDIDATES = [
  "./audio/queen's song.mp3",
  "./audio/queen-bgm.mp3",
];
const LYRICS_CANDIDATES = [
  "./audio/queen-lyrics.txt",
  "./audio/lyrics.txt",
];

const audio = document.getElementById("bgmAudio");
const toggle = document.getElementById("musicToggle");
const lyricsToggle = document.getElementById("lyricsToggle");
const lyricsDialog = document.getElementById("lyricsDialog");
const lyricsContent = document.getElementById("lyricsContent");
const lyricsClose = document.getElementById("lyricsClose");

if (audio && toggle) {
  const savedPreference = localStorage.getItem(STORAGE_KEY);
  let wantsMusic = savedPreference === null ? true : savedPreference === "true";
  let autoplayBlocked = false;
  let audioCandidateIndex = 0;

  audio.volume = 0.42;
  audio.autoplay = true;

  const savedTime = Number(sessionStorage.getItem(TIME_KEY) || 0);
  if (Number.isFinite(savedTime) && savedTime > 0) {
    audio.addEventListener(
      "loadedmetadata",
      () => {
        audio.currentTime = Math.min(savedTime, Number.isFinite(audio.duration) ? audio.duration : savedTime);
      },
      { once: true },
    );
  }

  function updateButton() {
    const isPlaying = !audio.paused && !audio.ended;

    toggle.classList.toggle("is-playing", isPlaying);
    toggle.setAttribute("aria-pressed", String(isPlaying));
    toggle.textContent = isPlaying ? "🎵" : "🔇";
    toggle.setAttribute("aria-label", isPlaying ? "배경음악 끄기" : "배경음악 켜기");
    toggle.title = isPlaying ? "배경음악 끄기" : "배경음악 켜기";
  }

  function persistState() {
    localStorage.setItem(STORAGE_KEY, String(wantsMusic));
  }

  function setAudioSource() {
    if (audioCandidateIndex >= AUDIO_CANDIDATES.length) {
      updateButton();
      return;
    }

    audio.src = new URL(AUDIO_CANDIDATES[audioCandidateIndex], window.location.href).href;
    audio.load();
  }

  async function attemptPlay() {
    if (!wantsMusic || !audio.src) {
      updateButton();
      return;
    }

    try {
      await audio.play();
      autoplayBlocked = false;
      updateButton();
    } catch (e) {
      autoplayBlocked = true;
      updateButton();
      armAutoplayRetry();
    }
  }

  function pauseAudio() {
    wantsMusic = false;
    persistState();
    autoplayBlocked = false;
    audio.pause();
    updateButton();
  }

  function armAutoplayRetry() {
    if (!autoplayBlocked) {
      return;
    }

    const resume = () => {
      if (wantsMusic && audio.paused) {
        attemptPlay();
      }
    };

    window.addEventListener("pointerdown", resume, { once: true });
    window.addEventListener("touchstart", resume, { once: true });
    window.addEventListener("click", resume, { once: true });
    window.addEventListener("keydown", resume, { once: true });
  }

  toggle.addEventListener("click", () => {
    if (!audio.paused && !audio.ended) {
      pauseAudio();
      return;
    }

    wantsMusic = true;
    persistState();
    attemptPlay();
  });

  audio.addEventListener("canplay", () => {
    if (wantsMusic && audio.paused) {
      attemptPlay();
    }
  });

  audio.addEventListener("error", () => {
    audioCandidateIndex += 1;
    setAudioSource();
  });

  audio.addEventListener("play", updateButton);
  audio.addEventListener("pause", updateButton);
  audio.addEventListener("ended", updateButton);

  window.addEventListener("beforeunload", () => {
    sessionStorage.setItem(TIME_KEY, String(audio.currentTime || 0));
  });

  persistState();
  updateButton();
  setAudioSource();
}

if (lyricsToggle && lyricsDialog && lyricsContent && lyricsClose) {
  let lyricsLoaded = false;

  async function loadLyrics() {
    for (const path of LYRICS_CANDIDATES) {
      try {
        const response = await fetch(new URL(path, window.location.href).href);
        if (!response.ok) {
          continue;
        }
        const text = await response.text();
        lyricsContent.textContent = text.trim() || "가사 내용이 아직 비어 있어.";
        lyricsLoaded = true;
        return;
      } catch (e) {
        continue;
      }
    }

    lyricsContent.textContent = "가사 파일을 찾지 못했어. audio/queen-lyrics.txt에 넣어주면 돼.";
  }

  lyricsToggle.addEventListener("click", async () => {
    if (!lyricsLoaded) {
      await loadLyrics();
    }
    lyricsDialog.showModal();
  });

  lyricsClose.addEventListener("click", () => {
    lyricsDialog.close();
  });

  lyricsDialog.addEventListener("click", (event) => {
    if (event.target === lyricsDialog) {
      lyricsDialog.close();
    }
  });
}

// UI Sound Effects
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type, duration, vol) {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(freq * 1.5, audioCtx.currentTime + duration);
  
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

['pointerenter', 'mouseenter'].forEach((evt) => {
  document.addEventListener(evt, (e) => {
    const target = e.target.closest('button, a, .pick-card, .mood-tab');
    if (target && !target.disabled) {
      playTone(600, 'sine', 0.1, 0.03);
    }
  }, { capture: true, passive: true });
});

['pointerdown', 'touchstart', 'mousedown'].forEach((evt) => {
  document.addEventListener(evt, (e) => {
    const target = e.target.closest('button, a, .pick-card, .mood-tab');
    if (target && !target.disabled) {
      playTone(400, 'triangle', 0.15, 0.08);
    }
  }, { capture: true, passive: true });
});
