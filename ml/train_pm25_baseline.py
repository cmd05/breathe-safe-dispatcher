from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from sklearn.linear_model import Ridge
from sklearn.metrics import root_mean_squared_error
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
SAMPLE_PATH = HERE / "delhi-ncr-pm25-samples.json"
OUTPUT_PATH = ROOT / "src" / "mlPredictions.json"

FEATURE_NAMES = [
    "currentPm25",
    "hour",
    "temperature",
    "humidity",
    "windKph",
    "trafficIndex",
    "demandIndex",
    "constructionIndex",
    "inversionRisk",
]

APP_ZONE_FEATURES = [
    {"zoneId": "cp", "zoneName": "Connaught Place", "hour": 19, "currentPm25": 214, "temperature": 20, "humidity": 58, "windKph": 5.6, "trafficIndex": 88, "demandIndex": 81, "constructionIndex": 46, "inversionRisk": 0.78},
    {"zoneId": "karol", "zoneName": "Karol Bagh", "hour": 19, "currentPm25": 238, "temperature": 19, "humidity": 61, "windKph": 4.9, "trafficIndex": 91, "demandIndex": 86, "constructionIndex": 61, "inversionRisk": 0.84},
    {"zoneId": "lajpat", "zoneName": "Lajpat Nagar", "hour": 19, "currentPm25": 194, "temperature": 20, "humidity": 56, "windKph": 6.2, "trafficIndex": 82, "demandIndex": 78, "constructionIndex": 40, "inversionRisk": 0.73},
    {"zoneId": "saket", "zoneName": "Saket", "hour": 19, "currentPm25": 162, "temperature": 20, "humidity": 54, "windKph": 7.8, "trafficIndex": 62, "demandIndex": 64, "constructionIndex": 27, "inversionRisk": 0.61},
    {"zoneId": "rohini", "zoneName": "Rohini", "hour": 19, "currentPm25": 256, "temperature": 18, "humidity": 64, "windKph": 4.2, "trafficIndex": 85, "demandIndex": 76, "constructionIndex": 68, "inversionRisk": 0.9},
    {"zoneId": "dwarka", "zoneName": "Dwarka", "hour": 19, "currentPm25": 181, "temperature": 20, "humidity": 52, "windKph": 9.8, "trafficIndex": 65, "demandIndex": 62, "constructionIndex": 34, "inversionRisk": 0.57},
    {"zoneId": "noida18", "zoneName": "Noida Sector 18", "hour": 19, "currentPm25": 176, "temperature": 20, "humidity": 55, "windKph": 7.3, "trafficIndex": 73, "demandIndex": 70, "constructionIndex": 39, "inversionRisk": 0.68},
    {"zoneId": "gurugram", "zoneName": "Gurugram Cyber Hub", "hour": 19, "currentPm25": 149, "temperature": 21, "humidity": 50, "windKph": 9.9, "trafficIndex": 69, "demandIndex": 66, "constructionIndex": 31, "inversionRisk": 0.56},
    {"zoneId": "ghaziabad", "zoneName": "Ghaziabad", "hour": 19, "currentPm25": 271, "temperature": 19, "humidity": 65, "windKph": 3.8, "trafficIndex": 83, "demandIndex": 77, "constructionIndex": 74, "inversionRisk": 0.93},
    {"zoneId": "faridabad", "zoneName": "Faridabad", "hour": 19, "currentPm25": 167, "temperature": 21, "humidity": 51, "windKph": 8.1, "trafficIndex": 60, "demandIndex": 57, "constructionIndex": 35, "inversionRisk": 0.59},
]

RIDGE_ALPHA = 0.1


def risk_level(pm25: float) -> str:
    if pm25 <= 60:
        return "Low"
    if pm25 <= 120:
        return "Moderate"
    if pm25 <= 200:
        return "High"
    return "Severe"


def feature_matrix(rows: list[dict[str, float]]) -> list[list[float]]:
    return [[row[name] for name in FEATURE_NAMES] for row in rows]


def main() -> None:
    samples = json.loads(SAMPLE_PATH.read_text(encoding="utf-8"))
    train_rows = [row for index, row in enumerate(samples) if index % 5 != 4]
    validation_rows = [row for index, row in enumerate(samples) if index % 5 == 4]

    x_train = feature_matrix(train_rows)
    y_train = [row["targetPm25"] for row in train_rows]
    x_validation = feature_matrix(validation_rows)
    y_validation = [row["targetPm25"] for row in validation_rows]

    model = make_pipeline(StandardScaler(), Ridge(alpha=RIDGE_ALPHA))
    model.fit(x_train, y_train)

    training_predictions = model.predict(x_train)
    validation_predictions = model.predict(x_validation)
    persistence_predictions = [row["currentPm25"] for row in validation_rows]

    training_rmse = root_mean_squared_error(y_train, training_predictions)
    validation_rmse = root_mean_squared_error(y_validation, validation_predictions)
    persistence_rmse = root_mean_squared_error(y_validation, persistence_predictions)

    app_predictions = []
    for row in APP_ZONE_FEATURES:
        predicted_pm25 = round(float(model.predict(feature_matrix([row]))[0]))
        app_predictions.append(
            {
                "zoneId": row["zoneId"],
                "zoneName": row["zoneName"],
                "predictedPm25": predicted_pm25,
                "persistencePm25": row["currentPm25"],
                "risk": risk_level(predicted_pm25),
                "features": {name: row[name] for name in FEATURE_NAMES},
            }
        )

    ridge = model.named_steps["ridge"]
    scaler = model.named_steps["standardscaler"]
    coefficients = {
        name: round(float(ridge.coef_[index]), 4)
        for index, name in enumerate(FEATURE_NAMES)
    }
    scaler_payload = {
        name: {"mean": float(scaler.mean_[index]), "std": float(scaler.scale_[index])}
        for index, name in enumerate(FEATURE_NAMES)
    }

    output = {
        "model": {
            "name": "BreatheSafe Delhi/NCR PM2.5 Baseline",
            "kind": "sklearn_ridge_regression",
            "runtime": "python",
            "library": "scikit-learn",
            "alpha": RIDGE_ALPHA,
            "target": "next_window_pm25",
            "generatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "trainingRows": len(train_rows),
            "validationRows": len(validation_rows),
            "note": "Hackathon baseline trained on compact Delhi/NCR demo data. It is designed for explainable dispatch ranking, not public-health forecasting.",
        },
        "evaluation": {
            "trainingRmse": round(float(training_rmse), 2),
            "validationRmse": round(float(validation_rmse), 2),
            "persistenceRmse": round(float(persistence_rmse), 2),
            "improvementVsPersistencePct": round(float(((persistence_rmse - validation_rmse) / persistence_rmse) * 100), 1),
        },
        "featureNames": FEATURE_NAMES,
        "coefficients": coefficients,
        "intercept": round(float(ridge.intercept_), 4),
        "scaler": scaler_payload,
        "predictions": app_predictions,
    }

    OUTPUT_PATH.write_text(f"{json.dumps(output, indent=2)}\n", encoding="utf-8")
    print(f"Wrote {OUTPUT_PATH}")
    print(f"Validation RMSE: {output['evaluation']['validationRmse']}")
    print(f"Persistence RMSE: {output['evaluation']['persistenceRmse']}")
    print(f"Improvement: {output['evaluation']['improvementVsPersistencePct']}%")


if __name__ == "__main__":
    main()
