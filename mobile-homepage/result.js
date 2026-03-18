(function() {
  var params = new URLSearchParams(window.location.search);
  var mode = params.get("mode");
  var pick = Number(params.get("pick") || 1);
  var config = mode ? window.resultModes[mode] : null;

  var resultCard = document.getElementById("resultCard");
  var resultKicker = document.getElementById("resultKicker");
  var resultTitle = document.getElementById("resultTitle");
  var resultCaption = document.getElementById("resultCaption");
  var resultSignature = document.getElementById("resultSignature");
  var resultMedia = document.getElementById("resultMedia");
  var resultImage = document.getElementById("resultImage");
  var rerollButton = document.getElementById("rerollButton");
  var QUEUE_KEY = "queen-result-queue:" + (mode || "unknown") + ":" + pick;

  var renderTimer = 0;

  function splitLeadText(text) {
    var normalized = text.trim();
    var match = normalized.match(/(.+?[.!?])\s*(.*)/);

    if (!match) {
      return {
        primary: normalized,
        secondary: ""
      };
    }

    return {
      primary: match[1].trim(),
      secondary: match[2].trim()
    };
  }

  function removeLeadPrefix(text) {
    // legacy environments don't like 'u' flag
    return text.trim().replace(/^퀸,\s*/, "");
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatLeadForDisplay(text) {
    var normalized = text.trim().replace(/\s+/g, " ");
    return escapeHtml(normalized);
  }

  function shuffleIndices(length) {
    var values = [];
    for (var i = 0; i < length; i++) values.push(i);

    for (var index = values.length - 1; index > 0; index -= 1) {
      var randomIndex = Math.floor(Math.random() * (index + 1));
      var temp = values[index];
      values[index] = values[randomIndex];
      values[randomIndex] = temp;
    }

    return values;
  }

  function loadQueue(length) {
    var today = window.getLocalDateKey();

    try {
      var saved = sessionStorage.getItem(QUEUE_KEY);

      if (saved) {
        var state = JSON.parse(saved);
        var isValidOrder =
          Array.isArray(state.order) &&
          state.order.length === length &&
          state.order.every(function(value) { return typeof value === 'number' && value >= 0 && value < length; });

        if (state.day === today && isValidOrder && typeof state.pointer === 'number' && typeof state.lastIndex === 'number') {
          return state;
        }
      }
    } catch (e) {
      // Ignore
    }

    var order = shuffleIndices(length);

    if (length > 1) {
      var shift = ((pick - 1) % length + length) % length;
      var itemsToMove = order.splice(0, shift);
      for (var i = 0; i < itemsToMove.length; i++) {
        order.push(itemsToMove[i]);
      }
    }

    return {
      day: today,
      order: order,
      pointer: 0,
      lastIndex: -1
    };
  }

  function saveQueue(state) {
    try {
      sessionStorage.setItem(QUEUE_KEY, JSON.stringify(state));
    } catch (error) {
      // Ignore
    }
  }

  function getNextItemIndex(length) {
    var state = loadQueue(length);

    if (state.pointer >= state.order.length) {
      state.order = shuffleIndices(length);

      if (length > 1 && state.order[0] === state.lastIndex) {
        var temp = state.order[0];
        state.order[0] = state.order[1];
        state.order[1] = temp;
      }

      state.pointer = 0;
    }

    var nextIndex = state.order[state.pointer];
    state.pointer += 1;
    state.lastIndex = nextIndex;
    saveQueue(state);

    return nextIndex;
  }

  if (!config || !resultCard || !resultKicker || !resultTitle || !resultCaption || !resultSignature) {
    window.location.replace("./choose.html");
  } else {
    document.body.className += " theme-" + mode;
    document.title = config.title + " | 퀸의 마인드";

    function renderImage(item) {
      if (!resultMedia || !resultImage) {
        return;
      }

      // Initial visible false to prevent flicker, but but ensure it triggers.
      resultMedia.style.display = 'none';
      resultImage.alt = config.title + " 이미지 " + item.id;

      var candidates = window.getImageCandidates(mode, item.id);
      var candidateIndex = 0;

      function tryNextImage() {
        if (candidateIndex >= candidates.length) {
          resultMedia.style.display = 'none';
          resultImage.removeAttribute("src");
          return;
        }

        var preloader = new Image();
        preloader.onload = function() {
          resultImage.src = preloader.src;
          resultMedia.removeAttribute("hidden");
          resultMedia.style.display = ""; // Defaults to grid from CSS
        };
        preloader.onerror = function() {
          candidateIndex += 1;
          tryNextImage();
        };
        preloader.src = candidates[candidateIndex];
      }

      tryNextImage();
    }

    function renderResult() {
      var nextIndex = getNextItemIndex(config.items.length);
      var item = config.items[nextIndex];
      var copy = window.buildResultCopy(mode, item);
      var lead = splitLeadText(removeLeadPrefix(copy.lead));
      var captionParts = [];
      if (lead.secondary) captionParts.push(lead.secondary);
      if (copy.support) captionParts.push(copy.support);

      resultKicker.textContent = config.label;
      resultTitle.innerHTML = formatLeadForDisplay(lead.primary);
      
      if (captionParts.length > 0) {
        resultCaption.removeAttribute("hidden");
        resultCaption.style.display = "";
        resultCaption.textContent = captionParts.join(" ");
      } else {
        resultCaption.setAttribute("hidden", "");
        resultCaption.style.display = "none";
        resultCaption.textContent = "";
      }
      
      resultSignature.innerHTML = copy.signatureTop + "<span>" + copy.signatureBottom + "</span>";
      renderImage(item);
    }

    function showResult(isReroll) {
      window.clearTimeout(renderTimer);
      resultCard.style.display = 'none';

      if (isReroll) {
        renderTimer = window.setTimeout(function() {
          renderResult();
          resultCard.removeAttribute("hidden");
          resultCard.style.display = "";
        }, 300);
      } else {
        renderResult();
        resultCard.removeAttribute("hidden");
        resultCard.style.display = "";
      }
    }

    if (rerollButton) {
      rerollButton.onclick = function() {
        showResult(true);
      };
    }

    showResult(false);
  }
})();
