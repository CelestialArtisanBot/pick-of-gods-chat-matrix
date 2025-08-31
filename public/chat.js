// === Define endpoints through the hub Worker ===
const endpointMap = {
  chat: "/routes/chat/tab/chat",
  t2i: "/routes/chat/tab/t2i",
  globe: "/routes/chat/tab/globe",
  r2: "/routes/chat/tab/r2",
  d1: "/routes/chat/tab/d1",
  auth: "/routes/chat/tab/auth"
};

// === Elements ===
const tabContainer = document.getElementById("tabs");
const contentContainer = document.getElementById("content");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");

let currentTab = "chat";

// === Function to switch tabs ===
async function switchTab(tabName) {
  currentTab = tabName;
  const endpoint = endpointMap[tabName];
  
  // Fetch Worker front-end content
  const res = await fetch(endpoint);
  const html = await res.text();
  contentContainer.innerHTML = html;

  // Rebind chat if AI chat tab
  if (tabName === "chat") bindChat();
}

// === Send chat message ===
async function sendChatMessage(message) {
  const res = await fetch("/routes/chat/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });
  const data = await res.json();
  appendMessage("AI", data.reply);
}

// === Append message to chat window ===
function appendMessage(sender, text) {
  const msgEl = document.createElement("div");
  msgEl.className = `message ${sender.toLowerCase()}`;
  msgEl.textContent = `${sender}: ${text}`;
  chatMessages.appendChild(msgEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// === Bind form submit ===
function bindChat() {
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = chatInput.value.trim();
    if (!msg) return;
    appendMessage("You", msg);
    chatInput.value = "";
    await sendChatMessage(msg);
  });
}

// === Bind tab buttons dynamically ===
document.querySelectorAll(".tab-button").forEach(btn => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

// === Initialize default tab ===
switchTab(currentTab);
