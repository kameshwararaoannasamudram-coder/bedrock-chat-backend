import {
  BedrockRuntimeClient,
  InvokeModelCommand
} from "@aws-sdk/client-bedrock-runtime";

import {
  BedrockAgentRuntimeClient,
  RetrieveCommand
} from "@aws-sdk/client-bedrock-agent-runtime";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand
} from "@aws-sdk/lib-dynamodb";

const bedrock = new BedrockRuntimeClient({ region: process.env.AWS_REGION });
const agent = new BedrockAgentRuntimeClient({ region: process.env.AWS_REGION });

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (event) => {
  try {
    // 1️⃣ Authenticated user (from API Gateway JWT authorizer)
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub;

    const body = JSON.parse(event.body);
    const { message, sessionId } = body;

    // 2️⃣ Retrieve context from Knowledge Base
    const kbResponse = await agent.send(new RetrieveCommand({
      knowledgeBaseId: process.env.KB_ID,
      retrievalQuery: { text: message },
      retrievalConfiguration: {
        vectorSearchConfiguration: { numberOfResults: 5 }
      }
    }));

    const context = kbResponse.retrievalResults
      .map(r => r.content.text)
      .join("\n\n");

    // 3️⃣ Construct prompt
    const prompt = `
You are an assistant answering based ONLY on the following knowledge base.

Knowledge Base Context:
${context}

User Question:
${message}
`;

    // 4️⃣ Invoke Bedrock model
    const modelResponse = await bedrock.send(new InvokeModelCommand({
      modelId: process.env.MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 500,
        messages: [
          { role: "user", content: [{ type: "text", text: prompt }] }
        ]
      })
    }));

    const responseBody = JSON.parse(
      Buffer.from(modelResponse.body).toString("utf-8")
    );

    const reply = responseBody.content[0].text;

    // 5️⃣ Store messages in DynamoDB
    const timestamp = new Date().toISOString();

    await ddb.send(new PutCommand({
      TableName: process.env.MESSAGES_TABLE,
      Item: {
        sessionId,
        timestamp: timestamp + "-user",
        role: "user",
        message
      }
    }));

    await ddb.send(new PutCommand({
      TableName: process.env.MESSAGES_TABLE,
      Item: {
        sessionId,
        timestamp: timestamp + "-assistant",
        role: "assistant",
        message: reply
      }
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };

  } catch (err) {
    console.error("ERROR:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Bedrock chat failed" })
    };
  }
};
