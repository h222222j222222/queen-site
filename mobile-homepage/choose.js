import { getTodayMind } from "./data.js";

const chooseMindHeadline = document.getElementById("chooseMindHeadline");
const chooseMindAdvice = document.getElementById("chooseMindAdvice");
const moodTabs = Array.from(document.querySelectorAll(".mood-tab"));
const moodNote = document.getElementById("moodNote");
const cardLinks = Array.from(document.querySelectorAll("[data-card-link]"));

const modeMeta = {
  anger: {
    note: "우선 시선이 오래 머무는 카드를 선택해 보세요.",
  },
  comfort: {
    note: "바라볼 때 마음이 편안해지는 카드를 고르세요.",
  },
  laugh: {
    note: "이끌리는 이유 없이 직감이 향하는 카드를 선택하세요.",
  },
};

const todayMind = getTodayMind();

function compactText(text, maxLength) {
  const normalized = text.trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trim()}...`;
}

function updateMode(mode) {
  document.body.dataset.mode = mode;

  moodTabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.mode === mode);
  });

  if (moodNote) {
    moodNote.textContent = modeMeta[mode].note;
  }

  cardLinks.forEach((link, index) => {
    link.href = `./loading.html?mode=${mode}&pick=${index + 1}`;
  });
}

if (chooseMindHeadline) {
  chooseMindHeadline.textContent = compactText(todayMind.headline, 40);
}

if (chooseMindAdvice) {
  chooseMindAdvice.textContent = compactText(todayMind.tip, 58);
}

moodTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    updateMode(tab.dataset.mode);
  });
});

updateMode("anger");
