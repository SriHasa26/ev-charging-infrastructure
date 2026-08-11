import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // General API rate limiter — 100 requests per 15 minutes per IP
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests. Please wait a moment and try again." },
  });

  // Strict limiter for AI endpoints — prevents Gemini quota exhaustion
  const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "AI prediction rate limit reached. Please wait 15 minutes." },
  });

  // Apply general limiter to all /api routes
  app.use("/api", apiLimiter);

  // Mock API for Station Data and AI Predictions
  app.get("/api/stations", (req, res) => {
    const { type } = req.query;
    console.log(`[API] Fetching stations for type: ${type || 'all'}`);
    // Mock data for EV and CNG stations
    // Stations placed at real Indian city coordinates
    const stations = [
      {
        id: 1,
        name: "Tata Power EV Hub — Connaught Place",
        type: "EV",
        lat: 28.6315,
        lng: 77.2167,
        city: "New Delhi",
        state: "Delhi",
        status: "available",
        detailedStatus: "5/8 chargers free",
        queueTime: 4,
        pricing: "₹18/kWh",
        rating: 4.8,
        amenities: ["WiFi", "Coffee", "Restrooms", "Lounge"],
        reviews: [
          { user: "Rajesh", rating: 5, comment: "Fastest chargers in Delhi — 40 min for full charge!" },
          { user: "Priya", rating: 4, comment: "Great location near metro. Lounge gets crowded on weekends." }
        ]
      },
      {
        id: 2,
        name: "Mahanagar Gas CNG — Andheri",
        type: "CNG",
        lat: 19.1136,
        lng: 72.8697,
        city: "Mumbai",
        state: "Maharashtra",
        status: "busy",
        detailedStatus: "1/4 pumps available",
        queueTime: 18,
        pricing: "₹94/kg",
        rating: 4.1,
        amenities: ["Restrooms", "Convenience Store"],
        reviews: [
          { user: "Suresh", rating: 4, comment: "Reliable station but gets busy during peak hours." },
          { user: "Meena", rating: 3, comment: "Long queue in the mornings — go early." }
        ]
      },
      {
        id: 3,
        name: "BESCOM EV Fast Charge — Koramangala",
        type: "EV",
        lat: 12.9352,
        lng: 77.6245,
        city: "Bengaluru",
        state: "Karnataka",
        status: "available",
        detailedStatus: "3/4 chargers free",
        queueTime: 6,
        pricing: "₹16/kWh",
        rating: 4.9,
        amenities: ["WiFi", "Restrooms", "Food Court"],
        reviews: [
          { user: "Kiran", rating: 5, comment: "Best EV station in Bengaluru. Super fast!" },
          { user: "Ananya", rating: 5, comment: "Very clean and well-maintained." }
        ]
      },
      {
        id: 4,
        name: "Ather Grid — Banjara Hills",
        type: "EV",
        lat: 17.4156,
        lng: 78.4347,
        city: "Hyderabad",
        state: "Telangana",
        status: "busy",
        detailedStatus: "0/6 chargers free",
        queueTime: 22,
        pricing: "₹15/kWh",
        rating: 3.8,
        amenities: ["Coffee", "Restrooms"],
        reviews: [
          { user: "Venkat", rating: 3, comment: "Always full on evenings. Need more chargers here." },
          { user: "Divya", rating: 4, comment: "Good pricing but need to time your visit." }
        ]
      },
      {
        id: 5,
        name: "Adani Total Gas CNG — Hinjewadi",
        type: "CNG",
        lat: 18.5912,
        lng: 73.7386,
        city: "Pune",
        state: "Maharashtra",
        status: "available",
        detailedStatus: "3/3 pumps available",
        queueTime: 3,
        pricing: "₹90/kg",
        rating: 4.6,
        amenities: ["Restrooms", "Air/Water", "Convenience Store"],
        reviews: [
          { user: "Amit", rating: 5, comment: "Never a long wait. Very efficient service." },
          { user: "Shruti", rating: 4, comment: "Clean and well-stocked store." }
        ]
      },
      {
        id: 6,
        name: "TANGEDCO EV Station — Anna Nagar",
        type: "EV",
        lat: 13.0843,
        lng: 80.2101,
        city: "Chennai",
        state: "Tamil Nadu",
        status: "available",
        detailedStatus: "4/6 chargers free",
        queueTime: 8,
        pricing: "₹14/kWh",
        rating: 4.5,
        amenities: ["WiFi", "Restrooms", "Lounge"],
        reviews: [
          { user: "Arjun", rating: 5, comment: "Excellent station with a/c lounge. Best in Chennai." },
          { user: "Kavitha", rating: 4, comment: "Good location. Parking can be tricky." }
        ]
      },
    ];
    
    const filtered = type ? stations.filter(s => s.type === type) : stations;
    res.json(filtered);
  });

  // Apply strict AI rate limiter specifically to this endpoint
  app.post("/api/predict-queue", aiLimiter, (req, res) => {
    const { stationId, stationType } = req.body;

    // Time-of-day multiplier — realistic peak hours for India
    const hour = new Date().getHours();
    let peakMultiplier = 1.0;
    if (hour >= 7 && hour <= 10) peakMultiplier = 1.8;       // Morning rush
    else if (hour >= 17 && hour <= 20) peakMultiplier = 2.0; // Evening peak
    else if (hour >= 22 || hour <= 5) peakMultiplier = 0.4;  // Nighttime low

    // Base times differ by fuel type
    const baseTime = stationType === 'CNG' ? 5 : 10; // CNG is faster to fill

    const predictedQueueTime = Math.round(baseTime * peakMultiplier);
    const confidence = peakMultiplier === 1.0 ? 0.75 : 0.88;
    const trend = peakMultiplier > 1.2 ? "increasing" : peakMultiplier < 0.7 ? "decreasing" : "stable";

    console.log(`[API] Queue prediction for station ${stationId} at hour ${hour}: ${predictedQueueTime}min (${trend})`);

    res.json({
      stationId,
      predictedQueueTime,
      confidence,
      trend,
      peakHour: peakMultiplier > 1.2,
      message: peakMultiplier > 1.5
        ? "High demand period — consider waiting or choosing an alternate station."
        : peakMultiplier < 0.7
        ? "Off-peak hours — minimal wait expected."
        : "Moderate demand — typical wait times apply."
    });
  });


  // Overpass API Proxy — fetches real EV/CNG station data from OpenStreetMap
  // No API key required. Proxied through server to avoid CORS issues.
  app.get("/api/overpass-stations", async (req, res) => {
    const { south, west, north, east, type } = req.query as Record<string, string>;

    if (!south || !west || !north || !east || !type) {
      return res.status(400).json({ error: "Missing required query params: south, west, north, east, type" });
    }

    const bbox = `${south},${west},${north},${east}`;
    let overpassQuery = "";

    if (type === "EV") {
      overpassQuery = `
[out:json][timeout:30];
(
  node["amenity"="charging_station"](${bbox});
  way["amenity"="charging_station"](${bbox});
  relation["amenity"="charging_station"](${bbox});
);
out center tags;`;
    } else if (type === "CNG") {
      overpassQuery = `
[out:json][timeout:30];
(
  node["amenity"="fuel"]["fuel:cng"="yes"](${bbox});
  way["amenity"="fuel"]["fuel:cng"="yes"](${bbox});
  node["amenity"="fuel"]["name"~"CNG|Compressed Natural Gas|CNG Pump",i](${bbox});
  way["amenity"="fuel"]["name"~"CNG|Compressed Natural Gas|CNG Pump",i](${bbox});
);
out center tags;`;
    } else {
      return res.status(400).json({ error: "type must be EV or CNG" });
    }

    try {
      console.log(`[Overpass] Querying ${type} stations in bbox: ${bbox}`);

      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json, text/plain, */*",
          "User-Agent": "FuelFlowAI/1.0 (admin@example.com)"
        },
        body: `data=${encodeURIComponent(overpassQuery)}`,
        signal: AbortSignal.timeout(35000),
      });

      if (!response.ok) {
        throw new Error(`Overpass returned HTTP ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as any;
      const elements = data.elements || [];

      const stations = elements
        .map((el: any, idx: number) => {
          const lat = el.lat ?? el.center?.lat;
          const lng = el.lon ?? el.center?.lon;
          if (!lat || !lng) return null;

          const tags = el.tags || {};
          const name =
            tags.name ||
            tags["name:en"] ||
            tags.operator ||
            tags.brand ||
            (type === "EV" ? "EV Charging Station" : "CNG Fuel Station");

          // Time-of-day queue estimate
          const hour = new Date().getHours();
          const baseTime = type === "CNG" ? 5 : 10;
          let queueTime = baseTime;
          if (hour >= 7 && hour <= 10) queueTime = Math.round(baseTime * 1.8);
          else if (hour >= 17 && hour <= 20) queueTime = Math.round(baseTime * 2.0);
          else if (hour >= 22 || hour <= 5) queueTime = Math.round(baseTime * 0.4);

          return {
            id: `osm_${el.id}`,
            name,
            lat,
            lng,
            type,
            status: "available",
            queueTime,
            city: tags["addr:city"] || tags["addr:town"] || tags["addr:suburb"] || "Unknown",
            state: tags["addr:state"] || "Unknown",
            address: tags["addr:full"] || tags["addr:street"] || "",
            operator: tags.operator || tags.brand || "",
            rating: null,
            source: "osm",
          };
        })
        .filter(Boolean);

      console.log(`[Overpass] Found ${stations.length} ${type} stations`);
      res.json(stations);
    } catch (error: any) {
      console.error("[Overpass] Error:", error.message || error);
      res.status(500).json({ error: "Failed to fetch from Overpass API", detail: error.message });
    }
  });

  // Feedback API
  app.post("/api/feedback", express.json(), (req, res) => {
    const { type, message, timestamp } = req.body;
    console.log(`[FEEDBACK] Type: ${type}, Message: ${message}, Time: ${timestamp}`);
    // In a real app, you would save this to a database
    res.status(200).json({ status: "success", message: "Feedback received" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
