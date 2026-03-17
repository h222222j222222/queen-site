import { getCategory, readingsByCategory } from "./data.js";
import { readState, writeState } from "./state.js";

const drawCategoryTitle = document.getElementById("drawCategoryTitle");
const drawCategoryLead = document.getElementById("drawCategoryLead");
const drawStatus = document.getElementById("drawStatus");
const cards = Array.from(document.querySelectorAll(".tarot-card"));

const state = readState();
const category = getCategory(state.categoryId);

if (!category || !readingsByCategory[category.id]) {
  window.location.replace("./choose.html");
} else {
  if (drawCategoryTitle) {
    drawCategoryTitle.textContent = category.label;
  }

  if (drawCategoryLead) {
    drawCategoryLead.textContent = category.lead;
  }

  const pickRandom = (items) => items[Math.floor(Math.random() * items.length)];

  let isSelecting = false;

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      if (isSelecting) {
        return;
      }

      isSelecting = true;

      cards.forEach((candidate) => {
        candidate.disabled = true;
        candidate.classList.toggle("is-picked", candidate === card);
        candidate.classList.toggle("is-dimmed", candidate !== card);
      });

      if (drawStatus) {
        drawStatus.textContent = "퀸의 카드를 확인하는 중...✧";
      }

      window.setTimeout(() => {
        const results = readingsByCategory[category.id];
        const filtered =
          results.length > 1 ? results.filter((result) => result.id !== state.resultId) : results;
        const nextResult = pickRandom(filtered);
        const nextImage = pickRandom(nextResult.image);

        writeState({
          categoryId: category.id,
          slot: card.dataset.slot || "1",
          resultId: nextResult.id,
          image: nextImage,
        });

        window.location.href = "./result.html";
      }, 560);
    });
  });
}
