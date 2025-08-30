// ---- Matrix rain effect ----
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const columns = Math.floor(canvas.width / 20);
const drops = Array(columns).fill(1);

function drawMatrix() {
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = '#0F0';
  ctx.font = '20px Courier';

  drops.forEach((y,i) => {
    const text = String.fromCharCode(33 + Math.random() * 94);
    ctx.fillText(text, i*20, y*20);
    drops[i] = y*20 > canvas.height && Math.random() > 0.975 ? 0 : y+1;
  });
  requestAnimationFrame(drawMatrix);
}
drawMatrix();
window.addEventListener('resize', ()=>{ canvas.width=window.innerWidth; canvas.height=window.innerHeight; });

// ---- Chat memory + tabs ----
const chatEl = document.getElementById('chat');
const inputEl = document.getElementById('input');
const sendBtn = document.getElementById('send');
const tabsEl = document.getElementById('tabs');
const newTabBtn = document.getElementById('newTab');
const refreshImagesBtn = document.getElementById('refreshImages');

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
    if(msg.role==='assistant' && msg.imageBase64){
      div.innerHTML = `<img class="generated" src="data:image/png;base64,${msg.imageBase64}">`;
    }
    div.innerHTML += `<pre>${msg.content || ''}</pre>`;
    div.onclick = () => navigator.clipboard.writeText(msg.content);
    chatEl.appendChild(div);
  });
  chatEl.scrollTop = chatEl.scrollHeight;
}

async function sendMessage() {
  const content = inputEl.value.trim();
  if (!content) return;
  addMessage('user', content);
  inputEl.value = '';

  // Chat API
  const chatResp = await fetch('/api/chat', {
    method:'POST',
    headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify({ messages: chatMemory[activeTab] })
  });
  const data = await chatResp.json();
  if(data.success && data.messages){
    data.messages.slice(chatMemory[activeTab].length).forEach(msg => addMessage(msg.role, msg.content));
    // Auto-generate image for last message
    generateImage(data.messages.slice(-1)[0].content);
  } else {
    addMessage('assistant','Error: '+(data.error||'Unknown'));
  }
}

function addMessage(role, content, imageBase64) {
  chatMemory[activeTab].push({ role, content, imageBase64, timestamp: new Date().toISOString() });
  localStorage.setItem('chatMemory', JSON.stringify(chatMemory));
  renderChat();
}

// ---- Image generation ----
async function generateImage(prompt) {
  const resp = await fetch('/api/image', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({prompt, width:1024, height:1024, steps:25})
  });
  const data = await resp.json();
  if(data.success && data.imageBase64){
    addMessage('assistant', '', data.imageBase64);
  }
}

// ---- Controls ----
sendBtn.onclick = sendMessage;
inputEl.addEventListener('keydown', e => { if(e.key==='Enter') sendMessage(); });
newTabBtn.onclick = () => createNewTab();
refreshImagesBtn.onclick = () => {
  const lastMsg = chatMemory[activeTab].slice(-1)[0];
  if(lastMsg) generateImage(lastMsg.content);
};

renderTabs();
renderChat();
