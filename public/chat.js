const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const typingIndicator = document.getElementById("typing-indicator");

const authEmail = document.getElementById("auth-email");
const authPassword = document.getElementById("auth-password");
const authLogin = document.getElementById("auth-login");

const workerCode = document.getElementById("worker-code");
const deployButton = document.getElementById("deploy-worker");

let chatHistory = [{ role: "assistant", content: "Hello! I'm Pick of Gods AI. How can I assist you today?" }];
let sessionToken = null;
let isProcessing = false;

// --- Authentication ---
authLogin.addEventListener("click", async () => {
  const email = authEmail.value.trim();
  const password = authPassword.value.trim();
  if(!email || !password) return alert("Enter credentials");

  try {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if(data.success) {
      sessionToken = data.session?.sessionId;
      alert("Login successful!");
    } else {
      alert("Login failed: "+(data.error||"Unknown"));
    }
  } catch(e) { console.error(e); alert("Login error"); }
});

// --- Chat functionality ---
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
  if(!msg || isProcessing) return;

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
    chatMessages.appendChild(assistant
