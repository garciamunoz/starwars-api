import  axios  from "axios";

export const fetchPlanetFromSwapi = async (nombre: string) => {
  const swapiUrl = `https://swapi.dev/api/planets/?search=${nombre}`;
  const response = await axios.get(swapiUrl);

  if (response.data.results.length === 0) {
    return null;
  }

  return response.data.results[0];
};
