# Boon Picker project notes

- Keep the app as a small Flask project; avoid adding dependencies without a clear need.
- `SOUL_THRESHOLDS` in `app.py` is the authoritative level 0-35 progression list and should stay in sync with the Deadlock Wiki Boon page.
- Keep the selected cumulative soul total visible and advance the boon level whenever an ability reward is assigned.
- Preserve the ordered ability choices, the level 0/2/4/7 unlock cadence, and the 1/2/5 additional ability-point tier costs.
- Run `python -m unittest` after changes to progression data or picker behavior.
