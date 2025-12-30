Below is a **production-ready `README.md`** you can drop directly into your repository.
It documents **architecture, AWS setup, environment variables, deployment, and troubleshooting** based on everything we built above.

---

```md
# AWS Bedrock ChatGPT-Style Web Portal (Matrix Theme)

A full-stack AI chat web portal built on **AWS**, using **Node.js**, **Amazon Bedrock**, **Cognito authentication**, **DynamoDB session persistence**, and a **ChatGPT-style UI** with a **Matrix animated background**.

---

## ✨ Features

- 🔐 Secure login using **Amazon Cognito**
- 💬 ChatGPT-style chat interface
- 🧠 Amazon Bedrock integration (Claude / Titan / KB)
- 💾 Persistent chat history per user
- 🕒 Auto logout after 1 hour
- 🎨 Blue Matrix animated background
- ☁️ Fully serverless (Lambda, API Gateway, DynamoDB)
- 🌍 Static frontend hosted on S3 + CloudFront

---

## 🏗️ Architecture

```

Browser (HTML/CSS/JS)
|
|  HTTPS + JWT
v
CloudFront → S3 (static site)
|
v
API Gateway (HTTP API + JWT Authorizer)
|
v
AWS Lambda (Node.js)
|
+── Amazon Bedrock
|
+── DynamoDB

```

---

## 📁 Repository Structure

```

frontend/
├── index.html        # Login page
├── chat.html         # ChatGPT-style UI
├── styles.css        # Shared styles + Matrix theme
├── matrix.js         # Matrix background animation
├── auth.js           # Cognito login logic
├── chat.js           # Chat logic & history loading

backend/
├── chatHandler.js    # Chat + Bedrock invocation
├── getSessions.js    # Load chat sessions
├── getMessages.js    # Load chat messages

```

---

## 🔐 Authentication (Amazon Cognito)

- User Pool with:
  - Username / Email login
  - `USER_PASSWORD_AUTH` enabled
  - No client secret
- JWT used to authenticate all API calls
- Token stored in browser `sessionStorage`

---

## 🧠 Data Model (DynamoDB)

### Table: `ChatSessions`

| Attribute | Type | Key |
|---------|------|-----|
| userId | String | Partition Key |
| sessionId | String | Sort Key |
| title | String | — |
| createdAt | String | — |

---

### Table: `ChatMessages`

| Attribute | Type | Key |
|---------|------|-----|
| sessionId | String | Partition Key |
| timestamp | String | Sort Key |
| role | String | — |
| message | String | — |

---

## 🌐 API Gateway Routes

| Route | Method | Lambda |
|-----|------|-------|
| `/chat` | POST | `chatHandler` |
| `/sessions` | GET | `getSessions` |
| `/messages` | GET | `getMessages` |

### 🔐 JWT Authorizer (Required)

- Issuer:
```

[https://cognito-idp](https://cognito-idp).<REGION>.amazonaws.com/<USER_POOL_ID>

```
- Audience:
```

<COGNITO_APP_CLIENT_ID>

````

---

## ⚙️ Lambda Environment Variables

Set these in **AWS Lambda → Configuration → Environment variables**

### Required

| Variable | Example |
|--------|---------|
| `SESSIONS_TABLE` | `ChatSessions` |
| `MESSAGES_TABLE` | `ChatMessages` |
| `AWS_REGION` | `us-east-1` |

### Optional (Bedrock)

| Variable | Example |
|--------|---------|
| `MODEL_ID` | `anthropic.claude-3-sonnet-20240229-v1:0` |
| `KB_ID` | `your-knowledge-base-id` |

---

## 🔧 IAM Permissions (Lambda Role)

```json
{
"Effect": "Allow",
"Action": [
  "dynamodb:PutItem",
  "dynamodb:Query",
  "bedrock:InvokeModel",
  "bedrock:Retrieve"
],
"Resource": "*"
}
````

---

## 🖥️ Frontend Configuration

### API Endpoint (Required)

In `chat.js`:

```js
const API = "https://<api-id>.execute-api.<region>.amazonaws.com";
```

> ⚠️ Do NOT add `/prod` when using HTTP APIs.

---

### Session Storage (Browser)

```js
sessionStorage.setItem("token", idToken);
sessionStorage.setItem("loginTime", Date.now());
```

### Auto Logout (1 Hour)

```js
if (Date.now() - loginTime > 3600000) {
  sessionStorage.clear();
  window.location.href = "/";
}
```

---

## 🎨 UI Notes

* Matrix animation runs on a fullscreen `<canvas>`
* Chat UI floats above using `z-index`
* Layout mimics ChatGPT:

  * Left sidebar: chat history
  * Main panel: messages + input
* Login page centered independently (no `body { display:flex }`)

---

## 🚀 Deployment Steps

### 1️⃣ Backend

1. Create DynamoDB tables
2. Deploy Lambda functions
3. Set environment variables
4. Create API Gateway (HTTP API)
5. Attach JWT authorizer

### 2️⃣ Frontend

1. Upload frontend files to S3
2. Enable static website hosting
3. Create CloudFront distribution
4. Access via CloudFront URL

---

## 🧪 Testing Checklist

* [ ] Login succeeds
* [ ] JWT token stored in sessionStorage
* [ ] `/sessions` returns 200
* [ ] `/messages` returns 200
* [ ] New chat persists after refresh
* [ ] User sees only their own chats
* [ ] Auto logout after 1 hour

---

## 🧯 Common Issues

| Issue              | Cause                  | Fix                |
| ------------------ | ---------------------- | ------------------ |
| 401 Unauthorized   | Missing JWT authorizer | Attach authorizer  |
| Empty chat history | Wrong userId           | Use `claims.sub`   |
| Matrix covers UI   | z-index missing        | Canvas z-index = 0 |
| CSS breaks login   | `body` flex            | Use container div  |
| Table not found    | Wrong region           | Align regions      |

---

## 📈 Optional Enhancements

* Streaming responses (WebSocket API)
* Chat renaming / deletion
* Markdown rendering
* Typing indicator
* CDK / Terraform deployment
* Mobile responsive UI

---

## 📄 License

MIT License

---

## 🙌 Author

Built with AWS Serverless + Bedrock
Inspired by ChatGPT UI with a Matrix cyber theme

```

---

If you want next, I can:
- Generate **CDK / Terraform**
- Add **streaming responses**
- Provide **Postman test collections**
- Create **deployment diagrams**

Just tell me 🚀
```
