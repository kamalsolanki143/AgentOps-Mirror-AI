import { apiClient } from "@/lib/apiClient";

export interface AuthResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  access_token: string;
  refresh_token: string;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/api/v1/auth/login", { email, password });
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/api/v1/auth/register", { name, email, password });
  },

  async getMe(): Promise<any> {
    return apiClient.get<any>("/api/v1/auth/me");
  }
};
