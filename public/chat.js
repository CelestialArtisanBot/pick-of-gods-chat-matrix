// chat.js
document.addEventListener("DOMContentLoaded", () => {
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");
  const chatMessages = document.getElementById("chatMessages");
  const imgToggleBtn = document.getElementById("imgToggleBtn");

  let generateImage = false;

  // Toggle image generation
  imgToggleBtn.addEventListener("click", () => {
    generateImage = !generateImage;
    imgToggleBtn.textContent = generateImage ? "🖼️ Stop Image" : "🎨 Generate Image";
  });

  // Append a message to the chat
  function appendMessage(role, content) {
    const msg = document.createElement("div");
    msg.className = `message ${role}`;
    msg.textContent = content;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Handle chat form submission
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
        body: JSON.stringify({
          messages: [{ role: "user", content: message }],
          generateImage,
        }),
      });

      const data = await response.json();

      if (data?.messages?.length) {
        data.messages.forEach((msg) => appendMessage(msg.role, msg.content));
      } else {
        appendMessage("ai", "No response from AI.");
      }
    } catch (err) {
      console.error(err);
      appendMessage("ai", "Error connecting to server.");
    } finally {
      chatInput.disabled = false;
      chatInput.focus();
    }
  });
});
