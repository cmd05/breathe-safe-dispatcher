import mlPredictions from "./mlPredictions.json";

export type RiskLevel = "Low" | "Moderate" | "High" | "Severe";
export type Confidence = "High" | "Medium" | "Low";

export type Zone = {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  currentPm25: number;
  forecastPm25: number;
  persistencePm25: number;
  confidence: Confidence;
  note: string;
};

export type Store = {
  id: string;
  name: string;
  zoneId: string;
  lat: number;
  lng: number;
  ridersAvailable: number;
};

export type Rider = {
  id: string;
  name: string;
  avatar: string;
  bikeNumber: string;
  phone: string;
  zoneId: string;
  shift: string;
  exposureToday: number;
  highExposureRuns: number;
  maskConfirmed: boolean;
};

export type RestZone = {
  id: string;
  name: string;
  zoneId: string;
  lat: number;
  lng: number;
  capacity: number;
  availableSeats: number;
  masks: number;
  amenities: string[];
};

export type OrderPriority = "standard" | "express" | "low-priority";

export type Order = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerArea: string;
  zoneId: string;
  lat: number;
  lng: number;
  priority: OrderPriority;
  promisedMinutes: number;
  basket: string;
};

export type RouteOption = {
  id: string;
  label: string;
  storeId: string;
  riderId: string;
  minutes: number;
  distanceKm: number;
  exposure: number;
  riskyKm: number;
  route: [number, number][];
  rationale: string;
};

export type Scenario = {
  id: string;
  title: string;
  orderId: string;
  severeWindow: string;
  options: RouteOption[];
};

type MlPrediction = {
  zoneId: string;
  predictedPm25: number;
  persistencePm25: number;
};

const modelForecastByZone = new Map(
  (mlPredictions.predictions as MlPrediction[]).map((prediction) => [prediction.zoneId, prediction]),
);

function modelForecast(zoneId: string, fallback: number) {
  return modelForecastByZone.get(zoneId)?.predictedPm25 ?? fallback;
}

export const zones: Zone[] = [
  {
    id: "cp",
    name: "Connaught Place",
    area: "Central Delhi",
    lat: 28.6315,
    lng: 77.2167,
    currentPm25: 214,
    forecastPm25: modelForecast("cp", 226),
    persistencePm25: 214,
    confidence: "High",
    note: "Baseline model flags evening traffic and inversion risk.",
  },
  {
    id: "karol",
    name: "Karol Bagh",
    area: "Central Delhi",
    lat: 28.6518,
    lng: 77.1909,
    currentPm25: 238,
    forecastPm25: modelForecast("karol", 246),
    persistencePm25: 238,
    confidence: "Medium",
    note: "Model expects market traffic to keep exposure severe.",
  },
  {
    id: "lajpat",
    name: "Lajpat Nagar",
    area: "South Delhi",
    lat: 28.5677,
    lng: 77.2433,
    currentPm25: 194,
    forecastPm25: modelForecast("lajpat", 202),
    persistencePm25: 194,
    confidence: "Medium",
    note: "Model sees high demand and route traffic near the customer.",
  },
  {
    id: "saket",
    name: "Saket",
    area: "South Delhi",
    lat: 28.5245,
    lng: 77.2066,
    currentPm25: 162,
    forecastPm25: modelForecast("saket", 156),
    persistencePm25: 162,
    confidence: "High",
    note: "Model keeps this as the cleaner fulfillment pocket.",
  },
  {
    id: "rohini",
    name: "Rohini",
    area: "North West Delhi",
    lat: 28.7353,
    lng: 77.0822,
    currentPm25: 256,
    forecastPm25: modelForecast("rohini", 268),
    persistencePm25: 256,
    confidence: "Medium",
    note: "High forecast due to stagnant wind in the baseline model.",
  },
  {
    id: "dwarka",
    name: "Dwarka",
    area: "South West Delhi",
    lat: 28.5921,
    lng: 77.046,
    currentPm25: 181,
    forecastPm25: modelForecast("dwarka", 174),
    persistencePm25: 181,
    confidence: "Medium",
    note: "Model sees stronger wind and lower central-city traffic.",
  },
  {
    id: "noida18",
    name: "Noida Sector 18",
    area: "Noida",
    lat: 28.5708,
    lng: 77.3261,
    currentPm25: 176,
    forecastPm25: modelForecast("noida18", 188),
    persistencePm25: 176,
    confidence: "High",
    note: "Model keeps this below central Delhi during this scenario.",
  },
  {
    id: "gurugram",
    name: "Gurugram Cyber Hub",
    area: "Gurugram",
    lat: 28.495,
    lng: 77.0888,
    currentPm25: 149,
    forecastPm25: modelForecast("gurugram", 158),
    persistencePm25: 149,
    confidence: "High",
    note: "Model predicts a lower forecast than Delhi core.",
  },
  {
    id: "ghaziabad",
    name: "Ghaziabad",
    area: "Ghaziabad",
    lat: 28.6692,
    lng: 77.4538,
    currentPm25: 271,
    forecastPm25: modelForecast("ghaziabad", 286),
    persistencePm25: 271,
    confidence: "Medium",
    note: "Model flags this as a severe PM2.5 pocket.",
  },
  {
    id: "faridabad",
    name: "Faridabad",
    area: "Faridabad",
    lat: 28.4089,
    lng: 77.3178,
    currentPm25: 167,
    forecastPm25: modelForecast("faridabad", 171),
    persistencePm25: 167,
    confidence: "Low",
    note: "Model confidence is lower because station coverage is sparse.",
  },
];

export const stores: Store[] = [
  { id: "store-cp", name: "CP Micro Fulfillment", zoneId: "cp", lat: 28.6322, lng: 77.2191, ridersAvailable: 7 },
  { id: "store-karol", name: "Karol Bagh Dark Store", zoneId: "karol", lat: 28.6502, lng: 77.1934, ridersAvailable: 5 },
  { id: "store-saket", name: "Saket Cleaner Hub", zoneId: "saket", lat: 28.5261, lng: 77.211, ridersAvailable: 6 },
  { id: "store-lajpat", name: "Lajpat Rider Hub", zoneId: "lajpat", lat: 28.5688, lng: 77.2408, ridersAvailable: 4 },
  { id: "store-dwarka", name: "Dwarka Sector Hub", zoneId: "dwarka", lat: 28.595, lng: 77.0491, ridersAvailable: 6 },
  { id: "store-noida", name: "Noida Sector 18 Hub", zoneId: "noida18", lat: 28.5719, lng: 77.3243, ridersAvailable: 8 },
];

export const riders: Rider[] = [
  {
    id: "r1",
    name: "Aman",
    avatar: "aman",
    bikeNumber: "DL 01 AX 4281",
    phone: "+91 98XX XX2194",
    zoneId: "cp",
    shift: "4 PM - 11 PM",
    exposureToday: 612,
    highExposureRuns: 3,
    maskConfirmed: false,
  },
  {
    id: "r2",
    name: "Imran",
    avatar: "imran",
    bikeNumber: "DL 3S CT 7720",
    phone: "+91 97XX XX0842",
    zoneId: "saket",
    shift: "2 PM - 10 PM",
    exposureToday: 388,
    highExposureRuns: 1,
    maskConfirmed: true,
  },
  {
    id: "r3",
    name: "Rohit",
    avatar: "rohit",
    bikeNumber: "DL 05 SQ 9136",
    phone: "+91 88XX XX4410",
    zoneId: "lajpat",
    shift: "5 PM - 12 AM",
    exposureToday: 431,
    highExposureRuns: 2,
    maskConfirmed: true,
  },
  {
    id: "r4",
    name: "Sahil",
    avatar: "sahil",
    bikeNumber: "HR 26 DK 3055",
    phone: "+91 99XX XX5176",
    zoneId: "dwarka",
    shift: "3 PM - 10 PM",
    exposureToday: 344,
    highExposureRuns: 0,
    maskConfirmed: true,
  },
  {
    id: "r5",
    name: "Dev",
    avatar: "dev",
    bikeNumber: "DL 08 CB 6402",
    phone: "+91 96XX XX7301",
    zoneId: "karol",
    shift: "4 PM - 11 PM",
    exposureToday: 704,
    highExposureRuns: 4,
    maskConfirmed: false,
  },
];

export const restZones: RestZone[] = [
  {
    id: "rest-cp",
    name: "CP Rider Recovery Room",
    zoneId: "cp",
    lat: 28.6328,
    lng: 77.2176,
    capacity: 18,
    availableSeats: 5,
    masks: 12,
    amenities: ["Filtered air", "N95 masks", "Water", "Charging"],
  },
  {
    id: "rest-saket",
    name: "Saket Store Rest Zone",
    zoneId: "saket",
    lat: 28.5265,
    lng: 77.2074,
    capacity: 14,
    availableSeats: 8,
    masks: 21,
    amenities: ["Filtered air", "Water", "Seating"],
  },
  {
    id: "rest-lajpat",
    name: "Lajpat Indoor Break Point",
    zoneId: "lajpat",
    lat: 28.5681,
    lng: 77.2449,
    capacity: 10,
    availableSeats: 2,
    masks: 4,
    amenities: ["N95 masks", "Water"],
  },
  {
    id: "rest-dwarka",
    name: "Dwarka Rider Cooldown Hub",
    zoneId: "dwarka",
    lat: 28.5915,
    lng: 77.0473,
    capacity: 16,
    availableSeats: 9,
    masks: 17,
    amenities: ["Filtered air", "Water", "Charging"],
  },
];

export const orders: Order[] = [
  {
    id: "ORD-4821",
    customerName: "Nisha Kapoor",
    customerPhone: "+91 98765 43210",
    customerArea: "Jangpura Extension",
    zoneId: "lajpat",
    lat: 28.5832,
    lng: 77.2475,
    priority: "standard",
    promisedMinutes: 18,
    basket: "Medicines, milk, baby wipes",
  },
  {
    id: "ORD-4822",
    customerName: "Arjun Mehta",
    customerPhone: "+91 99887 76655",
    customerArea: "Rajendra Place",
    zoneId: "karol",
    lat: 28.6424,
    lng: 77.178,
    priority: "low-priority",
    promisedMinutes: 25,
    basket: "Snacks, detergent, cola",
  },
  {
    id: "ORD-4823",
    customerName: "Priya Rao",
    customerPhone: "+91 91234 56780",
    customerArea: "Golf Course Road",
    zoneId: "gurugram",
    lat: 28.452,
    lng: 77.0962,
    priority: "express",
    promisedMinutes: 15,
    basket: "Dinner kit, curd",
  },
];

export const scenarios: Scenario[] = [
  {
    id: "scenario-lajpat",
    title: "South Delhi standard order during severe PM2.5 window",
    orderId: "ORD-4821",
    severeWindow: "7:15 PM - 8:00 PM",
    options: [
      {
        id: "fastest",
        label: "Fastest",
        storeId: "store-lajpat",
        riderId: "r3",
        minutes: 13,
        distanceKm: 3.2,
        exposure: 84,
        riskyKm: 2.3,
        route: [
          [28.5688, 77.2408],
          [28.5741, 77.2429],
          [28.5798, 77.2456],
          [28.5832, 77.2475],
        ],
        rationale: "Nearest store and shortest route, but it stays inside a high-PM2.5 corridor.",
      },
      {
        id: "cleaner",
        label: "Cleaner",
        storeId: "store-saket",
        riderId: "r2",
        minutes: 16,
        distanceKm: 4.1,
        exposure: 58,
        riskyKm: 0.8,
        route: [
          [28.5261, 77.211],
          [28.5422, 77.2214],
          [28.5634, 77.2361],
          [28.5832, 77.2475],
        ],
        rationale: "Saket has a lower PM2.5 forecast and available masked riders; adds 3 minutes.",
      },
      {
        id: "balanced",
        label: "Recommended",
        storeId: "store-saket",
        riderId: "r2",
        minutes: 15,
        distanceKm: 3.8,
        exposure: 62,
        riskyKm: 1.1,
        route: [
          [28.5261, 77.211],
          [28.5482, 77.2248],
          [28.5701, 77.2398],
          [28.5832, 77.2475],
        ],
        rationale: "Best tradeoff: 26% lower exposure while staying under the 18-minute promise.",
      },
    ],
  },
];

export function riskLevel(pm25: number): RiskLevel {
  if (pm25 <= 60) return "Low";
  if (pm25 <= 120) return "Moderate";
  if (pm25 <= 200) return "High";
  return "Severe";
}

export function zoneById(zoneId: string) {
  return zones.find((zone) => zone.id === zoneId);
}

export function storeById(storeId: string) {
  return stores.find((store) => store.id === storeId);
}

export function riderById(riderId: string) {
  return riders.find((rider) => rider.id === riderId);
}

export function orderById(orderId: string) {
  return orders.find((order) => order.id === orderId);
}

export function exposureSaved(reference: number, value: number) {
  return Math.round(((reference - value) / reference) * 100);
}
