# Boon Picker project notes

- Keep the app as a small Flask project; avoid adding dependencies without a clear need.
- `SOUL_THRESHOLDS` in `app.py` is the authoritative level 0-35 progression list and should stay in sync with the Deadlock Wiki Boon page.
- Keep the selected cumulative soul total visible and update it whenever a level is selected.
- Run `python -m unittest` after changes to progression data or picker behavior.
