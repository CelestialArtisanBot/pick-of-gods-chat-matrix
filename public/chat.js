<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pick of Gods Chat Matrix</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="chatContainer" class="chat-container">
    <div id="chatMessages" class="chat-messages" aria-live="polite"></div>

    <form id="chatForm" class="chat-form" autocomplete="off">
      <input 
        type="text" 
        id="chatInput" 
        class="chat-input" 
        placeholder="Type your message..." 
        aria-label="Message input"
        required 
      />
      <button type="submit" id="sendBtn" class="chat-btn">Send</button>
      <button type="button" id="imgToggleBtn" class="chat-btn secondary">
        Generate Image
      </button>
    </form>
  </div>

  <script src="chat.js"></script>
</body>
</html>
