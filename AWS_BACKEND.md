# Slice 9: AWS Serverless Backend

This slice adds visible AWS usage beyond Amplify Hosting without making the hackathon app too complex.

## What It Adds

- **AWS Lambda:** returns the delivery recommendation for the live demo order.
- **API Gateway HTTP API:** exposes `GET /recommendation` for the frontend.
- **EventBridge scheduled rule:** invokes a small PM2.5 refresh Lambda every hour.
- **CloudWatch Logs:** records the refresh result and recommendation requests.

The frontend still works without this backend. If `VITE_RECOMMENDATION_API_URL` is set, the app calls the AWS API and shows the Lambda source.

## Why This Fits The Project

The API represents the dispatch decision service that a delivery platform could call before assigning a rider. EventBridge represents the scheduled PM2.5 refresh that keeps the risk window current.

This is intentionally small: it proves AWS integration, supports the demo story, and avoids fragile production claims.

## Deploy

Deployed stack:

```text
Stack: breathesafe-dispatcher-api
Region: ap-southeast-2
API: https://f1tivjhtne.execute-api.ap-southeast-2.amazonaws.com/recommendation
Dispatch Lambda: breathesafe-dispatch-recommendation
Refresh Lambda: breathesafe-pollution-refresh
EventBridge rule: breathesafe-hourly-pollution-refresh
```

For a fresh deployment, use the selected Region:

```bash
sam build --template-file infra/template.yaml
sam deploy --guided --region ap-southeast-2 --stack-name breathesafe-dispatcher-api
```

After deployment, copy the `RecommendationApiUrl` output into Amplify as an environment variable. This has already been set on the `main` branch:

```text
VITE_RECOMMENDATION_API_URL=https://.../recommendation
```

Then redeploy the Amplify app from GitHub.

## Demo Line

"The frontend is hosted on AWS Amplify. The dispatch recommendation is served by Lambda through API Gateway, and EventBridge refreshes the PM2.5 risk window on a schedule."
