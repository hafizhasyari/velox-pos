// Configuration for Microservices API Layer & E2E Mock Engine
export const API_CONFIG = {
  // Base URL for API Gateway or BFF when VITE_USE_MOCKS is false
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  
  // Toggle for E2E Mock Engine (defaults to true for Phase 1 E2E readiness & offline development)
  useMocks: import.meta.env.VITE_USE_MOCKS !== 'false',
  
  // Simulated network latency in milliseconds when using Mock Engine (to test realistic loading states & race conditions)
  simulatedLatencyMs: Number(import.meta.env.VITE_SIMULATED_LATENCY_MS || 250),
  
  // Microservice endpoints mapping
  endpoints: {
    auth: '/auth',
    catalog: '/catalog',
    orders: '/orders',
    payments: '/payments',
    shifts: '/shifts',
    analytics: '/analytics'
  }
};
