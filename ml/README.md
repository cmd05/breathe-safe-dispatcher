# PM2.5 Baseline Model

BreatheSafe uses a small scikit-learn Ridge regression baseline to forecast next-window PM2.5 risk for Delhi/NCR zones.

Install Python dependency if needed:

```bash
pip install -r requirements.txt
```

Run:

```bash
npm run ml:train
```

The Python script:

- trains on compact Delhi/NCR demo rows in `ml/delhi-ncr-pm25-samples.json`
- uses current PM2.5, hour, weather, traffic, demand, construction, and inversion-risk features
- uses `StandardScaler` + `Ridge(alpha=0.1)` from scikit-learn
- compares the model against a simple persistence baseline: "PM2.5 stays the same as now"
- writes `src/mlPredictions.json`, which the frontend imports

Current validation result:

- scikit-learn Ridge baseline RMSE: 2.28
- Persistence RMSE: 12.12
- Improvement vs persistence: 81.2%

This is a hackathon baseline for explainable dispatch ranking, not a public-health forecasting system. A production version would replace the demo rows with live CPCB/monitoring feeds, weather data, and a stronger deployed model.
