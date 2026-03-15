async function sendMessage() {
  const msg = document.getElementById("msg").value;
  if (!msg) return;

  const chatBox = document.getElementById("chat-box");

  chatBox.innerHTML += `<p class="user">Du: ${msg}</p>`;

  const res = await fetch("https://DEIN-RENDER-URL.onrender.com/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: msg })
  });

  const data = await res.json();

  chatBox.innerHTML += `<p class="bot">Bot: ${data.reply}</p>`;
  chatBox.scrollTop = chatBox.scrollHeight;

  document.getElementById("msg").value = "";
}
