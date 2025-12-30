import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (event) => {
  const { sessionId } = event.queryStringParameters;

  const result = await ddb.send(new QueryCommand({
    TableName: "ChatMessages",
    KeyConditionExpression: "sessionId = :s",
    ExpressionAttributeValues: {
      ":s": sessionId
    },
    ScanIndexForward: true
  }));

  return {
    statusCode: 200,
    body: JSON.stringify(result.Items || [])
  };
};
