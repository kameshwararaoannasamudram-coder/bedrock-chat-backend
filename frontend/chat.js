const API = 'https://d60d2iioma.execute-api.us-east-1.amazonaws.com';
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
      'Authorization': 'Bearer ' + sessionStorage.getItem("accessToken")
    },
    body: JSON.stringify({ input: message })//, sessionId
  });
 // Check HTTP status first
    if (!response.ok) {
      // Try to parse JSON body for error details
      let errorDetails = '';
      try {
        const errorData = await response.json();
        errorDetails = JSON.stringify(errorData);
      } catch (_) {
        // If response is not JSON, just read text
        errorDetails = await response.text();
      }
      throw new Error(`HTTP ${response.status} - ${response.statusText}: ${errorDetails}`);
    }
  const data = await response.json();
  addMessage('assistant', data.response);
  } catch (err) {
    // Detailed error logging
    if (err instanceof TypeError) {
      // Usually network error or CORS
      addMessage("Network / CORS error:", err.message);
    } else {
      addMessage("API error:", err.message);
    }
    addMessage("assistant",  "⚠️ Error talking to Bedrock - "+err);
   }
 }

function newSession() {
  sessionId = crypto.randomUUID();
  document.getElementById('messages').innerHTML = '';
}

function logout() {
  sessionStorage.clear();
  window.location.href = 'index.html';
}
// async function loadSessions() {
//   const res = await fetch(`${API}/sessions`, {
//     headers: {
//       Authorization: 'Bearer ' + sessionStorage.getItem('token')
//     }
//   });

//   const sessions = await res.json();
//   const container = document.querySelector('.chat-history');
//   container.innerHTML = '';

//   sessions.forEach(s => {
//     const div = document.createElement('div');
//     div.className = 'session-item';
//     div.innerText = s.title || 'New chat';
//     div.onclick = () => loadMessages(s.sessionId);
//     container.appendChild(div);
//   });
// }
// async function loadMessages(sessionId) {
//   currentSessionId = sessionId;
//   document.getElementById('messages').innerHTML = '';

//   const res = await fetch(`${API}/messages?sessionId=${sessionId}`, {
//     headers: {
//       Authorization: 'Bearer ' + sessionStorage.getItem('token')
//     }
//   });

//   const messages = await res.json();
//   messages.forEach(m => addMessage(m.role, m.message));
// }
window.onload = () => {
  newSession()
  // alert("token"+ sessionStorage.getItem("accessToken"));
  const token = sessionStorage.getItem("accessToken");
    if (!token) {
      alert("Please login first");
      window.location.href = "index.html";
}};

// const ONE_HOUR = 3600000;
// const loginTime = sessionStorage.getItem("loginTime");

// if (Date.now() - loginTime > ONE_HOUR) {
//   sessionStorage.clear();
//   window.location.href = "/";
// }

