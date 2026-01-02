document.getElementById("resetBtn").addEventListener("click", async () => {
  const username = document.getElementById("username").value;
  const code = document.getElementById("code").value;
  const newPassword = document.getElementById("newPassword").value;
  const msg = document.getElementById("msg");

  try {
    const res = await fetch("https://bpkgvv1sdd.execute-api.us-east-1.amazonaws.com/confirm-forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, code, newPassword })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.details);

    msg.textContent = "Password reset successful. You can now login.";

  } catch (err) {
    msg.textContent = err.message;
  }
});
