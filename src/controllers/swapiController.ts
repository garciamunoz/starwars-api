import { APIGatewayEvent } from "aws-lambda";
import { getPlanetByName, savePlanet } from "../services/dbService";
import { fetchPlanetFromSwapi } from "../services/swapiService";
import { fetchTranslations } from "../services/dbService";

export const getOrCreatePlanet = async (event: APIGatewayEvent) => {
  try {
    const nombre = event.pathParameters?.nombre;

    if (!nombre) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: "El parámetro 'nombre' es obligatorio." }),
      };
    }

    console.log(`Buscando el planeta con nombre: ${nombre}`);

    // Buscar el planeta en la base de datos
    let planet = await getPlanetByName(nombre);

    if (!planet) {
      console.log(`El planeta '${nombre}' no existe en la base de datos. Consultando en SWAPI...`);

      // Obtener el planeta desde SWAPI
      const swapiPlanet = await fetchPlanetFromSwapi(nombre);

      if (!swapiPlanet) {
        return {
          statusCode: 404,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: `El planeta '${nombre}' no se encuentra en SWAPI.` }),
        };
      }

      console.log(`Planeta obtenido de SWAPI:`, swapiPlanet);

      // Obtener las traducciones de atributos
      const translations = await fetchTranslations();

      // Traducir los atributos
      const translatedPlanet = Object.keys(swapiPlanet).reduce((acc, key) => {
        const translatedKey = translations[key] || key;
        acc[translatedKey] = swapiPlanet[key];
        return acc;
      }, {} as Record<string, any>);

      translatedPlanet.id = new Date().getTime().toString(); 

      console.log("Guardando el planeta con atributos traducidos:", translatedPlanet);

      // Guardar el planeta en la base de datos
      await savePlanet(translatedPlanet);

      planet = translatedPlanet;
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(planet),
    };
  } catch (error) {
    console.error("Error en getOrCreatePlanet:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "Error interno del servidor." }),
    };
  }
};

export const createPlanet = async (event: APIGatewayEvent) => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: "El cuerpo de la solicitud no puede estar vacío." }),
      };
    }

    const data = JSON.parse(event.body);

    if (!data.nombre) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: "El atributo 'nombre' es obligatorio." }),
      };
    }

    console.log("Datos recibidos para crear el planeta:", data);

    const translations = await fetchTranslations();

    const translatedData = Object.keys(data).reduce((acc, key) => {
      const translatedKey = translations[key] || key;
      acc[translatedKey] = data[key];
      return acc;
    }, {} as Record<string, any>);

    if (!translatedData.id) {
      translatedData.id = new Date().getTime().toString();
    }

    console.log("Datos traducidos para guardar el planeta:", translatedData);

    await savePlanet(translatedData);

    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "Planeta guardado exitosamente.", planeta: translatedData }),
    };
  } catch (error) {
    console.error("Error en createPlanet:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "Error interno del servidor." }),
    };
  }
};
