const chatEl = document.getElementById('chat');
const inputEl = document.getElementById('input');
const sendBtn = document.getElementById('send');
const tabsEl = document.getElementById('tabs');
const newTabBtn = document.getElementById('newTab');

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
  alert('Copied message!');
}

async function sendMessage() {
  const content = inputEl.value.trim();
  if (!content) return;
  addMessage('user', content);
  inputEl.value = '';

  const response = await fetch('/api/chat', {
    method:'POST',
    headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify({ messages: chatMemory[activeTab] })
  });
  const data = await response.json();
  if (data.success && data.messages) {
    data.messages.slice(chatMemory[activeTab].length).forEach(msg => addMessage(msg.role, msg.content));
  } else {
    addMessage('assistant', 'Error: ' + (data.error || 'Unknown'));
  }
}

function addMessage(role, content) {
  chatMemory[activeTab].push({ role, content, timestamp: new Date().toISOString() });
  localStorage.setItem('chatMemory', JSON.stringify(chatMemory));
  renderChat();
}

sendBtn.onclick = sendMessage;
inputEl.addEventListener('keydown', e => { if(e.key==='Enter') sendMessage(); });
newTabBtn.onclick = () => createNewTab();
renderTabs();
renderChat();
