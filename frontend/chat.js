/* ================= CONFIG ================= */
const API = 'https://bitwvihdc8.execute-api.us-east-1.amazonaws.com';
let currentSessionId = null;
let isFirstMessage = true;

/* ================= UTILS ================= */
function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/* ================= UI HELPERS ================= */
function addMessage(role, text) {
  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.innerText = text;
  document.getElementById('messages').appendChild(div);
  div.scrollIntoView({ behavior: 'smooth' });
}

/* ================= CHAT ================= */
async function sendMessage() {
  const input = document.getElementById('prompt');
  const message = input.value.trim();
  if (!message) return;

  input.value = '';
  addMessage('user', message);

  // Create session ONLY on first message
  if (!currentSessionId) {
    currentSessionId = uuidv4();
    isFirstMessage = true;
  }

  try {
    const res = await fetch(`${API}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': sessionStorage.getItem('idToken')
      },
      body: JSON.stringify({
        prompt: message,
        sessionId: currentSessionId,
        isFirstMessage: isFirstMessage   // backend uses this to set title
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText);
    }

    const data = await res.json();
    addMessage('assistant', data.response);

    isFirstMessage = false;
    loadSessions(); // refresh sidebar title after first message

  } catch (err) {
    addMessage('assistant', '⚠️ Error talking to Bedrock');
    console.error(err);
  }
}

/* ================= NEW CHAT ================= */
function newSession() {
  currentSessionId = null;
  isFirstMessage = true;
  document.getElementById('messages').innerHTML = '';
}

/* ================= LOGOUT ================= */
function logout() {
  sessionStorage.clear();
  window.location.href = 'index.html';
}

/* ================= SIDEBAR ================= */
async function loadSessions() {
  const res = await fetch(`${API}/sessions`, {
    headers: {
      Authorization: sessionStorage.getItem('idToken')
    }
  });

  const sessions = await res.json();
  const ul = document.getElementById("sessions");
  ul.innerHTML = "";

  sessions.forEach(s => {
    const li = document.createElement("li");
    li.textContent = s.title || "New chat";
    li.style.cursor = "pointer";
    li.onclick = () => loadMessages(s.sessionId);
    ul.appendChild(li);
  });
}

/* ================= LOAD CHAT ================= */
async function loadMessages(sessionId) {
  currentSessionId = sessionId;
  
  isFirstMessage = false;
  document.getElementById('messages').innerHTML = '';
try {
  const res = await fetch(`${API}/messages?sessionId=${sessionId}`, {
    headers: {
      Authorization: sessionStorage.getItem('idToken')
    }
  });
  if (!res.ok) {
      throw new Error("Failed to load messages");
    }
    alert(res)
  const messages = await res.json();
  messages.forEach(m => addMessage(m.role, m.message));
} catch (err) {
    addMessage("assistant", "⚠️ Failed to load session history");
    console.error(err);
  }
}

/* ================= INIT ================= */
window.onload = () => {
  const token = sessionStorage.getItem("accessToken");
  const username = sessionStorage.getItem("username");

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("welcomeUser").innerText = `👤 ${username}`;
  loadSessions();
};
