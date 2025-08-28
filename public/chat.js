// --- Matrix Rain ---
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const cols = Math.floor(canvas.width / 20);
const ypos = Array(cols).fill(0);

function matrixLoop() {
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#00ff00';
  ctx.font = '20px monospace';
  ypos.forEach((y, index) => {
    const text = String.fromCharCode(33 + Math.random() * 94);
    ctx.fillText(text, index * 20, y);
    ypos[index] = y > canvas.height + Math.random() * 10000 ? 0 : y + 20;
  });
}
setInterval(matrixLoop, 50);

// --- Chat Frontend ---
const chatContainer = document.getElementById('chat-container');
const inputForm = document.getElementById('input-form');
const messageInput = document.getElementById('message-input');

const addBubble = (text, role) => {
  const bubble = document.createElement('div');
  bubble.className = 'bubble ' + role;
  bubble.textContent = text;
  chatContainer.appendChild(bubble);
  chatContainer.scrollTop = chatContainer.scrollHeight;
};

// --- Streaming AI Response ---
async function sendMessage(message) {
  addBubble(message, 'user');

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: message }], stream: false })
  });

  const data = await res.json();
  if (!data.success) return addBubble("AI error: " + data.error, 'assistant');

  const aiMessage = data.messages[data.messages.length - 1]?.content || '...';
  addBubble(aiMessage, 'assistant');
}

// --- Form Submit ---
inputForm.addEventListener('submit', e => {
  e.preventDefault();
  const msg = messageInput.value.trim();
  if (!msg) return;
  messageInput.value = '';
  sendMessage(msg);
});

// --- Optional Floating Bubbles for Matrix AI feel ---
function floatingBubbleEffect() {
  const bubble = document.createElement('div');
  bubble.textContent = String.fromCharCode(33 + Math.floor(Math.random() * 94));
  bubble.style.position = 'absolute';
  bubble.style.left = Math.random() * window.innerWidth + 'px';
  bubble.style.top = window.innerHeight + 'px';
  bubble.style.color = '#00ff00';
  bubble.style.fontSize = 16 + Math.random() * 12 + 'px';
  bubble.style.opacity = Math.random();
  document.body.appendChild(bubble);

  let top = window.innerHeight;
  const interval = setInterval(() => {
    top -= 2 + Math.random() * 2;
    bubble.style.top = top + 'px';
    if (top < -50) {
      clearInterval(interval);
      bubble.remove();
    }
  }, 50);
}
setInterval(floatingBubbleEffect, 300);
