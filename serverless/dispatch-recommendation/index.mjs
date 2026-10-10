const zones = [
  { id: "lajpat", name: "Lajpat Nagar", currentPm25: 194, forecastPm25: 201, confidence: "Medium" },
  { id: "saket", name: "Saket", currentPm25: 162, forecastPm25: 160, confidence: "High" },
  { id: "cp", name: "Connaught Place", currentPm25: 214, forecastPm25: 224, confidence: "High" },
];

const order = {
  id: "ORD-4821",
  area: "Jangpura Extension",
  priority: "Standard",
  promisedMinutes: 18,
};

const options = [
  {
    id: "fastest",
    label: "Fastest",
    store: "Lajpat Rider Hub",
    rider: "Rohit",
    minutes: 13,
    exposure: 84,
    riskyKm: 2.3,
    oneLine: "Shortest time, highest exposure.",
  },
  {
    id: "cleaner",
    label: "Cleaner",
    store: "Saket Cleaner Hub",
    rider: "Imran",
    minutes: 16,
    exposure: 58,
    riskyKm: 0.8,
    oneLine: "Lowest exposure, small delay.",
  },
  {
    id: "balanced",
    label: "Recommended",
    store: "Saket Cleaner Hub",
    rider: "Imran",
    minutes: 15,
    exposure: 62,
    riskyKm: 1.1,
    oneLine: "Best balance for rider and customer.",
  },
];

function exposureSaved(reference, value) {
  return Math.round(((reference - value) / reference) * 100);
}

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,OPTIONS",
      "access-control-allow-headers": "content-type",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  };
}

export const handler = async (event) => {
  if (event.requestContext?.http?.method === "OPTIONS") {
    return response(204, {});
  }

  const fastest = options[0];
  const recommended = options[2];
  const saved = exposureSaved(fastest.exposure, recommended.exposure);
  const delay = recommended.minutes - fastest.minutes;
  const riskyKmAvoided = Number((fastest.riskyKm - recommended.riskyKm).toFixed(1));

  return response(200, {
    scenarioId: event.queryStringParameters?.scenarioId ?? "scenario-lajpat",
    generatedAt: new Date().toISOString(),
    source: "AWS Lambda + API Gateway",
    airWindow: "7:15 PM - 8:00 PM",
    order,
    zones,
    options,
    recommendation: {
      optionId: recommended.id,
      title: "Use Saket Cleaner Hub.",
      reason: `${saved}% less exposure, only +${delay} min, still under SLA.`,
    },
    metrics: {
      exposureCutPct: saved,
      delayMinutes: delay,
      riskyKmAvoided,
      stillUnderSla: recommended.minutes <= order.promisedMinutes,
    },
  });
};
