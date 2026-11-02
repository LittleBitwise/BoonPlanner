const { levels, abilityTierCosts } = window.BoonPickerProgression;
const abilityTracks = [...document.querySelectorAll(".ability-track")];
const soulsValue = document.querySelector("#soulsValue");
const levelValue = document.querySelector("#levelValue");
const unspentValue = document.querySelector("#unspentValue");
const gainLevelButton = document.querySelector("#gainLevelButton");
const buildOrder = document.querySelector("#buildOrder");
const undoButton = document.querySelector("#undoButton");
const maxLevelButton = document.querySelector("#maxLevelButton");
const abilities = new Map(abilityTracks.map((track) => [track.dataset.ability, {
  track,
  name: track.querySelector(".track-name").textContent,
  ultimate: track.dataset.ability === "ultimate",
  unlocked: false,
  tier: 0,
}]));
let actions = [];
let currentLevel = 0;
let unspentAbilityPoints = 0;
let pendingBasicUnlocks = 1;
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
    order.push({ abilityId: action.abilityId, ability: ability.name });
    return true;
  }

  if (action.type === "upgrade" && canUpgrade(ability)) {
    const cost = abilityTierCosts[ability.tier];
    ability.tier += 1;
    unspentAbilityPoints -= cost;
    order.push({ abilityId: action.abilityId, ability: ability.name, cost });
    return true;
  }

  return false;
}

function rebuildProgress() {
  currentLevel = 0;
  unspentAbilityPoints = 0;
  pendingBasicUnlocks = 1;
  pendingUltimateUnlocks = 0;
  order = [];
  abilities.forEach((ability) => {
    ability.unlocked = false;
    ability.tier = 0;
  });
  actions.forEach((action) => applyAction(action));
}

function renderOrder() {
  let levelIndex = -1;
  let basicUnlocks = 0;
  let ultimateUnlocks = 0;
  let abilityPoints = 0;

  function advanceLevel() {
    levelIndex += 1;
    const level = levels[levelIndex];
    if (level.reward === "Ability unlock" && level.level === 7) ultimateUnlocks += 1;
    else if (level.reward === "Ability unlock") basicUnlocks += 1;
    else abilityPoints += 1;
  }

  const pickThresholds = order.map((entry) => {
    if (entry.cost === undefined) {
      const isUltimate = entry.abilityId === "ultimate";
      while (levelIndex < 0 || (isUltimate ? ultimateUnlocks === 0 : basicUnlocks === 0)) advanceLevel();
      if (isUltimate) ultimateUnlocks -= 1;
      else basicUnlocks -= 1;
    } else {
      while (levelIndex < 0 || abilityPoints < entry.cost) advanceLevel();
      abilityPoints -= entry.cost;
    }
    return levels[levelIndex].souls;
  });

  abilities.forEach((ability, abilityId) => {
    const line = ability.track.querySelector(".track-line");
    line.replaceChildren(...order.map((entry, index) => {
      if (entry.abilityId !== abilityId) {
        const slot = document.createElement("span");
        slot.className = "order-slot";
        return slot;
      }
      const point = document.createElement("span");
      point.className = "order-point";
      point.title = `${formatSouls(pickThresholds[index])} souls required`;
      point.innerHTML = `<span>${String(index).padStart(2, "0")}</span>${entry.cost ? `<small>${entry.cost}AP</small>` : ""}`;
      return point;
    }));
    const status = ability.track.querySelector(".ability-status").textContent;
    const action = ability.track.querySelector(".ability-action").textContent;
    const picks = order.flatMap((entry, index) => entry.abilityId === abilityId
      ? [`PICK ${String(index).padStart(2, "0")} ${entry.cost ? `UPGRADE, ${entry.cost} AP` : "UNLOCK"}`]
      : []);
    ability.track.setAttribute("aria-label", `${ability.name}: ${status}${action ? `, ${action}` : ""}${picks.length ? `. ${picks.join("; ")}` : ""}`);
  });
}

function render() {
  const target = targetLevel();
  const current = levels[Math.max(0, currentLevel)];
  const souls = current.souls;
  const canAdvance = canGainLevel(target);

  soulsValue.textContent = formatSouls(souls);
  levelValue.textContent = currentLevel < 0 ? "READY" : String(currentLevel).padStart(2, "0");
  unspentValue.textContent = String(unspentAbilityPoints);
  unspentValue.parentElement.classList.toggle("has-unspent-ap", unspentAbilityPoints > 0);
  gainLevelButton.disabled = !canAdvance;
  maxLevelButton.disabled = !canAdvance;
  gainLevelButton.childNodes[0].textContent = canAdvance ? "GAIN LEVEL " : "MAX LEVEL ";
  gainLevelButton.querySelector("span").textContent = !target ? "ALL BOON LEVELS CLAIMED" : target.reward === "Ability unlock" ? target.level === 7 ? "+1 ULTIMATE UNLOCK" : "+1 BASIC UNLOCK" : "+1 ABILITY POINT";
  undoButton.disabled = actions.length === 0;
  document.title = `${currentLevel < 0 ? "Ready" : `Level ${currentLevel}`} · ${formatSouls(souls)} souls | Boon Picker`;

  abilities.forEach((ability) => {
    const button = ability.track;
    const status = button.querySelector(".ability-status");
    const action = button.querySelector(".ability-action");
    const availableToUnlock = canUnlock(ability);
    const availableToUpgrade = canUpgrade(ability);
    const nextCost = abilityTierCosts[ability.tier];

    button.disabled = !availableToUnlock && !availableToUpgrade;
    button.classList.toggle("is-available", availableToUnlock || availableToUpgrade);
    action.classList.toggle("is-insufficient-ap", ability.unlocked && Boolean(nextCost) && !availableToUpgrade);
    if (ability.unlocked) {
      status.textContent = `TIER ${ability.tier} / 3`;
      action.textContent = nextCost ? (availableToUpgrade ? `UPGRADE · ${nextCost} AP` : `NEED ${nextCost} AP`) : "";
    } else {
      const nextBasicUnlock = levels.find((item) => item.level > currentLevel && item.reward === "Ability unlock" && item.level !== 7);
      status.textContent = availableToUnlock ? "READY TO UNLOCK" : ability.ultimate ? currentLevel < 7 ? "UNLOCK AT LEVEL 7" : "NO ULT TOKEN BANKED" : pendingBasicUnlocks ? "READY TO UNLOCK" : nextBasicUnlock ? currentLevel < 0 && nextBasicUnlock.level === 0 ? "GAIN LEVEL TO EARN" : `TOKEN AT LEVEL ${nextBasicUnlock.level}` : "NO TOKEN BANKED";
      action.textContent = availableToUnlock ? "UNLOCK" : "";
    }
  });

  renderOrder();
}

function commitAction(action) {
  if (!applyAction(action)) return;
  actions.push(action);
  render();
}

abilityTracks.forEach((track) => {
  track.addEventListener("click", () => {
    const ability = abilities.get(track.dataset.ability);
    if (canUnlock(ability)) {
      commitAction({ type: "unlock", abilityId: track.dataset.ability });
    } else if (canUpgrade(ability)) {
      commitAction({ type: "upgrade", abilityId: track.dataset.ability });
    }
  });
});

gainLevelButton.addEventListener("click", () => commitAction({ type: "gain-level" }));

maxLevelButton.addEventListener("click", () => {
  while (applyAction({ type: "gain-level" })) {
    actions.push({ type: "gain-level" });
  }
  render();
});

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
