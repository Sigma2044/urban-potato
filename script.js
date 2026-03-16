const chatBox = document.getElementById("chat-box");
const input = document.getElementById("msg");
const imageInput = document.getElementById("imageInput");

let mode = "chat"; // chat | vision | generate

function setMode(newMode) {
  mode = newMode;
  addMessage("assistant", `Modus gewechselt zu: ${newMode === "chat" ? "Chat" : newMode === "vision" ? "Bildanalyse" : "Bildgenerierung"}`);
}

async function sendMessage() {
  const msg = input.value.trim();

  if (mode === "chat") {
    if (!msg) return;
    addMessage("user", msg);
    input.value = "";
    await sendText(msg);
  }

  if (mode === "vision") {
    await analyzeImage();
  }

  if (mode === "generate") {
    if (!msg) return;
    addMessage("user", msg);
    input.value = "";
    await generateImage(msg);
  }
}

/* --- normaler Chat: mistral-small --- */
async function sendText(msg) {
  const loading = addLoading();

  try {
    const res = await fetch("http://eduai-sos2.onrender.com/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg })
    });

    const data = await res.json();
    removeLoading(loading);
    addMessage("assistant", data.reply);
  } catch (e) {
    removeLoading(loading);
    addMessage("assistant", "Fehler beim Chat‑Request.");
  }
}

/* --- Vision: Pixtral Vision --- */
async function analyzeImage() {
  const file = imageInput.files[0];
  if (!file) {
    addMessage("assistant", "Bitte zuerst ein Bild auswählen.");
    return;
  }

  addMessage("user", "📷 Bild hochgeladen");
  const loading = addLoading();

  try {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("http://eduai-sos2.onrender.com/vision", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    removeLoading(loading);
    addMessage("assistant", data.reply);
  } catch (e) {
    removeLoading(loading);
    addMessage("assistant", "Fehler bei der Bildanalyse.");
  }
}

/* --- Bildgenerierung: Pixtral Image --- */
async function generateImage(prompt) {
  const loading = addLoading();

  try {
    const res = await fetch("http://eduai-sos2.onrender.com/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();
    removeLoading(loading);

    addMessage("assistant", "🖼️ Bild generiert:");

    const img = document.createElement("img");
    img.src = data.url;
    img.className = "generated-img";
    chatBox.appendChild(img);
    scrollDown();
  } catch (e) {
    removeLoading(loading);
    addMessage("assistant", "Fehler bei der Bildgenerierung.");
  }
}

/* --- UI Helfer --- */
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
