// ===== DOM Elements =====
const chatForm = document.querySelector("#chatForm");
const chatInput = document.querySelector("#chatInput");
const chatMessages = document.querySelector("#chatMessages");
const sendBtn = document.querySelector("#sendBtn");
const imgToggleBtn = document.querySelector("#imgToggleBtn");
const tabs = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");
const apiInputs = document.querySelectorAll(".api-key");

let imgToggle = false;
let activeTab = 0; // index of current tab

// ===== Tabs Handling =====
tabs.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    tabs.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    tabContents.forEach(tc => tc.classList.remove("active"));
    document.querySelector(`#${btn.dataset.tab}Tab`).classList.add("active");

    activeTab = index; // save active tab index
  });
});

// ===== Messages =====
function appendMessage(role, text, media=null) {
  const el = document.createElement("div");
  el.className = `message ${role}`;
  el.textContent = text;

  if(media){
    if(media.type === "image"){
      const img = document.createElement("img");
      img.src = media.url;
      el.appendChild(img);
    } else if(media.type === "video"){
      const vid = document.createElement("video");
      vid.src = media.url;
      vid.controls = true;
      el.appendChild(vid);
    } else if(media.type === "3d"){
      // simple 3D preview canvas placeholder
      const canvas = document.createElement("canvas");
      canvas.width = 300;
      canvas.height = 200;
      el.appendChild(canvas);
      // Could integrate Three.js or Babylon.js here
    }
  }

  chatMessages.appendChild(el);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ===== Signal Apps =====
const APPS = [
  "https://r2-explorer-template.celestialartisanbot.workers.dev",
  "https://d1-template.celestialartisanbot.workers.dev",
  "https://multiplayer-globe-template.celestialartisanbot.workers.dev",
  "https://openauth-template.celestialartisanbot.workers.dev"
];

async function signalApp(url, payload){
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

// ===== Chat Sending =====
async function sendChat(userText){
  appendMessage("user", userText);

  // get API key from active tab
  const apiKey = apiInputs[activeTab]?.value?.trim() || "";

  let body = {
    messages:[{ role:"user", content:userText }],
    apiKey: apiKey,
    generateImage: imgToggle
  };

  try {
    const res = await fetch("/api/chat", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify(body)
    });
    const data = await res.json();

    if(data?.messages){
      data.messages.forEach(m => {
        // check if media returned
        if(m.media) appendMessage(m.role, m.content, m.media);
        else appendMessage(m.role, m.content);
      });
    } else appendMessage("ai","No response from AI.");

    notifyApps({ action:"chatUpdate", message:userText });
  } catch(err){ appendMessage("ai","Error sending chat."); console.error(err); }
}

// ===== Event Listeners =====
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
