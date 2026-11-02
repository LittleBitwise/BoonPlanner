(function () {
const SOUL_THRESHOLDS = [
  600, 800, 1100, 1500, 2000, 2600, 3200, 3800, 4500,
  5200, 5900, 6600, 7400, 8200, 9000, 9800, 10700, 11600,
  12500, 13400, 14400, 15500, 16700, 18000, 19500, 21200,
  23100, 25200, 27500, 30000, 32700, 35600, 38700, 42000,
  45500, 49200,
];
const ABILITY_UNLOCK_LEVELS = [0, 2, 4, 7];
const ABILITY_TIER_COSTS = [1, 2, 5];

const levels = SOUL_THRESHOLDS.map((souls, level) => ({
  level,
  souls,
  cost: level === 0 ? 0 : souls - SOUL_THRESHOLDS[level - 1],
  reward: ABILITY_UNLOCK_LEVELS.includes(level) ? "Ability unlock" : "Ability point",
}));

const progression = { levels, abilityTierCosts: ABILITY_TIER_COSTS };

if (typeof module !== "undefined" && module.exports) {
  module.exports = progression;
}
if (typeof window !== "undefined") {
  window.BoonPickerProgression = progression;
}
})();