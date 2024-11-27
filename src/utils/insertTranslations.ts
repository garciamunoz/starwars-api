const AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1", 
});

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const translateTable = process.env.TRANSLATE_TABLE || "TranslateTable";

const translationMap = {
  name: "nombre",
  rotation_period: "periodo_rotacion",
  orbital_period: "periodo_orbital",
  diameter: "diametro",
  climate: "clima",
  gravity: "gravedad",
  terrain: "terreno",
  surface_water: "superficie_acuatica",
  population: "poblacion",
  residents: "habitantes",
  url: "url",
  films: "peliculas",
  created: "fecha_creacion",
  edited: "fecha_edicion",
};

const insertTranslations = async () => {
  const entries = Object.entries(translationMap);

  for (const [key, value] of entries) {
    const params = {
      TableName: translateTable,
      Item: {
        id: key,
        translation: value,
      },
    };

    try {
      await dynamoDb.put(params).promise();
      console.log(`Inserted: ${key} -> ${value}`);
    } catch (error) {
      console.error(`Error inserting ${key} -> ${value}:`, error);
    }
  }

  console.log("All translations inserted!");
};

insertTranslations();
