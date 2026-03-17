import { buildResultCopy, getImageCandidates, getLocalDateKey, resultModes } from "./data.js";

const params = new URLSearchParams(window.location.search);
const mode = params.get("mode");
const pick = Number(params.get("pick") || 1);
const config = mode ? resultModes[mode] : null;


const resultCard = document.getElementById("resultCard");
const resultKicker = document.getElementById("resultKicker");
const resultTitle = document.getElementById("resultTitle");
const resultCaption = document.getElementById("resultCaption");
const resultSignature = document.getElementById("resultSignature");
const resultMedia = document.getElementById("resultMedia");
const resultImage = document.getElementById("resultImage");
const rerollButton = document.getElementById("rerollButton");
const QUEUE_KEY = `queen-result-queue:${mode || "unknown"}:${pick}`;

let renderTimer = 0;

function splitLeadText(text) {
  const normalized = text.trim();
  const match = normalized.match(/(.+?[.!?])\s*(.*)/);

  if (!match) {
    return {
      primary: normalized,
      secondary: "",
    };
  }

  return {
    primary: match[1].trim(),
    secondary: match[2].trim(),
  };
}

function removeLeadPrefix(text) {
  return text.trim().replace(/^퀸,\s*/u, "");
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatLeadForDisplay(text) {
  const normalized = text.trim().replace(/\s+/g, " ");
  return escapeHtml(normalized);
}

function shuffleIndices(length) {
  const values = Array.from({ length }, (_, index) => index);

  for (let index = values.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [values[index], values[randomIndex]] = [values[randomIndex], values[index]];
  }

  return values;
}

function loadQueue(length) {
  const today = getLocalDateKey();

  try {
    const saved = sessionStorage.getItem(QUEUE_KEY);

    if (saved) {
      const state = JSON.parse(saved);
      const isValidOrder =
        Array.isArray(state.order) &&
        state.order.length === length &&
        state.order.every((value) => Number.isInteger(value) && value >= 0 && value < length);

      if (state.day === today && isValidOrder && Number.isInteger(state.pointer) && Number.isInteger(state.lastIndex)) {
        return state;
      }
    }
  } catch {
    // Ignore invalid session data and recreate the queue below.
  }

  const order = shuffleIndices(length);

  if (length > 1) {
    const shift = ((pick - 1) % length + length) % length;
    order.push(...order.splice(0, shift));
  }

  return {
    day: today,
    order,
    pointer: 0,
    lastIndex: -1,
  };
}

function saveQueue(state) {
  sessionStorage.setItem(QUEUE_KEY, JSON.stringify(state));
}

function getNextItemIndex(length) {
  const state = loadQueue(length);

  if (state.pointer >= state.order.length) {
    state.order = shuffleIndices(length);

    if (length > 1 && state.order[0] === state.lastIndex) {
      [state.order[0], state.order[1]] = [state.order[1], state.order[0]];
    }

    state.pointer = 0;
  }

  const nextIndex = state.order[state.pointer];
  state.pointer += 1;
  state.lastIndex = nextIndex;
  saveQueue(state);

  return nextIndex;
}

if (!config || !resultCard || !resultKicker || !resultTitle || !resultCaption || !resultSignature) {
  window.location.replace("./choose.html");
} else {
  document.body.classList.add(`theme-${mode}`);
  document.title = `${config.title} | 퀸의 마인드`;


  function renderImage(item) {
    if (!resultMedia || !resultImage) {
      return;
    }

    resultMedia.hidden = true;
    resultImage.alt = `${config.title} 이미지 ${item.id}`;

    const candidates = getImageCandidates(mode, item.id);
    let candidateIndex = 0;

    const tryNextImage = () => {
      if (candidateIndex >= candidates.length) {
        resultMedia.hidden = true;
        resultImage.removeAttribute("src");
        return;
      }

      const preloader = new Image();
      preloader.onload = () => {
        resultImage.src = preloader.src;
        resultMedia.hidden = false;
      };
      preloader.onerror = () => {
        candidateIndex += 1;
        tryNextImage();
      };
      preloader.src = candidates[candidateIndex];
    };

    tryNextImage();
  }

  function renderResult() {
    const nextIndex = getNextItemIndex(config.items.length);
    const item = config.items[nextIndex];
    const copy = buildResultCopy(mode, item);
    const lead = splitLeadText(removeLeadPrefix(copy.lead));
    const captionParts = [lead.secondary, copy.support].filter(Boolean);

    resultKicker.textContent = config.label;
    resultTitle.innerHTML = formatLeadForDisplay(lead.primary);
    if (captionParts.length > 0) {
      resultCaption.hidden = false;
      resultCaption.textContent = captionParts.join(" ");
    } else {
      resultCaption.hidden = true;
      resultCaption.textContent = "";
    }
    resultSignature.innerHTML = `${copy.signatureTop}<span>${copy.signatureBottom}</span>`;
    renderImage(item);
  }

  function showResult(isReroll = false) {
    window.clearTimeout(renderTimer);
    resultCard.hidden = true;

    if (isReroll) {
      renderTimer = window.setTimeout(() => {
        renderResult();
        resultCard.hidden = false;
      }, 300);
    } else {
      renderResult();
      resultCard.hidden = false;
    }
  }

  rerollButton?.addEventListener("click", () => {
    showResult(true);
  });

  showResult(false);
}
