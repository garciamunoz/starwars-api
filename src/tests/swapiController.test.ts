import { getOrCreatePlanet, createPlanet } from "../controllers/swapiController";
import * as dbService from "../services/dbService";
import * as swapiService from "../services/swapiService";


jest.mock("../services/dbService", () => ({
  getPlanetByName: jest.fn(),
  savePlanet: jest.fn(),
  fetchTranslations: jest.fn(),
}));

jest.mock("../services/swapiService", () => ({
  fetchPlanetFromSwapi: jest.fn(),
}));

describe("swapiController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getOrCreatePlanet", () => {
    it("debería devolver un planeta si existe en la base de datos", async () => {
      const mockPlanet = { id: "1", nombre: "Tatooine", clima: "arid", poblacion: "200000" };
      (dbService.getPlanetByName as jest.Mock).mockResolvedValue(mockPlanet);

      const event = { pathParameters: { nombre: "Tatooine" } } as any;
      const result = await getOrCreatePlanet(event);

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual(mockPlanet);
      expect(dbService.getPlanetByName).toHaveBeenCalledWith("Tatooine");
    });
  });
});
