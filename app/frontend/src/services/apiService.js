/**
 * API Service para comunicação entre React e o backend Flask.
 * Conecta-se às rotas dos Blueprints do Flask:
 * - /api/hospede
 * - /api/hotel
 * - /api/quarto
 * - /api/funcionario
 * - /api/reserva
 * - /api/auth
 */

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error(`Erro na requisição para ${url}:`, error);
    return { ok: false, status: 500, error: error.message };
  }
}

// ==========================================
// CRUD HÓSPEDE
// ==========================================
export const hospedeApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/hospede${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/hospede/${id}`),
  create: (data) => request('/hospede', { method: 'POST', body: data }),
  update: (id, data) => request(`/hospede/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/hospede/${id}`, { method: 'DELETE' })
};

// ==========================================
// CRUD HOTEL
// ==========================================
export const hotelApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/hotel${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/hotel/${id}`),
  create: (data) => request('/hotel', { method: 'POST', body: data }),
  update: (id, data) => request(`/hotel/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/hotel/${id}`, { method: 'DELETE' })
};

// ==========================================
// CRUD QUARTO
// ==========================================
export const quartoApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/quarto${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/quarto/${id}`),
  create: (data) => request('/quarto', { method: 'POST', body: data }),
  update: (id, data) => request(`/quarto/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/quarto/${id}`, { method: 'DELETE' })
};

// ==========================================
// CRUD FUNCIONÁRIO
// ==========================================
export const funcionarioApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/funcionario${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/funcionario/${id}`),
  create: (data) => request('/funcionario', { method: 'POST', body: data }),
  update: (id, data) => request(`/funcionario/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/funcionario/${id}`, { method: 'DELETE' })
};

// ==========================================
// CRUD RESERVA
// ==========================================
export const reservaApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/reserva${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/reserva/${id}`),
  create: (data) => request('/reserva', { method: 'POST', body: data }),
  update: (id, data) => request(`/reserva/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/reserva/${id}`, { method: 'DELETE' })
};

// ==========================================
// AUTENTICAÇÃO E ESTATÍSTICAS
// ==========================================
export const authApi = {
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
  getStats: () => request('/auth/stats')
};

export default {
  hospede: hospedeApi,
  hotel: hotelApi,
  quarto: quartoApi,
  funcionario: funcionarioApi,
  reserva: reservaApi,
  auth: authApi
};
