// Frontend DOM
const tabs = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

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
function appendMessage(container, role, content, type="text") {
  const el = document.createElement("div");
  el.className = `message ${role}`;
  
  if(type === "text") el.textContent = content;
  else if(type === "image"){
    const img = document.createElement("img");
    img.src = content;
    img.alt = "Generated image";
    el.appendChild(img);
  }
  else if(type === "video"){
    const video = document.createElement("video");
    video.src = content;
    video.controls = true;
    el.appendChild(video);
  }
  else if(type === "3d"){
    const iframe = document.createElement("iframe");
    iframe.src = content;
    iframe.width = "300";
    iframe.height = "300";
    iframe.allow = "fullscreen";
    el.appendChild(iframe);
  }

  container.appendChild(el);
  container.scrollTop = container.scrollHeight;
}

// ================== Chat Functions ==================
async function sendChat(type, userText){
  let container, apiInput, input;

  switch(type){
    case "text":
      container = document.querySelector("#chatMessages");
      apiInput = document.querySelector("#textApiKey");
      input = document.querySelector("#chatInput");
      break;
    case "image":
      container = document.querySelector("#imageMessages");
      apiInput = document.querySelector("#imageApiKey");
      input = document.querySelector("#chatInputImage");
      break;
    case "video":
      container = document.querySelector("#videoMessages");
      apiInput = document.querySelector("#videoApiKey");
      input = document.querySelector("#chatInputVideo");
      break;
    case "3d":
      container = document.querySelector("#3dMessages");
      apiInput = document.querySelector("#3dApiKey");
      input = document.querySelector("#chatInput3D");
      break;
  }

  const apiKey = apiInput.value.trim();
  if(!apiKey) return appendMessage(container,"ai","Please enter the API key for this section.");

  // Save key to localStorage
  localStorage.setItem(`${type}ApiKey`, apiKey);

  appendMessage(container,"user",userText);

  const body = { messages:[{ role:"user", content:userText }], type, apiKey };

  try {
    const res = await fetch("/api/chat", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify(body)
    });
    const data = await res.json();

    if(data?.messages) data.messages.forEach(m=>{
      let outputType = "text";
      if(type==="image") outputType = "image";
      if(type==="video") outputType = "video";
      if(type==="3d") outputType = "3d";
      appendMessage(container, m.role, m.content, outputType);
    });
    else appendMessage(container,"ai","No response from AI.");
  } catch(err){
    appendMessage(container,"ai","Error sending chat.");
    console.error(err);
  }

  input.value = "";
}

// ================== Event Listeners ==================
document.querySelector("#chatForm").addEventListener("submit", e=>{
  e.preventDefault();
  const txt = document.querySelector("#chatInput").value.trim();
  if(txt) sendChat("text", txt);
});

document.querySelector("#sendImageBtn").addEventListener("click", ()=>{
  const txt = document.querySelector("#chatInputImage").value.trim();
  if(txt) sendChat("image", txt);
});

document.querySelector("#sendVideoBtn").addEventListener("click", ()=>{
  const txt = document.querySelector("#chatInputVideo").value.trim();
  if(txt) sendChat("video", txt);
});

document.querySelector("#send3DBtn").addEventListener("click", ()=>{
  const txt = document.querySelector("#chatInput3D").value.trim();
  if(txt) sendChat("3d", txt);
});

// ================== Load API Keys from localStorage ==================
["text","image","video","3d"].forEach(type=>{
  const savedKey = localStorage.getItem(`${type}ApiKey`);
  if(savedKey){
    document.querySelector(`#${type}ApiKey`).value = savedKey;
  }
});
