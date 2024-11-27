import * as dbService from "../services/dbService";
import { DynamoDBDocumentClient, QueryCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";


jest.mock("@aws-sdk/lib-dynamodb", () => {
  const mockSend = jest.fn(); 
  return {
    DynamoDBDocumentClient: {
      from: jest.fn(() => ({
        send: mockSend,
      })),
    },
    QueryCommand: jest.fn(),
    PutCommand: jest.fn(),
    ScanCommand: jest.fn(),
  };
});

describe("dbService", () => {
  let mockSend: jest.Mock;

  beforeEach(() => {
    
    const lib = require("@aws-sdk/lib-dynamodb");
    mockSend = lib.DynamoDBDocumentClient.from().send as jest.Mock;
    mockSend.mockClear(); 
  });

  describe("getPlanetByName", () => {
    it("debería devolver un planeta si existe", async () => {
      const mockPlanet = { id: "1", nombre: "Tatooine" };
      mockSend.mockResolvedValueOnce({ Items: [mockPlanet] });

      const result = await dbService.getPlanetByName("Tatooine");

      expect(result).toEqual(mockPlanet);
      expect(mockSend).toHaveBeenCalledWith(expect.any(QueryCommand));
    });

    it("debería devolver null si el planeta no existe", async () => {
      mockSend.mockResolvedValueOnce({ Items: [] });

      const result = await dbService.getPlanetByName("PlanetaFicticio");

      expect(result).toBeNull();
      expect(mockSend).toHaveBeenCalledWith(expect.any(QueryCommand));
    });
  });

  describe("savePlanet", () => {
    it("debería guardar un planeta correctamente", async () => {
      const mockPlanet = { id: "2", nombre: "Dagobah" };
      mockSend.mockResolvedValueOnce({});

      await dbService.savePlanet(mockPlanet);

      expect(mockSend).toHaveBeenCalledWith(expect.any(PutCommand));
    });
  });

  describe("fetchTranslations", () => {
    it("debería devolver las traducciones de la tabla", async () => {
      const mockTranslations = [{ id: "name", translation: "nombre" }];
      mockSend.mockResolvedValueOnce({ Items: mockTranslations });

      const result = await dbService.fetchTranslations();

      expect(result).toEqual({ name: "nombre" });
      expect(mockSend).toHaveBeenCalledWith(expect.any(ScanCommand));
    });
  });
});
