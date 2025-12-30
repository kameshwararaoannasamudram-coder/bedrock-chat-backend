import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import jwt from "jsonwebtoken";


const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));


export const handler = async (event) => {
const token = event.headers.Authorization.replace("Bearer ", "");
const decoded = jwt.decode(token);


const data = await ddb.send(new QueryCommand({
TableName: "ChatSessions",
KeyConditionExpression: "userId = :u",
ExpressionAttributeValues: { ":u": decoded.sub }
}));


return { statusCode: 200, body: JSON.stringify(data.Items) };
};