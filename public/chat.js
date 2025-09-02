// chat.js

const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");
const imgToggleBtn = document.getElementById("imgToggleBtn");

let generateImage = false;

// Toggle image generation
imgToggleBtn.addEventListener("click", () => {
  generateImage = !generateImage;
  imgToggleBtn.style.backgroundColor = generateImage ? "#0d6efd" : "#6c757d";
});

// Add message to chat
function appendMessage(role, content, isImage = false) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message", role);

  if (isImage) {
    const img = document.createElement("img");
    img.src = content;
    img.alt = "Generated Image";
    img.style.maxWidth = "100%";
    img.style.borderRadius = "12px";
    msgDiv.appendChild(img);
  } else {
    msgDiv.textContent = content;
  }

  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Handle form submit
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;

  appendMessage("user", message);
  chatInput.value = "";
  chatInput.disabled = true;

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: message }], generateImage }),
    });

    const data = await response.json();
    const aiMsg = data.messages?.[0]?.content;

    // Check if AI returned an image URL
    if (generateImage && aiMsg?.startsWith("http")) {
      appendMessage("ai", aiMsg, true);
    } else {
      appendMessage("ai", aiMsg || "No response from AI.");
    }
  } catch (err) {
    console.error(err);
    appendMessage("ai", "Error: Failed to get response.");
  } finally {
    chatInput.disabled = false;
    chatInput.focus();
  }
});
