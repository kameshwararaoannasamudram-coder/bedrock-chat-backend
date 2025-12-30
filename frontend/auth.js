async function login() {
// Use Amazon Cognito Hosted UI or AWS Amplify Auth here
// On success store JWT in sessionStorage
sessionStorage.setItem('token', 'COGNITO_JWT');
window.location.href = '/chat.html';
setTimeout(() => {
sessionStorage.clear();
window.location.href = '/';
}, 3600000);
}

function togglePassword() {
  const pwd = document.getElementById('password');
  pwd.type = pwd.type === 'password' ? 'text' : 'password';
}

function resetPassword() {
  alert('Trigger Cognito Forgot Password flow here');
}
