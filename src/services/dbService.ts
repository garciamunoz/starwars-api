import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

const dynamoDbClient = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(dynamoDbClient, {
  marshallOptions: { removeUndefinedValues: true },
});

const starWarsTable = process.env.STAR_WARS_TABLE || "StarWarsTable";
const translateTable = process.env.TRANSLATE_TABLE || "TranslateTable";

export const getPlanetByName = async (nombre: string) => {
  const params = {
    TableName: starWarsTable,
    IndexName: "NombreIndex",
    KeyConditionExpression: "#nombre = :nombre",
    ExpressionAttributeNames: { "#nombre": "nombre" },
    ExpressionAttributeValues: { ":nombre": nombre },
  };

  const result = await dynamoDb.send(new QueryCommand(params));
  return result.Items && result.Items.length > 0 ? result.Items[0] : null;
};

export const savePlanet = async (data: Record<string, any>) => {
  const params = { TableName: starWarsTable, Item: data };
  await dynamoDb.send(new PutCommand(params));
};

export const fetchTranslations = async (): Promise<Record<string, string>> => {
  const params = { TableName: translateTable };
  const result = await dynamoDb.send(new ScanCommand(params));

  const translations: Record<string, string> = {};
  if (result.Items) {
    result.Items.forEach((item: any) => {
      if (item.id && item.translation) {
        translations[item.id] = item.translation;
      }
    });
  }

  return translations;
};
