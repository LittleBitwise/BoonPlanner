# Boon Picker

A local Flask companion for planning Deadlock boon progression. Select any level from 0 to 35 to see its cumulative soul requirement and the previous level's soul cost. The total stays visible while you browse.

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
