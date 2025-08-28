const messagesEl = document.getElementById("messages");
const inputEl = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");

function appendMessage(text, sender = "user") {
  const bubble = document.createElement("div");
  bubble.className = sender === "user" ? "bubble user" : "bubble bot";
  bubble.innerText = text;
  messagesEl.appendChild(bubble);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;
  appendMessage(text, "user");
  inputEl.value = "";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    const data = await res.json();
    appendMessage(data.reply, "bot");
  } catch (err) {
    appendMessage("⚠️ Error: " + err.message, "bot");
  }
}

sendBtn.addEventListener("click", sendMessage);
inputEl.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
