const assert = require("node:assert/strict");
const test = require("node:test");
const { levels, abilityTierCosts } = require("../static/progression.js");

test("progression covers levels 0 through 35", () => {
  assert.equal(levels.length, 36);
  assert.equal(levels[0].souls, 600);
  assert.equal(levels.at(-1).souls, 49200);
  assert.ok(levels.every((level, index) => index === 0 || level.souls > levels[index - 1].souls));
});

test("unlock levels and ability point costs are preserved", () => {
  assert.deepEqual(
    levels.filter((level) => level.reward === "Ability unlock").map((level) => level.level),
    [0, 2, 4, 7],
  );
  assert.deepEqual(abilityTierCosts, [1, 2, 5]);
  assert.equal(levels[1].cost, 200);
  assert.equal(levels[1].reward, "Ability point");
});