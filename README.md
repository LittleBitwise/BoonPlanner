# Boon Picker

A local Flask companion for planning Deadlock ability progression. Choose which ability to unlock or upgrade at each reward; every choice advances the boon progression and updates the total soul count. The ordered choices remain visible in the build log.

The initial pick unlocks one of the three basic abilities at level 0. Levels 2 and 4 unlock another basic ability, level 7 unlocks the Ultimate, and the other levels award ability points. Ability tiers require 1, 2, then 5 additional points.

## Run locally

```powershell
py -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m flask --app app run --debug
```

Open <http://127.0.0.1:5000> in your browser.

## Verify

```powershell
python -m unittest
```

Progression thresholds are transcribed from the [Deadlock Wiki Boon page](https://deadlock.wiki/Boon). This is an unofficial fan-made companion and is not affiliated with Valve.
