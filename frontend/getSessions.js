import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import jwt from "jsonwebtoken";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (event) => {
  const token = event.headers.Authorization.replace("Bearer ", "");
  const user = jwt.decode(token);

  const result = await ddb.send(new QueryCommand({
    TableName: "process.env.SESSIONS_TABLE",
    KeyConditionExpression: "userId = :u",
    ExpressionAttributeValues: {
      ":u": user.sub
    },
    ScanIndexForward: false
  }));

  return {
    statusCode: 200,
    body: JSON.stringify(result.Items || [])
  };
};
