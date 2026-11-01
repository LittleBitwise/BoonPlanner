const cards = [...document.querySelectorAll(".level-card")];
const soulsValue = document.querySelector("#soulsValue");
const levelValue = document.querySelector("#levelValue");
const rewardValue = document.querySelector("#rewardValue");
const nextValue = document.querySelector("#nextValue");
const progressFill = document.querySelector("#progressFill");
const progressTrack = document.querySelector(".progress-track");
let selectedLevel = 0;

function formatSouls(value) {
  return Number(value).toLocaleString("en-US");
}

function selectLevel(level) {
  selectedLevel = Math.max(0, Math.min(cards.length - 1, level));
  const selectedCard = cards[selectedLevel];
  const totalSouls = Number(selectedCard.dataset.souls);
  const nextCard = cards[selectedLevel + 1];

  cards.forEach((card, index) => {
    const isSelected = index === selectedLevel;
    card.classList.toggle("is-selected", isSelected);
    card.setAttribute("aria-pressed", String(isSelected));
  });

  soulsValue.textContent = formatSouls(totalSouls);
  levelValue.textContent = String(selectedLevel).padStart(2, "0");
  rewardValue.textContent = selectedCard.dataset.reward;
  nextValue.innerHTML = nextCard ? `NEXT <b>${formatSouls(nextCard.dataset.souls)}</b>` : "MAXIMUM LEVEL";
  progressFill.style.width = `${(selectedLevel / (cards.length - 1)) * 100}%`;
  progressTrack.setAttribute("aria-valuenow", String(selectedLevel));
  document.title = `Level ${selectedLevel} · ${formatSouls(totalSouls)} souls | Boon Picker`;
}

cards.forEach((card) => {
  card.addEventListener("click", () => selectLevel(Number(card.dataset.level)));
});

document.querySelector("#previousButton").addEventListener("click", () => selectLevel(selectedLevel - 1));
document.querySelector("#nextButton").addEventListener("click", () => selectLevel(selectedLevel + 1));
document.querySelector("#resetButton").addEventListener("click", () => selectLevel(0));

document.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.key === "ArrowLeft") selectLevel(selectedLevel - 1);
  if (event.key === "ArrowRight") selectLevel(selectedLevel + 1);
});
