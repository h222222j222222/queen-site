(function() {
  var STORAGE_KEY = "queen-bgm-enabled-v2";
  var TIME_KEY = "queen-bgm-time-v2";
  var AUDIO_CANDIDATES = [
    "./audio/queen's song.mp3",
    "./audio/queen-bgm.mp3"
  ];
  var LYRICS_CANDIDATES = [
    "./audio/queen-lyrics.txt",
    "./audio/lyrics.txt"
  ];

  var audio = document.getElementById("bgmAudio");
  var toggle = document.getElementById("musicToggle");
  var lyricsToggle = document.getElementById("lyricsToggle");
  var lyricsDialog = document.getElementById("lyricsDialog");
  var lyricsContent = document.getElementById("lyricsContent");
  var lyricsClose = document.getElementById("lyricsClose");

  if (audio && toggle) {
    var savedPreference = localStorage.getItem(STORAGE_KEY);
    var wantsMusic = savedPreference === null ? true : savedPreference === "true";
    var autoplayBlocked = false;
    var audioCandidateIndex = 0;

    audio.volume = 0.42;
    audio.autoplay = true;

    var savedTime = Number(sessionStorage.getItem(TIME_KEY) || 0);
    if (isFinite(savedTime) && savedTime > 0) {
      var onLoadedMetadata = function() {
        audio.currentTime = Math.min(savedTime, isFinite(audio.duration) ? audio.duration : savedTime);
        audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      };
      audio.addEventListener("loadedmetadata", onLoadedMetadata);
    }

    function updateButton() {
      var isPlaying = !audio.paused && !audio.ended;

      if (isPlaying) {
        toggle.className = toggle.className.replace(/\bis-playing\b/g, '') + ' is-playing';
      } else {
        toggle.className = toggle.className.replace(/\bis-playing\b/g, '');
      }
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
      
      var urlStr = AUDIO_CANDIDATES[audioCandidateIndex];
      // Fallback for missing URL constructor or weird environments
      try {
        audio.src = new URL(urlStr, window.location.href).href;
      } catch (e) {
        audio.src = urlStr;
      }
      audio.load();
    }

    function attemptPlay() {
      if (!wantsMusic || !audio.src) {
        updateButton();
        return;
      }

      var playTask = audio.play();
      if (playTask && playTask.catch) {
        playTask.catch(function(e) {
          autoplayBlocked = true;
          updateButton();
          armAutoplayRetry();
        });
      }
      
      // Update UI immediately since we can't always wait for promise
      updateButton();
    }

    function pauseAudio() {
      wantsMusic = false;
      persistState();
      autoplayBlocked = false;
      audio.pause();
      updateButton();
    }

    function armAutoplayRetry() {
      if (!autoplayBlocked) return;

      var resume = function() {
        if (wantsMusic && audio.paused) {
          attemptPlay();
        }
        window.removeEventListener("pointerdown", resume);
        window.removeEventListener("touchstart", resume);
        window.removeEventListener("click", resume);
        window.removeEventListener("keydown", resume);
      };

      window.addEventListener("pointerdown", resume);
      window.addEventListener("touchstart", resume);
      window.addEventListener("click", resume);
      window.addEventListener("keydown", resume);
    }

    toggle.onclick = function() {
      if (!audio.paused && !audio.ended) {
        pauseAudio();
      } else {
        wantsMusic = true;
        persistState();
        attemptPlay();
      }
    };

    audio.oncanplay = function() {
      if (wantsMusic && audio.paused) {
        attemptPlay();
      }
    };

    audio.onerror = function() {
      audioCandidateIndex += 1;
      setAudioSource();
    };

    audio.onplay = updateButton;
    audio.onpause = updateButton;
    audio.onended = updateButton;

    window.onbeforeunload = function() {
      sessionStorage.setItem(TIME_KEY, String(audio.currentTime || 0));
    };

    persistState();
    updateButton();
    setAudioSource();
  }

  if (lyricsToggle && lyricsDialog && lyricsContent && lyricsClose) {
    var lyricsLoaded = false;

    function loadLyrics() {
      var candidateIndex = 0;
      function tryNext() {
        if (candidateIndex >= LYRICS_CANDIDATES.length) {
          lyricsContent.textContent = "가사 파일을 찾지 못했어. audio/queen-lyrics.txt에 넣어주면 돼.";
          return;
        }

        var xhr = new XMLHttpRequest();
        xhr.open("GET", LYRICS_CANDIDATES[candidateIndex], true);
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              lyricsContent.textContent = xhr.responseText.trim() || "가사 내용이 아직 비어 있어.";
              lyricsLoaded = true;
            } else {
              candidateIndex += 1;
              tryNext();
            }
          }
        };
        xhr.send();
      }
      tryNext();
    }

    lyricsToggle.onclick = function() {
      if (!lyricsLoaded) {
        loadLyrics();
      }
      if (lyricsDialog.showModal) {
        lyricsDialog.showModal();
      } else {
        lyricsDialog.style.display = 'block';
      }
    };

    lyricsClose.onclick = function() {
      if (lyricsDialog.close) {
        lyricsDialog.close();
      } else {
        lyricsDialog.style.display = 'none';
      }
    };

    lyricsDialog.onclick = function(event) {
      if (event.target === lyricsDialog) {
        if (lyricsDialog.close) lyricsDialog.close();
        else lyricsDialog.style.display = 'none';
      }
    };
  }

  // UI Sound Effects
  var AudioContext = window.AudioContext || window.webkitAudioContext;
  if (AudioContext) {
    var audioCtx = new AudioContext();

    function playTone(freq, type, duration, vol) {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      
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

    function addSoundListeners(evts, freq, type, duration, vol) {
      for (var i = 0; i < evts.length; i++) {
        document.addEventListener(evts[i], function(e) {
          var target = e.target;
          while (target && target !== document) {
            if (target.tagName === 'BUTTON' || target.tagName === 'A' || 
                (target.className && (target.className.indexOf('pick-card') !== -1 || target.className.indexOf('mood-tab') !== -1))) {
              if (!target.disabled) {
                playTone(freq, type, duration, vol);
              }
              break;
            }
            target = target.parentNode;
          }
        }, true);
      }
    }

    addSoundListeners(['pointerenter', 'mouseenter'], 600, 'sine', 0.1, 0.03);
    addSoundListeners(['pointerdown', 'touchstart', 'mousedown'], 400, 'triangle', 0.15, 0.08);
  }
})();
