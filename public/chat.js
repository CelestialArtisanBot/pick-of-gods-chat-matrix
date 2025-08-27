
const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const typingIndicator = document.getElementById("typing-indicator");

let chatHistory = [{ role: "assistant", content: "Hello! I'm Mark Anthony's AI. How can I assist you today?" }];
let isProcessing = false;

userInput.addEventListener("input", function() {
  this.style.height = "auto";
  this.style.height = this.scrollHeight + "px";
});

userInput.addEventListener("keydown", function(e) {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});
sendButton.addEventListener("click", sendMessage);

async function sendMessage() {
  const msg = userInput.value.trim();
  if (!msg || isProcessing) return;

  isProcessing = true;
  userInput.disabled = true;
  sendButton.disabled = true;

  addMessage("user", msg);
  chatHistory.push({ role: "user", content: msg });
  userInput.value = "";
  userInput.style.height = "auto";
  typingIndicator.classList.add("visible");

  try {
    const assistantEl = document.createElement("div");
    assistantEl.className = "message assistant-message";
    assistantEl.innerHTML = "<p></p><span class='cursor'>█</span>";
    chatMessages.appendChild(assistantEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: chatHistory })
    });

    if (!response.ok) throw new Error("Failed to get response");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let responseText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        try {
          const jsonData = JSON.parse(line);
          if (jsonData.response) {
            await appendNeonText(assistantEl.querySelector("p"), jsonData.response);
            responseText += jsonData.response;
            chatMessages.scrollTop = chatMessages.scrollHeight;
          }
        } catch (e) { console.error(e); }
      }
    }

    chatHistory.push({ role: "assistant", content: responseText });
  } catch (err) {
    console.error(err);
    addMessage("assistant", "Oops! Something went wrong.");
  } finally {
    typingIndicator.classList.remove("visible");
    isProcessing = false;
    userInput.disabled = false;
    sendButton.disabled = false;
    userInput.focus();
  }
}

function addMessage(role, content) {
  const el = document.createElement("div");
  el.className = `message ${role}-message`;
  el.innerHTML = `<p>${content}</p>`;
  chatMessages.appendChild(el);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function appendNeonText(container, text) {
  for (const char of text) {
    container.innerHTML += `<span class="neon-char">${char}</span>`;
    chatMessages.scrollTop = chatMessages.scrollHeight;
    await delay(20);
  }
}

function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
