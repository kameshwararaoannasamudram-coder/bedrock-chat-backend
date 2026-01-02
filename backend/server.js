import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const COGNITO_DOMAIN = "us-east-1izlmrmzqz";
const CLIENT_ID = "79b4srl7ki07bvdvdnms12ebl6";
const CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET;
const REGION = "us-east-1";
const REDIRECT_URI = "https://d84l1y8p4kdic.cloudfront.net/login.html";

app.post("/auth/token", async (req, res) => {
  const { code } = req.body;

  const tokenUrl =
    `https://${COGNITO_DOMAIN}.auth.${REGION}.amazoncognito.com/oauth2/token`;

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: CLIENT_ID,
    code,
    redirect_uri: REDIRECT_URI
  });

  const authHeader = Buffer
    .from(`${CLIENT_ID}:${CLIENT_SECRET}`)
    .toString("base64");

  const tokenRes = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${authHeader}`
    },
    body
  });

  const data = await tokenRes.json();
  res.json(data);
});

app.listen(3000, () => {
  console.log("Auth backend running on port 3000");
});
