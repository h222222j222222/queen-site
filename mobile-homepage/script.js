import { formatKoreanDate, getTodayMind } from "./data.js";

const mindDateLabel = document.getElementById("mindDateLabel");
const mindHeadline = document.getElementById("mindHeadline");
const mindInterpretation = document.getElementById("mindInterpretation");
const mindTip = document.getElementById("mindTip");

const todayMind = getTodayMind();

function compactText(text, maxLength) {
  const normalized = text.trim();
  const firstSentence = normalized.split(/(?<=[.!?])\s+/)[0] || normalized;

  if (firstSentence.length <= maxLength) {
    return firstSentence;
  }

  return `${firstSentence.slice(0, maxLength).trim()}...`;
}

if (mindDateLabel) {
  mindDateLabel.textContent = formatKoreanDate();
}

if (mindHeadline) {
  mindHeadline.textContent = todayMind.headline;
}

if (mindInterpretation) {
  mindInterpretation.textContent = compactText(todayMind.interpretation, 64);
}

if (mindTip) {
  mindTip.textContent = compactText(todayMind.tip, 58);
}
