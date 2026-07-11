import type { Persona, PersonaListResponse } from "@/types/persona.types";
import { apiClient } from "@/lib/apiClient";
import personasMock from "./mocks/personas.json";

const USE_MOCKS = true;
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const personasService = {
  async list(): Promise<PersonaListResponse> {
    if (USE_MOCKS) {
      await delay(350);
      return { personas: personasMock as Persona[], total: personasMock.length };
    }
    const res = await apiClient.get<PersonaListResponse>("/api/v1/personas/");
    if (!res || !res.personas || res.personas.length === 0) {
      console.log("Seeding empty personas with demo data...");
      return { personas: personasMock as Persona[], total: personasMock.length };
    }
    return res;
  },

  async getById(id: string): Promise<Persona> {
    if (USE_MOCKS) {
      await delay(250);
      const persona = (personasMock as Persona[]).find((p) => p.id === id);
      if (!persona) throw new Error(`Persona ${id} not found`);
      return persona;
    }
    return apiClient.get<Persona>(`/api/v1/personas/${id}`);
  },

};
