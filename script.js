const chatBox = document.getElementById("chat-box");
const input = document.getElementById("msg");
const sendBtn = document.getElementById("sendBtn");

// Nachricht senden
async function sendMessage() {
  const msg = input.value.trim();
  if (!msg) return;

  addMessage("user", msg);
  input.value = "";

  // Loading Bubble
  const loadingId = addLoadingBubble();

  try {
    const res = await fetch("https://eduai-sos2.onrender.com/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg })
    });

    const data = await res.json();

    removeLoadingBubble(loadingId);
    addMessage("assistant", data.reply);

  } catch (err) {
    removeLoadingBubble(loadingId);
    addMessage("assistant", "⚠️ Fehler: Server nicht erreichbar.");
  }

  scrollToBottom();
}

// Chat-Bubble hinzufügen
function addMessage(role, text) {
  const bubble = document.createElement("div");
  bubble.className = `message ${role}`;
  bubble.innerHTML = `<div class="bubble">${escapeHTML(text)}</div>`;
  chatBox.appendChild(bubble);
}

// Loading-Bubble
function addLoadingBubble() {
  const id = "load-" + Math.random().toString(36).substring(2, 9);

  const bubble = document.createElement("div");
  bubble.className = "message assistant";
  bubble.id = id;
  bubble.innerHTML = `
    <div class="bubble loading">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
  `;

  chatBox.appendChild(bubble);
  scrollToBottom();
  return id;
}

function removeLoadingBubble(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// Auto-Scroll
function scrollToBottom() {
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Enter-Taste senden
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

// HTML escapen (Sicherheit)
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[m]));
}
