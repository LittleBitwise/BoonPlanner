const levels = JSON.parse(document.querySelector("#boon-levels").textContent);
const abilityCards = [...document.querySelectorAll(".ability-card")];
const milestoneCards = [...document.querySelectorAll(".level-card")];
const soulsValue = document.querySelector("#soulsValue");
const levelValue = document.querySelector("#levelValue");
const rewardValue = document.querySelector("#rewardValue");
const nextValue = document.querySelector("#nextValue");
const progressFill = document.querySelector("#progressFill");
const progressTrack = document.querySelector(".progress-track");
const choiceHeading = document.querySelector("#choiceHeading");
const choicePrompt = document.querySelector("#choicePrompt");
const buildOrder = document.querySelector("#buildOrder");
const orderCount = document.querySelector("#orderCount");
const emptyOrder = document.querySelector("#emptyOrder");
const undoButton = document.querySelector("#undoButton");
const abilities = new Map(abilityCards.map((card) => [card.dataset.ability, {
  card,
  name: card.querySelector("strong").textContent,
  ultimate: card.dataset.ability === "ultimate",
  unlocked: false,
  points: 0,
}]));
let picks = [];
let currentLevel = -1;
let order = [];

function formatSouls(value) {
  return Number(value).toLocaleString("en-US");
}

function tierFor(points) {
  if (points >= 8) return 3;
  if (points >= 3) return 2;
  if (points >= 1) return 1;
  return 0;
}

function nextTier(points) {
  if (points < 1) return { tier: 1, remaining: 1 };
  if (points < 3) return { tier: 2, remaining: 3 - points };
  if (points < 8) return { tier: 3, remaining: 8 - points };
  return null;
}

function targetLevel() {
  return levels[currentLevel + 1] ?? null;
}

function canChoose(ability, target) {
  if (!target) return false;
  if (target.reward === "Ability unlock") {
    if (ability.unlocked) return false;
    return target.level === 7 ? ability.ultimate : !ability.ultimate;
  }
  return ability.unlocked && ability.points < 8;
}

function applyPick(abilityId) {
  const ability = abilities.get(abilityId);
  const target = targetLevel();
  if (!ability || !canChoose(ability, target)) return false;

  let action;
  if (target.reward === "Ability unlock") {
    ability.unlocked = true;
    action = "UNLOCKED";
  } else {
    const previousTier = tierFor(ability.points);
    ability.points += 1;
    const newTier = tierFor(ability.points);
    action = newTier > previousTier ? `+1 AP · TIER ${["", "I", "II", "III"][newTier]}` : "+1 ABILITY POINT";
  }

  currentLevel = target.level;
  order.push({ level: target.level, souls: target.souls, ability: ability.name, action });
  return true;
}

function rebuildProgress() {
  currentLevel = -1;
  order = [];
  abilities.forEach((ability) => {
    ability.unlocked = false;
    ability.points = 0;
  });
  picks.forEach((abilityId) => applyPick(abilityId));
}

function promptFor(target) {
  if (!target) return { heading: "MAXIMUM LEVEL", prompt: "All 35 boon levels are assigned." };
  if (target.reward === "Ability unlock") {
    if (target.level === 7) return { heading: `LEVEL ${target.level} · ULTIMATE UNLOCK`, prompt: "Unlock your Ultimate to advance this level." };
    const heading = target.level === 0 ? "STARTING ABILITY" : `LEVEL ${target.level} · ABILITY UNLOCK`;
    return { heading, prompt: "Choose an unassigned basic ability to unlock." };
  }
  return { heading: `LEVEL ${target.level} · ABILITY POINT`, prompt: "Spend this point on an unlocked ability. Picks advance the boon level." };
}

function renderOrder() {
  orderCount.textContent = `${order.length} ${order.length === 1 ? "PICK" : "PICKS"}`;
  emptyOrder.hidden = order.length > 0;
  buildOrder.replaceChildren(...order.map((entry, index) => {
    const item = document.createElement("li");
    item.className = "order-item";
    item.innerHTML = `<span class="order-index">${String(index + 1).padStart(2, "0")}</span><span class="order-level">LVL ${String(entry.level).padStart(2, "0")}<small>${formatSouls(entry.souls)} SOULS</small></span><strong class="order-ability">${entry.ability}</strong><span class="order-action">${entry.action}</span>`;
    return item;
  }));
}

function render() {
  const target = targetLevel();
  const current = levels[Math.max(0, currentLevel)];
  const prompt = promptFor(target);
  const souls = current.souls;

  soulsValue.textContent = formatSouls(souls);
  levelValue.textContent = currentLevel < 0 ? "READY" : String(currentLevel).padStart(2, "0");
  rewardValue.textContent = target ? `LEVEL ${target.level} · ${target.reward}` : "ALL REWARDS ASSIGNED";
  nextValue.textContent = target ? `${currentLevel < 0 ? "START" : "NEXT"} ${formatSouls(target.souls)}` : "MAX LEVEL";
  progressFill.style.width = `${(Math.max(currentLevel, 0) / 35) * 100}%`;
  progressTrack.setAttribute("aria-valuenow", String(Math.max(currentLevel, 0)));
  choiceHeading.textContent = prompt.heading;
  choicePrompt.textContent = prompt.prompt;
  undoButton.disabled = picks.length === 0;
  document.title = `${currentLevel < 0 ? "Ready" : `Level ${currentLevel}`} · ${formatSouls(souls)} souls | Boon Picker`;

  abilities.forEach((ability) => {
    const button = ability.card;
    const status = button.querySelector(".ability-status");
    const next = button.querySelector(".ability-next");
    const action = button.querySelector(".ability-action");
    const available = canChoose(ability, target);
    const upcomingTier = ability.unlocked ? nextTier(ability.points) : null;

    button.disabled = !available;
    button.classList.toggle("is-available", available);
    if (ability.unlocked) {
      status.textContent = `TIER ${tierFor(ability.points)} · ${ability.points}/8 AP`;
      next.textContent = upcomingTier ? `${upcomingTier.remaining} AP TO TIER ${["", "I", "II", "III"][upcomingTier.tier]}` : "MAX TIER";
      action.textContent = available ? "UPGRADE" : "";
    } else {
      status.textContent = ability.ultimate && target?.level !== 7 ? "LOCKED UNTIL LEVEL 7" : "LOCKED";
      next.textContent = "";
      action.textContent = available ? "UNLOCK" : "";
    }
  });

  milestoneCards.forEach((card) => {
    const level = Number(card.dataset.level);
    card.classList.toggle("is-complete", level < currentLevel);
    card.classList.toggle("is-current", level === currentLevel);
    card.classList.toggle("is-next", level === (target?.level ?? -1));
  });
  renderOrder();
}

abilityCards.forEach((card) => {
  card.addEventListener("click", () => {
    if (!canChoose(abilities.get(card.dataset.ability), targetLevel())) return;
    picks.push(card.dataset.ability);
    rebuildProgress();
    render();
  });
});

undoButton.addEventListener("click", () => {
  picks.pop();
  rebuildProgress();
  render();
});

document.querySelector("#resetButton").addEventListener("click", () => {
  picks = [];
  rebuildProgress();
  render();
});

render();
