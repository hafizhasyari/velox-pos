import { API_CONFIG } from './apiConfig';
import { MockRegistry, type HttpResponse } from './mocks/mockRegistry';

export const transport = {
  async request<T = any>(method: string, endpoint: string, body?: any): Promise<HttpResponse<T>> {
    // Check if development/E2E mock switcher is enabled
    const forceMocks = localStorage.getItem('VITE_USE_MOCKS') !== 'false' && API_CONFIG.useMocks;

    if (forceMocks) {
      return MockRegistry.handleRequest(method, endpoint, body);
    }

    // Live Microservice HTTP Transport Layer
    const url = `${API_CONFIG.baseURL}${endpoint}`;
    const token = localStorage.getItem('velox_auth_token');

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        ...(body ? { body: JSON.stringify(body) } : {})
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        return {
          status: response.status,
          data: null as T,
          error: data?.error || `Microservice Gateway Error (${response.status})`
        };
      }

      return {
        status: response.status,
        data: data as T
      };
    } catch (err: any) {
      return {
        status: 503,
        data: null as T,
        error: `Network / Gateway unreachable: ${err.message}`
      };
    }
  },

  get<T = any>(endpoint: string) {
    return this.request<T>('GET', endpoint);
  },
  post<T = any>(endpoint: string, body?: any) {
    return this.request<T>('POST', endpoint, body);
  },
  put<T = any>(endpoint: string, body?: any) {
    return this.request<T>('PUT', endpoint, body);
  },
  patch<T = any>(endpoint: string, body?: any) {
    return this.request<T>('PATCH', endpoint, body);
  },
  delete<T = any>(endpoint: string, body?: any) {
    return this.request<T>('DELETE', endpoint, body);
  }
};
