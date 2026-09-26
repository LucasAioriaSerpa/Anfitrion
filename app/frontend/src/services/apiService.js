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

import { allMockUsers } from '../data/mockData.js';

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
    const contentType = response.headers.get('content-type') || '';
    let data = null;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { success: response.ok, message: text || `HTTP ${response.status}` };
      }
    }

    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return { ok: false, status: 500, error: error?.message || 'Falha de comunicação' };
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
// SEED INICIAL E ARMAZENAMENTO LOCAL (FALLBACK SE FLASK ESTIVER OFFLINE)
// ==========================================
const STORAGE_KEY = 'anfitrion_registered_users';

function getStoredUsers() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn('Erro ao ler usuários do storage:', e);
  }

  // Contas padrão de semente centralizadas em src/data/mockData.js
  const initialUsers = [...allMockUsers];

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialUsers));
  } catch {
    // ignore
  }

  return initialUsers;
}

function saveStoredUsers(users) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn('Erro ao salvar usuários no storage:', e);
  }
}

// ==========================================
// AUTENTICAÇÃO E ESTATÍSTICAS
// ==========================================
export const authApi = {
  login: async (credentials) => {
    const email = String(credentials.email || '').trim().toLowerCase();
    const senha = String(credentials.senha || '');
    const role = String(credentials.role || 'hospede').toLowerCase();
    const codigoAcesso = String(credentials.codigoAcesso || '').trim();

    // Tenta primeiro no backend real
    try {
      const res = await request('/auth/login', {
        method: 'POST',
        body: {
          ...credentials,
          role,
          codigoAcesso
        }
      });
      if (res.ok && res.data?.success) {
        return res;
      }
      if (res.status === 400 || res.status === 401 || res.status === 403) {
        return res;
      }
    } catch {
      // Falha de rede ou backend indisponível, usa fallback local
    }

    // Fallback local caso o backend Flask não esteja rodando
    const users = getStoredUsers();
    const user = users.find(u => u.email.toLowerCase() === email);

    if (!user || user.senha !== senha) {
      return {
        ok: false,
        status: 401,
        data: { success: false, message: 'E-mail ou senha incorretos.' }
      };
    }

    if (role !== 'hospede') {
      const storedAccessCode = String(user.codigoAcesso || user.codigo_acesso || '').trim();
      if (!codigoAcesso || (storedAccessCode && codigoAcesso !== storedAccessCode)) {
        return {
          ok: false,
          status: 403,
          data: { success: false, message: 'Código de acesso do funcionário inválido.' }
        };
      }
      if (!storedAccessCode && !codigoAcesso) {
        return {
          ok: false,
          status: 403,
          data: { success: false, message: 'Informe o código de acesso do funcionário.' }
        };
      }
    }

    const userData = {
      id_hospede: user.id_hospede,
      nome: user.nome,
      email: user.email,
      telefone: user.telefone,
      role: user.role,
      cargo: user.cargo || null,
      id_hotel: user.id_hotel || null,
      id_funcionario: user.id_funcionario || null
    };

    return {
      ok: true,
      status: 200,
      data: {
        success: true,
        message: 'Login realizado com sucesso!',
        user: userData
      }
    };
  },

  register: async (userData) => {
    const email = String(userData.email || '').trim().toLowerCase();
    const senha = String(userData.senha || '');
    const nome = String(userData.nome || '').trim() || email.split('@')[0];
    const telefone = String(userData.telefone || '');
    const role = String(userData.role || 'hospede').toLowerCase();
    const codigoAcesso = String(userData.codigoAcesso || '').trim();

    if (role !== 'hospede' && !codigoAcesso) {
      return {
        ok: false,
        status: 403,
        data: {
          success: false,
          message: 'Informe o código de acesso do funcionário para continuar.'
        }
      };
    }

    // Tenta primeiro no backend Flask
    try {
      const res = await request('/auth/register', {
        method: 'POST',
        body: {
          nome,
          email,
          senha,
          telefone,
          role,
          codigoAcesso,
          cargo: userData.cargo || (role === 'hospede' ? 'Hóspede' : role)
        }
      });
      if (res.ok && res.data?.success) {
        return res;
      }
      if (res.status === 400 || res.status === 409 || res.status === 403) {
        return res;
      }
    } catch {
      // Fallback local caso o backend Flask não esteja rodando
    }

    // Fallback local
    const users = getStoredUsers();
    const existing = users.find(u => u.email.toLowerCase() === email);
    if (existing) {
      return {
        ok: false,
        status: 409,
        data: { success: false, message: 'Este e-mail já está cadastrado.' }
      };
    }

    const newUser = {
      id_hospede: Date.now(),
      nome,
      email,
      senha,
      telefone: telefone || '(00) 00000-0000',
      role,
      cargo: userData.cargo || (role === 'hospede' ? 'Hóspede' : role),
      id_hotel: 1,
      id_funcionario: role === 'hospede' ? null : Date.now() + 1,
      codigoAcesso: role === 'hospede' ? null : codigoAcesso
    };

    users.push(newUser);
    saveStoredUsers(users);

    return {
      ok: true,
      status: 201,
      data: {
        success: true,
        message: role === 'hospede' ? 'Conta de hóspede criada com sucesso!' : 'Conta de funcionário criada com sucesso!',
        user: {
          id_hospede: newUser.id_hospede,
          nome: newUser.nome,
          email: newUser.email,
          role,
          cargo: newUser.cargo,
          id_hotel: 1,
          id_funcionario: newUser.id_funcionario
        }
      }
    };
  },

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
