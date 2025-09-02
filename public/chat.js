const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");
const imgToggleBtn = document.getElementById("imgToggleBtn");

let generateImage = false;

// Toggle image generation
imgToggleBtn.addEventListener("click", () => {
  generateImage = !generateImage;
  imgToggleBtn.textContent = generateImage ? "Image: ON" : "Image: OFF";
});

// Append messages to chat
function appendMessage(role, content) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${role}`;
  if (role === "ai" && generateImage && content.imageUrl) {
    const img = document.createElement("img");
    img.src = content.imageUrl;
    img.alt = "Generated Image";
    img.className = "ai-image";
    msgDiv.appendChild(img);
    if (content.text) {
      const text = document.createElement("p");
      text.textContent = content.text;
      msgDiv.appendChild(text);
    }
  } else {
    msgDiv.textContent = content.text || content;
  }
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send message
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userMessage = chatInput.value.trim();
  if (!userMessage) return;

  appendMessage("user", userMessage);
  chatInput.value = "";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        messages: [{ role: "user", content: userMessage }], 
        generateImage 
      }),
    });
    const data = await res.json();
    appendMessage("ai", data.messages[0].content);
  } catch (err) {
    console.error(err);
    appendMessage("ai", "Error generating response");
  }
});
