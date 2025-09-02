const chatForm = document.querySelector("#chatForm");
const chatInput = document.querySelector("#chatInput");
const chatMessages = document.querySelector("#chatMessages");
const sendBtn = document.querySelector("#sendBtn");
const imgToggleBtn = document.querySelector("#imgToggleBtn");

let imgToggle = false;

function appendMessage(role, text) {
  const el = document.createElement("div");
  el.className = `message ${role}`;
  el.textContent = text;
  chatMessages.appendChild(el);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendChat(userText){
  appendMessage("user", userText);

  const body = { messages:[{ role:"user", content:userText }], generateImage: imgToggle };

  try {
    const res = await fetch("/api/chat", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if(data?.messages) data.messages.forEach(m=>appendMessage(m.role,m.content));
    else appendMessage("ai","No response from AI.");
  } catch(err){ appendMessage("ai","Error sending chat."); console.error(err); }
}

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
