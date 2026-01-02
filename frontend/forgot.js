document.getElementById("sendCodeBtn").addEventListener("click", async () => {
  const username = document.getElementById("username").value;
  const msg = document.getElementById("msg");

  try {
    const res = await fetch("https://mt3kl7xni7.execute-api.us-east-1.amazonaws.com/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.details);

    msg.textContent = "Verification code sent. Check email/SMS.";

  } catch (err) {
    msg.textContent = err.message;
  }
});
