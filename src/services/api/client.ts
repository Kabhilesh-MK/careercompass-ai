/**
 * Mock API Client Abstraction for CareerCompass.
 *
 * Implements a clean, asynchronous request/response contract matching REST conventions
 * without making external network calls during UI-V2.2.
 * Ready for future FastAPI endpoint wiring in Phase 3.
 */

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    // Simulated short async delay to emulate realistic network event loop without blocking UI
    await new Promise((resolve) => setTimeout(resolve, 15));
    return {
      data: undefined as unknown as T,
      status: 200,
      message: `[MOCK GET] ${this.baseUrl}${endpoint}`
    };
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    await new Promise((resolve) => setTimeout(resolve, 20));
    return {
      data: (body || {}) as T,
      status: 201,
      message: `[MOCK POST] ${this.baseUrl}${endpoint}`
    };
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    await new Promise((resolve) => setTimeout(resolve, 20));
    return {
      data: (body || {}) as T,
      status: 200,
      message: `[MOCK PUT] ${this.baseUrl}${endpoint}`
    };
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    await new Promise((resolve) => setTimeout(resolve, 15));
    return {
      data: {} as T,
      status: 200,
      message: `[MOCK DELETE] ${this.baseUrl}${endpoint}`
    };
  }
}

export const apiClient = new ApiClient();
