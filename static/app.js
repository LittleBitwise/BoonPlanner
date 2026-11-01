const levels = JSON.parse(document.querySelector("#boon-levels").textContent);
const abilityTierCosts = JSON.parse(document.querySelector("#ability-tier-costs").textContent);
const abilityCards = [...document.querySelectorAll(".ability-card")];
const milestoneCards = [...document.querySelectorAll(".level-card")];
const soulsValue = document.querySelector("#soulsValue");
const levelValue = document.querySelector("#levelValue");
const rewardValue = document.querySelector("#rewardValue");
const nextValue = document.querySelector("#nextValue");
const unspentValue = document.querySelector("#unspentValue");
const unspentUnlocks = document.querySelector("#unspentUnlocks");
const progressFill = document.querySelector("#progressFill");
const progressTrack = document.querySelector(".progress-track");
const choiceHeading = document.querySelector("#choiceHeading");
const choicePrompt = document.querySelector("#choicePrompt");
const gainLevelButton = document.querySelector("#gainLevelButton");
const buildOrder = document.querySelector("#buildOrder");
const orderCount = document.querySelector("#orderCount");
const emptyOrder = document.querySelector("#emptyOrder");
const undoButton = document.querySelector("#undoButton");
const abilities = new Map(abilityCards.map((card) => [card.dataset.ability, {
  card,
  name: card.querySelector("strong").textContent,
  ultimate: card.dataset.ability === "ultimate",
  unlocked: false,
  tier: 0,
}]));
let actions = [];
let currentLevel = -1;
let unspentAbilityPoints = 0;
let pendingBasicUnlocks = 0;
let pendingUltimateUnlocks = 0;
let order = [];

function formatSouls(value) {
  return Number(value).toLocaleString("en-US");
}

function targetLevel() {
  return levels[currentLevel + 1] ?? null;
}

function canUnlock(ability) {
  if (ability.unlocked) return false;
  return ability.ultimate ? pendingUltimateUnlocks > 0 : pendingBasicUnlocks > 0;
}

function canUpgrade(ability) {
  return ability.unlocked && ability.tier < abilityTierCosts.length && unspentAbilityPoints >= abilityTierCosts[ability.tier];
}

function canGainLevel(target) {
  return Boolean(target);
}

function applyAction(action) {
  const target = targetLevel();
  if (action.type === "gain-level") {
    if (!canGainLevel(target)) return false;
    currentLevel = target.level;
    let reward;
    if (target.reward === "Ability unlock" && target.level === 7) {
      pendingUltimateUnlocks += 1;
      reward = "+1 ULTIMATE UNLOCK";
    } else if (target.reward === "Ability unlock") {
      pendingBasicUnlocks += 1;
      reward = "+1 BASIC UNLOCK";
    } else {
      unspentAbilityPoints += 1;
      reward = "+1 ABILITY POINT";
    }
    return true;
  }

  const ability = abilities.get(action.abilityId);
  if (!ability) return false;

  if (action.type === "unlock" && canUnlock(ability)) {
    if (ability.ultimate) pendingUltimateUnlocks -= 1;
    else pendingBasicUnlocks -= 1;
    ability.unlocked = true;
    const current = levels[Math.max(0, currentLevel)];
    order.push({ level: Math.max(0, currentLevel), souls: current.souls, ability: ability.name, action: "UNLOCKED · BANKED TOKEN" });
    return true;
  }

  if (action.type === "upgrade" && canUpgrade(ability)) {
    const cost = abilityTierCosts[ability.tier];
    ability.tier += 1;
    unspentAbilityPoints -= cost;
    const current = levels[Math.max(0, currentLevel)];
    order.push({ level: Math.max(0, currentLevel), souls: current.souls, ability: ability.name, action: `TIER ${["", "I", "II", "III"][ability.tier]} · -${cost} AP` });
    return true;
  }

  return false;
}

function rebuildProgress() {
  currentLevel = -1;
  unspentAbilityPoints = 0;
  pendingBasicUnlocks = 0;
  pendingUltimateUnlocks = 0;
  order = [];
  abilities.forEach((ability) => {
    ability.unlocked = false;
    ability.tier = 0;
  });
  actions.forEach((action) => applyAction(action));
}

function promptFor(target) {
  if (!target) return { heading: "MAXIMUM LEVEL", prompt: "All 35 boon levels are assigned." };
  if (target.reward === "Ability unlock") {
    if (target.level === 7) return { heading: `LEVEL ${target.level} · ULTIMATE UNLOCK`, prompt: "Gain this level to bank an Ultimate unlock, then assign it whenever you're ready." };
    const heading = target.level === 0 ? "STARTING ABILITY" : `LEVEL ${target.level} · ABILITY UNLOCK`;
    return { heading, prompt: "Gain this level to bank a basic ability unlock. You can assign it later." };
  }
  return { heading: `LEVEL ${target.level} · ABILITY POINT`, prompt: "Gain this level to bank 1 ability point. Upgrades are optional and spend points separately." };
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
  const canAdvance = canGainLevel(target);

  soulsValue.textContent = formatSouls(souls);
  levelValue.textContent = currentLevel < 0 ? "READY" : String(currentLevel).padStart(2, "0");
  rewardValue.textContent = target ? `LEVEL ${target.level} · ${target.reward}` : "ALL REWARDS ASSIGNED";
  nextValue.textContent = target ? `${currentLevel < 0 ? "START" : "NEXT"} ${formatSouls(target.souls)}` : "MAX LEVEL";
  unspentValue.textContent = String(unspentAbilityPoints);
  unspentUnlocks.textContent = `${pendingBasicUnlocks} BASIC · ${pendingUltimateUnlocks} ULT`;
  progressFill.style.width = `${(Math.max(currentLevel, 0) / 35) * 100}%`;
  progressTrack.setAttribute("aria-valuenow", String(Math.max(currentLevel, 0)));
  choiceHeading.textContent = prompt.heading;
  choicePrompt.textContent = prompt.prompt;
  gainLevelButton.disabled = !canAdvance;
  gainLevelButton.childNodes[0].textContent = canAdvance ? "GAIN LEVEL " : "MAX LEVEL ";
  gainLevelButton.querySelector("span").textContent = !target ? "ALL BOON LEVELS CLAIMED" : target.reward === "Ability unlock" ? target.level === 7 ? "BANK +1 ULTIMATE UNLOCK" : "BANK +1 BASIC UNLOCK" : "BANK +1 ABILITY POINT";
  undoButton.disabled = actions.length === 0;
  document.title = `${currentLevel < 0 ? "Ready" : `Level ${currentLevel}`} · ${formatSouls(souls)} souls | Boon Picker`;

  abilities.forEach((ability) => {
    const button = ability.card;
    const status = button.querySelector(".ability-status");
    const next = button.querySelector(".ability-next");
    const action = button.querySelector(".ability-action");
    const availableToUnlock = canUnlock(ability);
    const availableToUpgrade = canUpgrade(ability);
    const nextCost = abilityTierCosts[ability.tier];

    button.disabled = !availableToUnlock && !availableToUpgrade;
    button.classList.toggle("is-available", availableToUnlock || availableToUpgrade);
    if (ability.unlocked) {
      status.textContent = `TIER ${ability.tier} / 3`;
      next.textContent = nextCost ? `COST ${nextCost} AP · ${unspentAbilityPoints} BANKED` : "MAX TIER";
      action.textContent = nextCost ? (availableToUpgrade ? `UPGRADE · ${nextCost} AP` : `NEED ${nextCost} AP`) : "";
    } else {
      const nextBasicUnlock = levels.find((item) => item.level > currentLevel && item.reward === "Ability unlock" && item.level !== 7);
      status.textContent = availableToUnlock ? "READY TO UNLOCK" : ability.ultimate ? currentLevel < 7 ? "UNLOCK AT LEVEL 7" : "NO ULT TOKEN BANKED" : pendingBasicUnlocks ? "READY TO UNLOCK" : nextBasicUnlock ? currentLevel < 0 && nextBasicUnlock.level === 0 ? "GAIN LEVEL TO EARN" : `TOKEN AT LEVEL ${nextBasicUnlock.level}` : "NO TOKEN BANKED";
      next.textContent = "";
      action.textContent = availableToUnlock ? "UNLOCK" : "";
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

function commitAction(action) {
  if (!applyAction(action)) return;
  actions.push(action);
  render();
}

abilityCards.forEach((card) => {
  card.addEventListener("click", () => {
    const ability = abilities.get(card.dataset.ability);
    if (canUnlock(ability)) {
      commitAction({ type: "unlock", abilityId: card.dataset.ability });
    } else if (canUpgrade(ability)) {
      commitAction({ type: "upgrade", abilityId: card.dataset.ability });
    }
  });
});

gainLevelButton.addEventListener("click", () => commitAction({ type: "gain-level" }));

undoButton.addEventListener("click", () => {
  actions.pop();
  rebuildProgress();
  render();
});

document.querySelector("#resetButton").addEventListener("click", () => {
  actions = [];
  rebuildProgress();
  render();
});

render();
