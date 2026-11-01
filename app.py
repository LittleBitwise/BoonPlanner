from flask import Flask, jsonify, render_template

SOUL_THRESHOLDS = (
    600, 800, 1100, 1500, 2000, 2600, 3200, 3800, 4500,
    5200, 5900, 6600, 7400, 8200, 9000, 9800, 10700, 11600,
    12500, 13400, 14400, 15500, 16700, 18000, 19500, 21200,
    23100, 25200, 27500, 30000, 32700, 35600, 38700, 42000,
    45500, 49200,
)
ABILITY_UNLOCK_LEVELS = {2, 4, 7}


def build_levels():
    levels = []
    for level, souls in enumerate(SOUL_THRESHOLDS):
        if level == 0:
            reward = "Starting level"
            cost = 0
        else:
            reward = "Ability unlock" if level in ABILITY_UNLOCK_LEVELS else "Ability point"
            cost = souls - SOUL_THRESHOLDS[level - 1]
        levels.append({"level": level, "souls": souls, "cost": cost, "reward": reward})
    return levels


def create_app():
    app = Flask(__name__)
    levels = build_levels()

    @app.get("/")
    def index():
        return render_template("index.html", levels=levels)

    @app.get("/api/levels")
    def get_levels():
        return jsonify(levels)

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
