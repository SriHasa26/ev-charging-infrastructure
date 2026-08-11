async function test() {
  const t0 = Date.now();
  // Entire India bbox roughly
  const bbox = "8.0,68.0,37.0,97.0";
  const overpassQuery = `
[out:json][timeout:30];
(
  node["amenity"="charging_station"](${bbox});
);
out center tags;`;
  
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { 
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json",
      "User-Agent": "FuelFlow-AI/1.0"
    },
    body: `data=${encodeURIComponent(overpassQuery)}`,
  });
  console.log("Status:", res.status);
  const json = await res.json();
  console.log("Elements:", json.elements?.length, "Time:", Date.now() - t0, "ms");
}
test();
