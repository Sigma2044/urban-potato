const chatBox = document.getElementById("chat-box");
const input = document.getElementById("msg");
const imageInput = document.getElementById("imageInput");

// Deine Render Backend URL
const API_BASE = "https://eduai.5b85.onrender.com";

/* -------------------------
   SENDEN
-------------------------- */
async function sendMessage() {
  const msg = input.value.trim();
  if (!msg) return;

  addMessage("user", msg);
  input.value = "";

  sendText(msg);
}

/* -------------------------
   CHAT
-------------------------- */
async function sendText(msg) {
  const loading = addLoading();

  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg })
    });

    const data = await res.json();
    removeLoading(loading);
    addMessage("assistant", data.reply);

  } catch {
    removeLoading(loading);
    addMessage("assistant", "❌ Fehler beim Chat‑Request.");
  }
}

/* -------------------------
   AUTO-VISION
-------------------------- */
imageInput.addEventListener("change", async () => {
  const file = imageInput.files[0];
  if (!file) return;

  addMessage("user", "📷 Bild ausgewählt – analysiere…");

  const loading = addLoading();

  try {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`${API_BASE}/vision`, {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    removeLoading(loading);
    addMessage("assistant", data.reply);

  } catch {
    removeLoading(loading);
    addMessage("assistant", "❌ Fehler bei der Bildanalyse.");
  }
});

/* -------------------------
   UI FUNKTIONEN
-------------------------- */
function addMessage(role, text) {
  const msg = document.createElement("div");
  msg.className = `message ${role}`;
  msg.innerHTML = `<div class="bubble">${escapeHTML(text)}</div>`;
  chatBox.appendChild(msg);
  scrollDown();
}

function addLoading() {
  const id = "load-" + Math.random().toString(36).substring(2, 9);
  const msg = document.createElement("div");
  msg.className = "message assistant";
  msg.id = id;
  msg.innerHTML = `
    <div class="bubble loading">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>`;
  chatBox.appendChild(msg);
  scrollDown();
  return id;
}

function removeLoading(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function scrollDown() {
  chatBox.scrollTop = chatBox.scrollHeight;
}

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[m]));
}
