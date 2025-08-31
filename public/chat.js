// Frontend DOM
const chatForm = document.querySelector("#chatForm");
const chatInput = document.querySelector("#chatInput");
const chatMessages = document.querySelector("#chatMessages");
const sendBtn = document.querySelector("#sendBtn");
const imgToggleBtn = document.querySelector("#imgToggleBtn");
const tabs = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

let imgToggle = false;

// ================== Tabs ==================
tabs.forEach(btn => {
  btn.addEventListener("click", () => {
    tabs.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    tabContents.forEach(tc => tc.classList.remove("active"));
    document.querySelector(`#${btn.dataset.tab}Tab`).classList.add("active");
  });
});

// ================== Messages ==================
function appendMessage(role, text) {
  const el = document.createElement("div");
  el.className = `message ${role}`;
  el.textContent = text;
  chatMessages.appendChild(el);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ================== Signal Apps ==================
const APPS = [
  "https://r2-explorer-template.celestialartisanbot.workers.dev",
  "https://d1-template.celestialartisanbot.workers.dev",
  "https://multiplayer-globe-template.celestialartisanbot.workers.dev",
  "https://openauth-template.celestialartisanbot.workers.dev"
];

async function signalApp(url, payload) {
  try {
    const res = await fetch(url + "/api/signal", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });
    console.log(await res.json());
  } catch(err){ console.error(err); }
}

function notifyApps(payload){ APPS.forEach(url=>signalApp(url,payload)); }

// ================== Chat ==================
async function sendChat(userText){
  appendMessage("user", userText);

  let body = { messages:[{ role:"user", content:userText }] };
  if(imgToggle) body.generateImage = true;

  try {
    const res = await fetch("/api/chat", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if(data?.messages) data.messages.forEach(m=>appendMessage(m.role,m.content));
    else appendMessage("ai","No response from AI.");

    notifyApps({ action:"chatUpdate", message:userText });
  } catch(err){ appendMessage("ai","Error sending chat."); console.error(err); }
}

// ================== Event Listeners ==================
chatForm.addEventListener("submit", e=>{
  e.preventDefault();
  const txt = chatInput.value.trim();
  if(!txt) return;
  chatInput.value="";
  sendChat(txt);
});

sendBtn.addEventListener("click", ()=>{
  const txt = chatInput.value.trim();
  if(!txt) return;
  chatInput.value="";
  sendChat(txt);
});

imgToggleBtn.addEventListener("click", ()=>{
  imgToggle = !imgToggle;
  imgToggleBtn.textContent = imgToggle ? "Image ON" : "Generate Image";
});
