import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Bike,
  CheckCircle2,
  Clock3,
  Cloud,
  Gauge,
  IdCard,
  MapPinned,
  Moon,
  Navigation,
  PackageCheck,
  Phone,
  ShieldCheck,
  Smartphone,
  Store,
  Sun,
  Wind,
} from "lucide-react";
import {
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { MapContainer, Marker, Polyline, Popup, TileLayer, CircleMarker } from "react-leaflet";
import L from "leaflet";
import {
  exposureSaved,
  orderById,
  restZones,
  riderById,
  riskLevel,
  scenarios,
  storeById,
  stores,
  type RouteOption,
  zones,
  zoneById,
} from "./data";
import mlPredictions from "./mlPredictions.json";

type Page = "dispatch" | "rider" | "consumer" | "prompts" | "metrics";
type DashboardMetrics = {
  saved: number;
  delay: number;
  riskyKmAvoided: number;
  sla: number;
  prompts: number;
  shiftExposureDrop: number;
};

const scenario = scenarios[0];
const order = orderById(scenario.orderId)!;
const fastest = scenario.options.find((option) => option.id === "fastest")!;
const recommended = scenario.options.find((option) => option.id === "balanced")!;

const routeColors: Record<string, string> = {
  fastest: "#ef4444",
  cleaner: "#0f9f6e",
  balanced: "#2563eb",
};

const icon = L.divIcon({
  className: "map-pin",
  html: "<span></span>",
  iconSize: [18, 18],
});

function App() {
  const [page, setPage] = useState<Page>("dispatch");
  const [selectedOptionId, setSelectedOptionId] = useState(recommended.id);
  const [darkMode, setDarkMode] = useState(true);
  const selectedOption = scenario.options.find((option) => option.id === selectedOptionId) ?? recommended;

  const metrics = useMemo(() => {
    const saved = exposureSaved(fastest.exposure, recommended.exposure);
    return {
      saved,
      delay: recommended.minutes - fastest.minutes,
      riskyKmAvoided: Number((fastest.riskyKm - recommended.riskyKm).toFixed(1)),
      sla: recommended.minutes <= order.promisedMinutes ? 96 : 78,
      prompts: 4,
      shiftExposureDrop: 19,
    };
  }, []);

  return (
    <div className={`app-shell ${darkMode ? "theme-dark" : "theme-light"}`}>
      <aside className="sidebar">
        <div>
          <div className="brand-mark">BS</div>
          <h1>BreatheSafe Dispatcher</h1>
          <p>Reducing delivery rider PM2.5 exposure without slowing the city down.</p>
        </div>

        <nav aria-label="Primary">
          <NavButton icon={<Store />} label="Dispatch" active={page === "dispatch"} onClick={() => setPage("dispatch")} />
          <NavButton icon={<Navigation />} label="Rider Route" active={page === "rider"} onClick={() => setPage("rider")} />
          <NavButton icon={<Smartphone />} label="Consumer App" active={page === "consumer"} onClick={() => setPage("consumer")} />
          <NavButton icon={<ShieldCheck />} label="Safety Prompts" active={page === "prompts"} onClick={() => setPage("prompts")} />
          <NavButton icon={<BarChart3 />} label="Metrics" active={page === "metrics"} onClick={() => setPage("metrics")} />
        </nav>

        <div className="sidebar-card">
          <span>Demo mode</span>
          <strong>PM2.5 baseline + dispatch rules</strong>
          <small>Mock delivery data. Real-world deployment would connect live data.</small>
        </div>
      </aside>

      <main>
        <Header darkMode={darkMode} onToggleTheme={() => setDarkMode((value) => !value)} />
        {page === "dispatch" && (
          <DispatchDashboard
            selectedOptionId={selectedOptionId}
            onSelectOption={setSelectedOptionId}
            metrics={metrics}
          />
        )}
        {page === "rider" && <RiderRoute option={selectedOption} onSelectOption={setSelectedOptionId} />}
        {page === "consumer" && <ConsumerView metrics={metrics} />}
        {page === "prompts" && <SafetyPrompts />}
        {page === "metrics" && <Metrics metrics={metrics} />}
      </main>
    </div>
  );
}

function Header({ darkMode, onToggleTheme }: { darkMode: boolean; onToggleTheme: () => void }) {
  return (
    <header className="page-header">
      <div>
        <span className="eyebrow">Delhi/NCR air-risk window</span>
        <h2>Safer delivery assignment for one live order</h2>
      </div>
      <div className="header-badges">
        <Badge tone="danger" icon={<Cloud />}>
          PM2.5 severe
        </Badge>
        <Badge tone="blue" icon={<Clock3 />}>
          {scenario.severeWindow}
        </Badge>
        <Badge tone="green" icon={<CheckCircle2 />}>
          Under SLA
        </Badge>
        <button
          className="theme-toggle"
          onClick={onToggleTheme}
          aria-label={darkMode ? "Toggle light mode" : "Toggle dark mode"}
        >
          {darkMode ? <Sun /> : <Moon />}
          <span>{darkMode ? "Light" : "Dark"}</span>
        </button>
      </div>
    </header>
  );
}

function DispatchDashboard({
  selectedOptionId,
  onSelectOption,
  metrics,
}: {
  selectedOptionId: string;
  onSelectOption: (id: string) => void;
  metrics: DashboardMetrics;
}) {
  return (
    <section className="content-grid dispatch-grid">
      <div className="panel main-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Incoming order</span>
            <h3>{order.id} · {order.customerArea}</h3>
            <span className="order-meta">
              {maskName(order.customerName)} · {maskPhone(order.customerPhone)} · {order.basket}
            </span>
          </div>
          <span className="priority">{titleCase(order.priority)}</span>
        </div>

        <div className="order-summary compact-summary">
          <MetricTile label="Promise" value={`${order.promisedMinutes} min`} icon={<Clock3 />} />
          <MetricTile label="Exposure Cut" value={`${metrics.saved}%`} icon={<Wind />} />
          <MetricTile label="Delay" value={`+${metrics.delay} min`} icon={<Clock3 />} />
        </div>

        <div className="option-list">
          {scenario.options.map((option) => (
            <DispatchOption
              key={option.id}
              option={option}
              active={option.id === selectedOptionId}
              onClick={() => onSelectOption(option.id)}
            />
          ))}
        </div>

        <div className="recommendation compact-recommendation">
          <div className="recommendation-icon">
            <ShieldCheck />
          </div>
          <div>
            <span className="eyebrow">Recommendation</span>
            <h3>Use Saket Cleaner Hub.</h3>
            <p>{metrics.saved}% less exposure, only +{metrics.delay} min, still under SLA.</p>
          </div>
        </div>
      </div>

      <MapPanel activeOptionId={selectedOptionId} />

      <div className="panel glossary span-2">
        <span className="eyebrow">Plain terms</span>
        <div>
          <GlossaryItem title="Score" text="Lower is safer for rider PM2.5 exposure." />
          <GlossaryItem title="SLA" text="Delivery promise shown to the customer." />
          <GlossaryItem title="Exposure Cut" text="Pollution exposure reduced vs fastest dispatch." />
          <GlossaryItem title="Risky km" text="Route distance through high-pollution zones." />
        </div>
      </div>
    </section>
  );
}

function RiderRoute({ option, onSelectOption }: { option: RouteOption; onSelectOption: (id: string) => void }) {
  const rider = riderById(option.riderId)!;
  const store = storeById(option.storeId)!;
  const storeZone = zoneById(store.zoneId)!;
  const nearestRest = restZones.find((rest) => rest.zoneId === store.zoneId) ?? restZones[0];

  return (
    <section className="content-grid">
      <div className="panel rider-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Rider plugin prototype</span>
            <h3>{rider.name}'s recommended run</h3>
          </div>
          <Badge tone={riskLevel(storeZone.forecastPm25) === "Severe" ? "danger" : "blue"} icon={<Gauge />}>
            {riskLevel(storeZone.forecastPm25)} risk
          </Badge>
        </div>

        <div className="route-tabs">
          {scenario.options.map((routeOption) => (
            <button
              key={routeOption.id}
              className={routeOption.id === option.id ? "active" : ""}
              onClick={() => onSelectOption(routeOption.id)}
            >
              {routeOption.label}
            </button>
          ))}
        </div>

        <div className="rider-card">
          <RiderAvatar rider={rider} />
          <div>
            <strong>{rider.name}</strong>
            <span>{rider.shift} · {rider.highExposureRuns} high-risk runs today</span>
          </div>
        </div>

        <div className="rider-detail-grid">
          <DetailChip icon={<Bike />} label="Bike" value={rider.bikeNumber} />
          <DetailChip icon={<Phone />} label="Contact" value={rider.phone} />
          <DetailChip icon={<IdCard />} label="Status" value={rider.maskConfirmed ? "Mask confirmed" : "Mask pending"} />
        </div>

        <div className="order-summary">
          <MetricTile label="ETA" value={`${option.minutes} min`} icon={<Clock3 />} />
          <MetricTile label="Exposure" value={String(option.exposure)} icon={<Cloud />} />
          <MetricTile label="Risky km" value={`${option.riskyKm} km`} icon={<AlertTriangle />} />
        </div>

        <div className="prompt-callout">
          <ShieldCheck />
          <div>
            <strong>Use N95 mask before dispatch</strong>
            <span>
              Nearest rest zone: {nearestRest.name}, {nearestRest.availableSeats} seats open, {nearestRest.masks} masks available.
            </span>
          </div>
        </div>
      </div>

      <MapPanel activeOptionId={option.id} />
    </section>
  );
}

function SafetyPrompts() {
  const [selectedPrompt, setSelectedPrompt] = useState("mask");
  const prompts = [
    {
      id: "mask",
      title: "Mask Before Ride",
      trigger: "Severe PM2.5 + mask not confirmed",
      action: "Ask Aman to collect an N95 before starting this route.",
      impact: "Prevents an unprotected severe-air run.",
      tone: "danger",
    },
    {
      id: "route",
      title: "Use Cleaner Route",
      trigger: "Exposure drops 20%+ with small delay",
      action: "Switch to the balanced route through the Saket corridor.",
      impact: "Cuts exposure while keeping the delivery on time.",
      tone: "green",
    },
    {
      id: "rest",
      title: "Nearest Rest Zone",
      trigger: "Rider has 3 high-risk runs",
      action: "Send rider to CP Recovery Room after this drop.",
      impact: "5 seats open, masks and filtered air available.",
      tone: "blue",
    },
    {
      id: "delay",
      title: "Delay Low-Priority Order",
      trigger: "PM2.5 peak may fall soon",
      action: "Hold low-priority dispatch for 15 minutes.",
      impact: "Reduces exposure without affecting urgent deliveries.",
      tone: "amber",
    },
  ];
  const active = prompts.find((prompt) => prompt.id === selectedPrompt) ?? prompts[0];

  return (
    <section className="prompt-layout">
      <div className="panel prompt-control">
        <span className="eyebrow">Choose rider nudge</span>
        <h3>Safety prompts that do not slow every order</h3>
        <div className="prompt-actions">
          {prompts.map((prompt) => (
            <button
              key={prompt.id}
              className={`prompt-action ${prompt.id === selectedPrompt ? "active" : ""} ${prompt.tone}`}
              onClick={() => setSelectedPrompt(prompt.id)}
            >
              <strong>{prompt.title}</strong>
              <span>{prompt.trigger}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={`panel prompt-preview ${active.tone}`}>
        <span className="eyebrow">Prompt preview</span>
        <h3>{active.title}</h3>
        <p>{active.action}</p>
        <div className="prompt-phone">
          <strong>BreatheSafe</strong>
          <span>{active.action}</span>
          <button>Send To Rider</button>
        </div>
        <div className="prompt-impact">
          <CheckCircle2 />
          <span>{active.impact}</span>
        </div>
      </div>
    </section>
  );
}

function ConsumerView({ metrics }: { metrics: DashboardMetrics }) {
  return (
    <section className="consumer-layout compact-page">
      <div className="panel consumer-phone-shell">
        <div className="phone-section-title">
          <span className="eyebrow">Customer app view</span>
          <h3>What the customer sees</h3>
          <p>Rider-safety message appears without making the order feel delayed.</p>
        </div>
        <div className="consumer-phone">
          <div className="phone-top">
            <span>{order.id}</span>
            <strong>{recommended.minutes} min</strong>
          </div>
          <div className="consumer-customer">
            <span>Delivering to</span>
            <strong>{maskName(order.customerName)}</strong>
            <small>{maskPhone(order.customerPhone)} · {order.customerArea}</small>
          </div>
          <div className="delivery-card">
            <PackageCheck />
            <div>
              <strong>Your order is on the way</strong>
              <span>{order.basket}</span>
            </div>
          </div>
          <div className="delivery-card rider-mini">
            <RiderAvatar rider={riderById(recommended.riderId)!} compact />
            <div>
              <strong>{riderById(recommended.riderId)!.name} is delivering</strong>
              <span>{riderById(recommended.riderId)!.bikeNumber}</span>
            </div>
          </div>
          <div className="consumer-status">
            <CheckCircle2 />
            <div>
              <strong>No delivery delay</strong>
              <span>Still within the {order.promisedMinutes}-minute promise.</span>
            </div>
          </div>
          <div className="consumer-status green">
            <Wind />
            <div>
              <strong>Safer route selected</strong>
              <span>{metrics.saved}% lower rider exposure for this dispatch.</span>
            </div>
          </div>
          <div className="consumer-footer">
            <span>What changed?</span>
            <p>We assigned a cleaner nearby hub and route during a severe PM2.5 window.</p>
          </div>
        </div>
      </div>

      <div className="panel consumer-explain">
        <span className="eyebrow">Consumer transparency</span>
        <h3>Show the customer that rider safety was protected</h3>
        <div className="consumer-points">
          <MetricTile label="Delay" value="0 min" icon={<Clock3 />} />
          <MetricTile label="Rider Exposure Cut" value={`${metrics.saved}%`} icon={<Wind />} />
          <MetricTile label="Promise" value="On Time" icon={<CheckCircle2 />} />
        </div>
        <div className="consumer-copy">
          <strong>Suggested app message</strong>
          <p>
            Your delivery was assigned through a cleaner nearby route to reduce rider PM2.5 exposure.
            Your delivery time is unchanged.
          </p>
        </div>
      </div>
    </section>
  );
}

function Metrics({ metrics }: { metrics: DashboardMetrics }) {
  const modelEvaluation = mlPredictions.evaluation;
  const routeData = scenario.options.map((option) => ({
    name: option.label,
    exposureScore: option.exposure,
    deliveryMinutes: option.minutes,
    pollutedKm: option.riskyKm,
  }));

  const forecastData = zones.slice(0, 7).map((zone) => ({
    name: zone.name.split(" ")[0],
    predictedPm25: zone.forecastPm25,
    sameAsNowPm25: zone.persistencePm25,
  }));

  return (
    <section className="content-grid metrics-layout compact-page">
      <div className="panel span-2">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Easy impact summary</span>
            <h3>What improved for this one delivery?</h3>
          </div>
        </div>
        <div className="metric-grid">
          <MetricTile label="Cleaner for Rider" value={`${metrics.saved}%`} icon={<Wind />} />
          <MetricTile label="Customer Wait" value={`+${metrics.delay} min`} icon={<Clock3 />} />
          <MetricTile label="Polluted Road Avoided" value={`${metrics.riskyKmAvoided} km`} icon={<MapPinned />} />
          <MetricTile label="Still On Time" value={`${metrics.sla}%`} icon={<CheckCircle2 />} />
          <MetricTile label="Helpful Nudges" value={String(metrics.prompts)} icon={<ShieldCheck />} />
          <MetricTile label="Shift Load Cut" value={`${metrics.shiftExposureDrop}%`} icon={<Bike />} />
        </div>
        <div className="metric-note">
          <span>In plain words:</span> the dispatcher picks a cleaner route and hub, keeps the customer promise, and reduces the rider's PM2.5 exposure.
        </div>
        <div className="metric-note">
          <span>Model check:</span> PM2.5 baseline validation error is {modelEvaluation.validationRmse} RMSE, versus {modelEvaluation.persistenceRmse} for the simple same-as-now baseline.
        </div>
      </div>

      <div className="panel">
        <h3>Route choice: lower exposure wins</h3>
        <p className="chart-caption">
          Each bar is a rider pollution exposure score. Lower is better. Hover shows delivery time and polluted kilometers.
        </p>
        <div className="chart-key">
          <span><i className="key-blue" /> Rider exposure score</span>
          <span>Selected route: Recommended</span>
        </div>
        <div className="chart">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={routeData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis label={{ value: "Exposure score", angle: -90, position: "insideLeft" }} />
              <Tooltip
                wrapperClassName="chart-tooltip"
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--line-strong)",
                  borderRadius: 8,
                  color: "var(--text)",
                  boxShadow: "var(--shadow)",
                }}
                labelStyle={{ color: "var(--text)", marginBottom: 8 }}
                itemStyle={{ color: "var(--green-strong)" }}
                formatter={(value, name, item) => {
                  if (name === "exposureScore") return [`${value} exposure score`, "Rider exposure"];
                  return [value, name];
                }}
                labelFormatter={(label) => {
                  const row = routeData.find((item) => item.name === label);
                  return row
                    ? `${label}: ${row.deliveryMinutes} min, ${row.pollutedKm} polluted km`
                    : String(label);
                }}
              />
              <Bar dataKey="exposureScore" name="Rider exposure score" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-takeaway">
          Recommended cuts exposure from {fastest.exposure} to {recommended.exposure} while staying under {order.promisedMinutes} minutes.
        </div>
      </div>

      <div className="panel">
        <h3>PM2.5 comparison by area</h3>
        <p className="chart-caption">
          Each area is compared for the same evening window. Green is the model forecast; gray is the simple same-as-now baseline.
        </p>
        <p className="chart-caption">
          Same-as-now means assuming PM2.5 stays equal to the current reading, with no forecast model.
        </p>
        <div className="chart-key">
          <span><i className="key-green" /> Model forecast</span>
          <span><i className="key-gray" /> Same-as-now baseline</span>
          <span><i className="key-red" /> Severe threshold</span>
        </div>
        <div className="chart">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" label={{ value: "Delhi/NCR area", position: "insideBottom", offset: -4 }} />
              <YAxis label={{ value: "PM2.5", angle: -90, position: "insideLeft" }} />
              <Tooltip
                wrapperClassName="chart-tooltip"
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--line-strong)",
                  borderRadius: 8,
                  color: "var(--text)",
                  boxShadow: "var(--shadow)",
                }}
                labelStyle={{ color: "var(--text)", marginBottom: 8 }}
                itemStyle={{ color: "var(--green-strong)" }}
                formatter={(value, name) => [`${value} PM2.5`, name === "predictedPm25" ? "Model forecast" : "Same as now"]}
              />
              <ReferenceLine y={200} stroke="#dc2626" strokeDasharray="4 4" label="Severe" />
              <Bar dataKey="predictedPm25" name="Model forecast" fill="#0f9f6e" radius={[5, 5, 0, 0]} />
              <Bar dataKey="sameAsNowPm25" name="Same-as-now baseline" fill="#94a3b8" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-takeaway">
          Saket stays below the severe line, so the dispatcher can prefer it without delaying this order.
        </div>
      </div>
    </section>
  );
}

function MapPanel({ activeOptionId }: { activeOptionId: string }) {
  const activeOption = scenario.options.find((option) => option.id === activeOptionId) ?? recommended;

  return (
    <div className="panel map-panel">
      <MapContainer center={[28.59, 77.22]} zoom={11} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {zones.map((zone) => (
          <CircleMarker
            key={zone.id}
            center={[zone.lat, zone.lng]}
            radius={zone.forecastPm25 > 220 ? 13 : zone.forecastPm25 > 180 ? 10 : 7}
            pathOptions={{
              color: zone.forecastPm25 > 220 ? "#dc2626" : zone.forecastPm25 > 180 ? "#f59e0b" : "#0f9f6e",
              fillOpacity: 0.28,
            }}
          >
            <Popup>
              <strong>{zone.name}</strong>
              <br />
              Forecast PM2.5: {zone.forecastPm25}
              <br />
              Confidence: {zone.confidence}
            </Popup>
          </CircleMarker>
        ))}
        {stores.map((store) => (
          <Marker key={store.id} position={[store.lat, store.lng]} icon={icon}>
            <Popup>{store.name}</Popup>
          </Marker>
        ))}
        {scenario.options.map((option) => (
          <Polyline
            key={option.id}
            positions={option.route}
            pathOptions={{
              color: routeColors[option.id],
              weight: option.id === activeOption.id ? 6 : 3,
              opacity: option.id === activeOption.id ? 0.95 : 0.35,
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}

function DispatchOption({ option, active, onClick }: { option: RouteOption; active: boolean; onClick: () => void }) {
  const store = storeById(option.storeId)!;
  const rider = riderById(option.riderId)!;
  const zone = zoneById(store.zoneId)!;

  return (
    <button className={`dispatch-option ${active ? "active" : ""}`} onClick={onClick}>
      <div className="dispatch-option-main">
        <RiderAvatar rider={rider} compact />
        <div>
          <strong>{option.label}</strong>
          <span>{store.name} · {rider.name} · {rider.bikeNumber}</span>
          <small>{dispatchOneLiner(option.id)}</small>
        </div>
      </div>
      <div className="option-stats">
        <span>{option.minutes}m</span>
        <span>Score {option.exposure}</span>
        <span>{riskLevel(zone.forecastPm25)}</span>
      </div>
    </button>
  );
}

function RiderAvatar({ rider, compact = false }: { rider: { name: string; avatar: string }; compact?: boolean }) {
  return (
    <div className={`rider-avatar ${rider.avatar} ${compact ? "compact" : ""}`} aria-label={`${rider.name} avatar`}>
      <span>{rider.name.charAt(0)}</span>
    </div>
  );
}

function DetailChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="detail-chip">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function GlossaryItem({ title, text }: { title: string; text: string }) {
  return (
    <section>
      <strong>{title}</strong>
      <span>{text}</span>
    </section>
  );
}

function MetricTile({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="metric-tile">
      <div>{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Badge({ children, icon, tone }: { children: React.ReactNode; icon: React.ReactNode; tone: string }) {
  return (
    <span className={`badge ${tone}`}>
      {icon}
      {children}
    </span>
  );
}

function NavButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button className={`nav-button ${active ? "active" : ""}`} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

function titleCase(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function maskName(value: string) {
  const [first, ...rest] = value.split(" ");
  const maskedFirst = `${first.charAt(0)}${"*".repeat(Math.max(first.length - 1, 3))}`;
  const last = rest.at(-1);
  return last ? `${maskedFirst} ${last.charAt(0)}.` : maskedFirst;
}

function maskPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  const lastFour = digits.slice(-4);
  return `+91 ***** ${lastFour}`;
}

function dispatchOneLiner(optionId: string) {
  if (optionId === "fastest") return "Shortest time, highest exposure.";
  if (optionId === "cleaner") return "Lowest exposure, small delay.";
  return "Best balance for rider and customer.";
}

export default App;
