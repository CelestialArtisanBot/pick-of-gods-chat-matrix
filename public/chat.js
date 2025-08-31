// =============================
// pick-of-gods-chat-matrix chat.js
// =============================

// Frontend DOM elements
const chatForm = document.querySelector("#chatForm");
const chatInput = document.querySelector("#chatInput");
const chatMessages = document.querySelector("#chatMessages");
const sendBtn = document.querySelector("#sendBtn");

// =============================
// Signal Apps
// =============================
const APPS = [
  "https://r2-explorer-template.celestialartisanbot.workers.dev",
  "https://d1-template.celestialartisanbot.workers.dev",
  "https://multiplayer-globe-template.celestialartisanbot.workers.dev",
  "https://openauth-template.celestialartisanbot.workers.dev"
];

async function signalApp(workerUrl, payload) {
  try {
    const res = await fetch(workerUrl + "/api/signal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log(`Signal to ${workerUrl}:`, data);
  } catch (err) {
    console.error(`Signal failed for ${workerUrl}:`, err);
  }
}

async function notifyApps(payload) {
  for (const url of APPS) {
    signalApp(url, payload);
  }
}

// =============================
// Chat UI Handling
// =============================
function appendMessage(role, text) {
  const messageEl = document.createElement("div");
  messageEl.className = `message ${role}`;
  messageEl.textContent = text;
  chatMessages.appendChild(messageEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// =============================
// AI Chat API
// =============================
async function sendChat(userText) {
  appendMessage("user", userText);

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: userText }] })
    });

    const data = await res.json();
    if (data?.messages) {
      data.messages.forEach(msg => appendMessage(msg.role, msg.content));
    } else {
      appendMessage("system", "No response from AI.");
    }

    // Signal other apps after chat is processed
    notifyApps({ action: "chatUpdate", message: userText });
  } catch (err) {
    console.error("Chat request failed:", err);
    appendMessage("system", "Error sending chat.");
  }
}

// =============================
// Event Listeners
// =============================
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = "";
  await sendChat(text);
});

sendBtn.addEventListener("click", async () => {
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = "";
  await sendChat(text);
});
