// public/chat.ts
// Frontend TypeScript: chat UI + interactions for pick-of-gods-chat-matrix
// Expects backend endpoints:
//  - POST /api/auth  { email } -> session
//  - POST /api/chat  { messages, generateImage, modelChoice, userKeys } -> response
//  - POST /api/send  { to, subject, body } -> send email (optional server-side)

type Role = "user" | "ai" | "system";
type Message = { role: Role; content: string };

const qs = (s: string) => document.querySelector(s) as HTMLElement | null;

// DOM nodes
const chatForm = qs("#chatForm") as HTMLFormElement;
const chatInput = qs("#chatInput") as HTMLTextAreaElement;
const chatMessages = qs("#chatMessages") as HTMLDivElement;
const sendBtn = qs("#sendBtn") as HTMLButtonElement;
const imgToggleBtn = qs("#imgToggleBtn") as HTMLButtonElement;
const modelSelect = qs("#modelSelect") as HTMLSelectElement;
const apiKeyInputs = {
  chat: qs("#apiKeyChat") as HTMLInputElement,
  image: qs("#apiKeyImage") as HTMLInputElement,
  "3d": qs("#apiKey3d") as HTMLInputElement,
  video: qs("#apiKeyVideo") as HTMLInputElement,
};
const saveKeysBtn = qs("#saveKeysBtn") as HTMLButtonElement;
const emailForm = qs("#emailForm") as HTMLFormElement|null;
const emailInput = qs("#emailInput") as HTMLInputElement|null;
const sendEmailBtn = qs("#sendEmailBtn") as HTMLButtonElement|null;
const modelPreview = qs("#modelPreview") as HTMLDivElement;

let generateImage = false;

// init
initUI();
loadSavedKeys();
renderModelPreview();

// ===================== UI helpers =====================
function appendMessage(role: Role, text: string) {
  const el = document.createElement("div");
  el.className = `message ${role}`;
  // handle URLs or images in content
  if (isImageUrl(text)) {
    const img = document.createElement("img");
    img.src = text;
    img.alt = "generated";
    img.loading = "lazy";
    img.className = "generated-image";
    el.appendChild(img);
  } else {
    el.textContent = text;
  }
  chatMessages.appendChild(el);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function isImageUrl(s: string) {
  return /^https?:\/\/.+\.(png|jpe?g|gif|webp|avif)(\?.*)?$/i.test(s);
}

function setToggleButtonState() {
  imgToggleBtn.textContent = generateImage ? "Image ON" : "Generate Image";
  imgToggleBtn.classList.toggle("on", generateImage);
}

function getUserKeys() {
  return {
    chat: localStorage.getItem("key_chat") || "",
    image: localStorage.getItem("key_image") || "",
    "3d": localStorage.getItem("key_3d") || "",
    video: localStorage.getItem("key_video") || "",
  };
}

function saveUserKeys() {
  Object.entries(apiKeyInputs).forEach(([k, el]) => {
    if (el && el.value) localStorage.setItem(`key_${k}`, el.value.trim());
    else localStorage.removeItem(`key_${k}`);
  });
  flashNotice("API keys saved locally.");
}

function loadSavedKeys() {
  Object.entries(apiKeyInputs).forEach(([k, el]) => {
    if (!el) return;
    const v = localStorage.getItem(`key_${k}`);
    if (v) el.value = v;
  });
}

function flashNotice(msg: string) {
  const n = document.createElement("div");
  n.className = "notice";
  n.textContent = msg;
  document.body.appendChild(n);
  setTimeout(() => n.classList.add("visible"), 10);
  setTimeout(() => n.classList.remove("visible"), 2500);
  setTimeout(() => n.remove(), 3000);
}

function renderModelPreview() {
  const choice = modelSelect.value;
  modelPreview.textContent = `Model target: ${choice.toUpperCase()}`;
}

// ===================== Event wiring =====================
function initUI() {
  setToggleButtonState();

  saveKeysBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    saveUserKeys();
  });

  modelSelect?.addEventListener("change", () => {
    renderModelPreview();
  });

  imgToggleBtn?.addEventListener("click", () => {
    generateImage = !generateImage;
    setToggleButtonState();
  });

  chatForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const txt = chatInput.value.trim();
    if (!txt) return;
    chatInput.value = "";
    sendChat(txt);
  });

  sendBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    const txt = chatInput.value.trim();
    if (!txt) return;
    chatInput.value = "";
    sendChat(txt);
  });

  sendEmailBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    const to = emailInput?.value?.trim() || "";
    if (!to) { flashNotice("Enter email address"); return; }
    const last = Array.from(chatMessages.querySelectorAll(".message.ai")).pop() as HTMLElement | undefined;
    const body = last ? last.innerText || last.textContent || "" : "No content";
    try {
      await fetch("/api/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to, subject: "Your generated content", body }) });
      flashNotice("Email request sent (server must implement /api/send).");
    } catch (err) {
      console.error(err);
      flashNotice("Failed to request email send.");
    }
  });
}

// ===================== Chat flow =====================
async function sendChat(userText: string) {
  appendMessage("user", userText);

  const userKeys = getUserKeys();
  const payload = {
    messages: [{ role: "user", content: userText }],
    generateImage,
    modelChoice: modelSelect.value,
    userKeys,
    maxTokens: 512,
    temperature: 0.7,
  };

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const txt = await res.text();
      appendMessage("ai", `Error: ${res.status} ${txt}`);
      return;
    }
    const data = await res.json();
    if (data?.messages && Array.isArray(data.messages)) {
      for (const m of data.messages) appendMessage(m.role as Role, m.content);
    } else if (data?.imageUrl) {
      appendMessage("ai", data.imageUrl);
    } else if (typeof data === "string") {
      appendMessage("ai", data);
    } else {
      appendMessage("ai", "No response from server.");
    }
  } catch (err) {
    console.error(err);
    appendMessage("ai", "Network error.");
  }
}
