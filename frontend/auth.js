// document.getElementById("loginBtn").addEventListener("click", login);

async function login() {
  
  const username = document.getElementById("email").value.trim();
  const password = document.getElementById("passwordInput").value.trim();
  // alert(' am here..')
  // const errorEl = document.getElementById("error");


  // errorEl.textContent = "";

  if (!username || !password) {
   alert("Username and password are required");
    return;
  }

  try {
    
 const response = await fetch("https://76d6d8gk3c.execute-api.us-east-1.amazonaws.com/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      // ✅ username & password passed directly in body
      body: JSON.stringify({
        username: username,
        password: password
      })
    });
  
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    // ✅ Store token securely for session
    sessionStorage.setItem("accessToken", data.accessToken);
alert(data.accessToken)
    // ✅ Redirect to chat
    window.location.href = 'chat.html';

  } catch (err) {
    alert(err.message);
  }
}

function togglePassword() {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleBtn.textContent = "Hide";
  } else {
    passwordInput.type = "password";
    toggleBtn.textContent = "Show";
  }
}

function resetPassword()
{
  window.location.href = 'forgot-password.html';
}