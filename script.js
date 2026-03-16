const chatBox = document.getElementById("chat-box");
const input = document.getElementById("msg");
const imageInput = document.getElementById("imageInput");

// HIER DEINE RENDER URL EINTRAGEN
const API_BASE = "https://eduai-5b85.onrender.com";

let mode = "chat"; // chat | generate

function setMode(newMode) {
  mode = newMode;
  addMessage("assistant", 
    newMode === "chat"
      ? "Modus: Chat aktiviert."
      : "Modus: Bildgenerierung aktiviert."
  );
}

/* -------------------------
   SENDEN
-------------------------- */
async function sendMessage() {
  const msg = input.value.trim();
  if (!msg) return;

  addMessage("user", msg);
  input.value = "";

  if (mode === "chat") sendText(msg);
  if (mode === "generate") generateImage(msg);
}

/* -------------------------
   CHAT (mistral-small)
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
    addMessage("assistant", "Fehler beim Chat‑Request.");
  }
}

/* -------------------------
   AUTO-VISION (Pixtral Vision)
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
    addMessage("assistant", "Fehler bei der Bildanalyse.");
  }
});

/* -------------------------
   BILDGENERIERUNG (Pixtral Image)
-------------------------- */
async function generateImage(prompt) {
  const loading = addLoading();

  try {
    const res = await fetch(`${API_BASE}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();
    removeLoading(loading);

    addMessage("assistant", "🖼️ Bild generiert:");

    const img = document.createElement("img");
    img.src = data.url;
    img.className = "generated-img fade-in";
    chatBox.appendChild(img);

    scrollDown();
  } catch {
    removeLoading(loading);
    addMessage("assistant", "Fehler bei der Bildgenerierung.");
  }
}

/* -------------------------
   UI FUNKTIONEN
-------------------------- */
function addMessage(role, text) {
  const msg = document.createElement("div");
  msg.className = `message ${role} fade-in`;
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
