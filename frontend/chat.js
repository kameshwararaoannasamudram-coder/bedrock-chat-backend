const API = 'https://d60d2iioma.execute-api.us-east-1.amazonaws.com/$default';
let sessionId = crypto.randomUUID();

function addMessage(role, text) {
  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.innerText = text;
  document.getElementById('messages').appendChild(div);
  div.scrollIntoView({ behavior: 'smooth' });
}

async function sendMessage() {
  const input = document.getElementById('prompt');
  const message = input.value.trim();
  if (!message) return;

  input.value = '';
  addMessage('user', message);
  try {
  const response = await fetch(`${API}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    },
    body: JSON.stringify({ message, sessionId })
  });

  const data = await response.json();
  addMessage('assistant', data.reply);
  } catch (err) {
    console.error(err);
    addMessage("assistant",  "⚠️ Error talking to Bedrock - "+err);
   }
 }

function newSession() {
  sessionId = crypto.randomUUID();
  document.getElementById('messages').innerHTML = '';
}

function logout() {
  sessionStorage.clear();
  window.location.href = '/';
}
async function loadSessions() {
  const res = await fetch(`${API}/sessions`, {
    headers: {
      Authorization: 'Bearer ' + sessionStorage.getItem('token')
    }
  });

  const sessions = await res.json();
  const container = document.querySelector('.chat-history');
  container.innerHTML = '';

  sessions.forEach(s => {
    const div = document.createElement('div');
    div.className = 'session-item';
    div.innerText = s.title || 'New chat';
    div.onclick = () => loadMessages(s.sessionId);
    container.appendChild(div);
  });
}
async function loadMessages(sessionId) {
  currentSessionId = sessionId;
  document.getElementById('messages').innerHTML = '';

  const res = await fetch(`${API}/messages?sessionId=${sessionId}`, {
    headers: {
      Authorization: 'Bearer ' + sessionStorage.getItem('token')
    }
  });

  const messages = await res.json();
  messages.forEach(m => addMessage(m.role, m.message));
}
window.onload = () => {
  newSession()
  alert("token"+ sessionStorage.getItem("token"));
  const token = sessionStorage.getItem("token");
  // if (!token) {
  //   window.location.href = "/";
  // }
  // loadSessions();
};

const ONE_HOUR = 3600000;
const loginTime = sessionStorage.getItem("loginTime");

if (Date.now() - loginTime > ONE_HOUR) {
  sessionStorage.clear();
  window.location.href = "/";
}