import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import jwt from "jsonwebtoken";


const bedrock = new BedrockRuntimeClient({ region: process.env.AWS_REGION });
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));


export const handler = async (event) => {
try {
const token = event.headers.Authorization.replace("Bearer ", "");
const decoded = jwt.decode(token);
const userId = decoded.sub;


const body = JSON.parse(event.body);
const { message, sessionId } = body;


await ddb.send(new PutCommand({
TableName: "ChatMessages",
Item: {
sessionId,
timestamp: new Date().toISOString(),
role: "user",
message
}
}));


const command = new InvokeModelCommand({
modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
contentType: "application/json",
accept: "application/json",
body: JSON.stringify({
messages: [{ role: "user", content: message }],
max_tokens: 500
})
});


const response = await bedrock.send(command);
const responseBody = JSON.parse(new TextDecoder().decode(response.body));
const aiMessage = responseBody.content[0].text;


await ddb.send(new PutCommand({
TableName: "ChatMessages",
Item: {
sessionId,
timestamp: new Date().toISOString(),
role: "assistant",
message: aiMessage
}
}));


return {
statusCode: 200,
body: JSON.stringify({ reply: aiMessage })
};


} catch (err) {
console.error(err);
return { statusCode: 500, body: "Error processing chat" };
}
};