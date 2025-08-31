async function signalApp(workerUrl, payload) {
  try {
    const res = await fetch(workerUrl + "/api/signal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log("Signal response:", data);
  } catch (err) {
    console.error("Signal failed:", err);
  }
}

// Example usage: signal multiple apps after sending a chat
async function notifyApps() {
  const apps = [
    "https://r2-explorer-template.celestialartisanbot.workers.dev",
    "https://d1-template.celestialartisanbot.workers.dev",
    "https://multiplayer-globe-template.celestialartisanbot.workers.dev",
    "https://openauth-template.celestialartisanbot.workers.dev"
  ];

  apps.forEach(url => signalApp(url, { action: "refresh", triggeredBy: "frontend" }));
}
