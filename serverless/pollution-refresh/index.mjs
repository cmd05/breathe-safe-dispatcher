const areas = [
  { id: "lajpat", name: "Lajpat Nagar", forecastPm25: 201, risk: "Severe" },
  { id: "saket", name: "Saket", forecastPm25: 160, risk: "High" },
  { id: "rohini", name: "Rohini", forecastPm25: 268, risk: "Severe" },
  { id: "dwarka", name: "Dwarka", forecastPm25: 174, risk: "High" },
];

export const handler = async (event) => {
  const severeAreas = areas.filter((area) => area.risk === "Severe");
  const payload = {
    refreshedAt: new Date().toISOString(),
    trigger: event.source ?? "eventbridge.schedule",
    window: "evening delivery peak",
    areaCount: areas.length,
    severeAreaCount: severeAreas.length,
    dispatchHint:
      severeAreas.length > 0
        ? "Prefer cleaner nearby hubs and mask prompts for exposed riders."
        : "Normal dispatch can continue with standard rider prompts.",
    areas,
  };

  console.log(JSON.stringify(payload));
  return payload;
};
