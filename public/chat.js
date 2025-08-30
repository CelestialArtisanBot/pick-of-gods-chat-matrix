const chatEl = document.getElementById('chat');
const inputEl = document.getElementById('input');
const sendBtn = document.getElementById('send');
const tabsEl = document.getElementById('tabs');
const newTabBtn = document.getElementById('newTab');
const imageBtn = document.getElementById('imageBtn');
const imagePromptEl = document.getElementById('imagePrompt');
const imageCountEl = document.getElementById('imageCount');

let chatMemory = JSON.parse(localStorage.getItem('chatMemory') || '{}');
let activeTab = Object.keys(chatMemory)[0] || createNewTab();

function createNewTab(name) {
  const tabId = name || 'Memory ' + (Object.keys(chatMemory).length + 1);
  chatMemory[tabId] = chatMemory[tabId] || [];
  localStorage.setItem('chatMemory', JSON.stringify(chatMemory));
  renderTabs();
  switchTab(tabId);
  return tabId;
}

function renderTabs() {
  tabsEl.innerHTML = '';
  Object.keys(chatMemory).forEach(tab => {
    const btn = document.createElement('button');
    btn.textContent = tab;
    btn.className = 'tab' + (tab === activeTab ? ' active' : '');
    btn.onclick = () => switchTab(tab);
    tabsEl.appendChild(btn);
  });
}

function switchTab(tabId) {
  activeTab = tabId;
  renderTabs();
  renderChat();
}

function renderChat() {
  chatEl.innerHTML = '';
  const messages = chatMemory[activeTab] || [];
  messages.forEach(msg => {
    const div = document.createElement('div');
    div.className = 'chat-message ' + msg.role;
    div.innerHTML = `<pre>${msg.content}</pre>`;
    div.onclick = () => copyToClipboard(msg.content);
    chatEl.appendChild(div);
  });
  chatEl.scrollTop = chatEl.scrollHeight;
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
}

async function sendMessage() {
  const content = inputEl.value.trim();
  if (!content) return;
  addMessage('user', content);
  inputEl.value = '';

  const res = await fetch('/api/chat', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({messages: chatMemory[activeTab]})
  });
  const data = await res.json();
  if (data.success && data.messages) {
    data.messages.slice(chatMemory[activeTab].length).forEach(msg => addMessage(msg.role, msg.content));
  } else {
    addMessage('assistant', 'Error: '+(data.error||'Unknown'));
  }
}

function addMessage(role, content) {
  chatMemory[activeTab].push({role, content, timestamp: new Date().toISOString()});
  localStorage.setItem('chatMemory', JSON.stringify(chatMemory));
  renderChat();
}

// Image generation
async function generateImage() {
  const prompt = imagePromptEl.value.trim();
  const count = parseInt(imageCountEl.value) || 1;
  if(!prompt) return;

  const res = await fetch('/api/image', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({prompt, width:1024, height:1024, steps:30, count})
  });

  if (count===1) {
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    addMessage('assistant', `<img src="${url}" style="max-width:100%; border:1px solid #00ff00;">`);
  } else {
    const data = await res.json();
    data.images.forEach(b64=>{
      const url = 'data:image/png;base64,'+b64;
      addMessage('assistant', `<img src="${url}" style="max-width:100%; border:1px solid #00ff00;">`);
    });
  }
}

sendBtn.onclick = sendMessage;
inputEl.addEventListener('keydown', e=>{if(e.key==='Enter') sendMessage();});
newTabBtn.onclick = ()=>createNewTab();
imageBtn.onclick = generateImage;
renderTabs();
renderChat();

// ------------------
// Matrix rain effect
// ------------------
const canvas = document.getElementById("matrixCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const letters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const fontSize = 16;
const columns = Math.floor(canvas.width / fontSize);
const drops = Array(columns).fill(1);

function drawMatrix() {
  ctx.fillStyle = "rgba(0,0,0,0.05)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#00ff00";
  ctx.font = fontSize + "px monospace";
  for(let i=0;i<drops.length;i++){
    const text = letters[Math.floor(Math.random()*letters.length)];
    ctx.fillText(text, i*fontSize, drops[i]*fontSize);
    drops[i]++;
    if(drops[i]*fontSize > canvas.height || Math.random()>0.975) drops[i]=0;
  }
  requestAnimationFrame(drawMatrix);
}
drawMatrix();
