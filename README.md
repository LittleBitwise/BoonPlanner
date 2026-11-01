# Boon Picker

A local Flask companion for planning Deadlock ability progression. Choose which ability to unlock or upgrade at each reward; every choice advances the boon progression and updates the total soul count. The ordered choices remain visible in the build log.

Every level can be gained without upgrading an ability. Levels 0, 2, and 4 bank basic ability unlocks, level 7 banks the Ultimate unlock, and the other levels bank one ability point. Banked unlocks can be assigned later. Ability upgrades spend from the unspent point balance: 1 point for Tier I, then 2 for Tier II, then 5 for Tier III.

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
