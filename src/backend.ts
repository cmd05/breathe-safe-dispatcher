export type BackendRecommendation = {
  source: string;
  generatedAt: string;
  recommendation: {
    title: string;
    reason: string;
  };
  metrics: {
    exposureCutPct: number;
    delayMinutes: number;
    riskyKmAvoided: number;
    stillUnderSla: boolean;
  };
};

const apiUrl = import.meta.env.VITE_RECOMMENDATION_API_URL as string | undefined;

export async function fetchBackendRecommendation() {
  if (!apiUrl) return null;

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 3500);

  try {
    const url = new URL(apiUrl);
    url.searchParams.set("scenarioId", "scenario-lajpat");
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return null;
    return (await response.json()) as BackendRecommendation;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeout);
  }
}
