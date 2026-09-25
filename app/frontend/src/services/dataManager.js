import { Quarto, Reserva, Funcionario, Hospede, Hotel } from '../models/index.js';
import { initialQuartos, initialReservas, allMockUsers, mockHoteis } from '../data/mockData.js';
import { quartoApi, reservaApi } from './apiService.js';

/**
 * DataManager (Padrão Singleton / Facade & Observer OO)
 * Mantém o estado reativo da aplicação composto exclusivamente por instâncias POO das classes de domínio.
 */
class HotelDataManager {
  constructor() {
    this._listeners = new Set();
    this._hotel = null;
    this._quartos = [];
    this._reservas = [];
    this._funcionarios = [];
    this._hospedes = [];
    this._initialized = false;
  }

  // Observer Pattern para reatividade do React
  subscribe(callback) {
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }

  _notify() {
    for (const listener of this._listeners) {
      try {
        listener(this);
      } catch (err) {
        console.error('Erro no listener do DataManager:', err);
      }
    }
  }

  async init() {
    return this.inicializar();
  }

  async inicializar() {
    if (this._initialized) return;

    try {
      // 1. Hotel
      const hotelRaw = mockHoteis[0];
      this._hotel = new Hotel(hotelRaw);

      // 2. Quartos do Storage ou API
      let rawQuartos = [];
      const savedQuartos = localStorage.getItem('anfitrion_quartos_db');
      if (savedQuartos) {
        try {
          rawQuartos = JSON.parse(savedQuartos);
        } catch {
          rawQuartos = initialQuartos;
        }
      } else {
        const res = await quartoApi.getAll();
        if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
          rawQuartos = res.data;
        } else {
          rawQuartos = initialQuartos;
        }
        localStorage.setItem('anfitrion_quartos_db', JSON.stringify(rawQuartos));
      }
      this._quartos = rawQuartos.map((q) => new Quarto(q));

      // 3. Usuários (Funcionários e Hóspedes)
      let rawUsers = [];
      const savedUsers = localStorage.getItem('anfitrion_registered_users');
      if (savedUsers) {
        try {
          rawUsers = JSON.parse(savedUsers);
        } catch {
          rawUsers = allMockUsers;
        }
      } else {
        rawUsers = allMockUsers;
        localStorage.setItem('anfitrion_registered_users', JSON.stringify(rawUsers));
      }

      this._funcionarios = rawUsers
        .filter((u) => u.role === 'funcionario' || u.cargo)
        .map((u) => new Funcionario(u));

      this._hospedes = rawUsers
        .filter((u) => u.role === 'hospede' || !u.cargo)
        .map((u) => new Hospede(u));

      // 4. Reservas
      let rawReservas = [];
      const savedReservas = localStorage.getItem('anfitrion_reservas_db');
      if (savedReservas) {
        try {
          rawReservas = JSON.parse(savedReservas);
        } catch {
          rawReservas = initialReservas;
        }
      } else {
        const res = await reservaApi.getAll();
        if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
          rawReservas = res.data;
        } else {
          rawReservas = initialReservas;
        }
        localStorage.setItem('anfitrion_reservas_db', JSON.stringify(rawReservas));
      }

      this._reservas = rawReservas.map((r) => {
        const resObj = new Reserva(r);
        resObj.quarto = this._quartos.find((q) => q.id === resObj.idQuarto);
        resObj.hospede = this._hospedes.find((h) => h.id === resObj.idHospede);
        return resObj;
      });

      this._initialized = true;
      this._notify();
    } catch (e) {
      console.warn('Fallback na inicialização do DataManager:', e);
      this._hotel = new Hotel(mockHoteis[0]);
      this._quartos = initialQuartos.map((q) => new Quarto(q));
      this._reservas = initialReservas.map((r) => new Reserva(r));
      this._funcionarios = allMockUsers.filter((u) => u.cargo).map((u) => new Funcionario(u));
      this._hospedes = allMockUsers.filter((u) => !u.cargo).map((u) => new Hospede(u));
      this._initialized = true;
      this._notify();
    }
  }

  // Getters POO
  get hotel() {
    return this._hotel;
  }

  get quartos() {
    return [...this._quartos];
  }

  get reservas() {
    return [...this._reservas];
  }

  get funcionarios() {
    return [...this._funcionarios];
  }

  get hospedes() {
    return [...this._hospedes];
  }

  // Métodos de Persistência Local
  _persistirQuartos() {
    localStorage.setItem(
      'anfitrion_quartos_db',
      JSON.stringify(this._quartos.map((q) => q.toDict()))
    );
  }

  _persistirReservas() {
    localStorage.setItem(
      'anfitrion_reservas_db',
      JSON.stringify(this._reservas.map((r) => r.toDict()))
    );
  }

  _persistirUsuarios() {
    const todos = [
      ...this._funcionarios.map((f) => f.toDict(true)),
      ...this._hospedes.map((h) => h.toDict(true))
    ];
    localStorage.setItem('anfitrion_registered_users', JSON.stringify(todos));
  }

  // =========================================================================
  // Operações de Domínio (OO / POO)
  // =========================================================================

  async atualizarStatusQuarto(idQuarto, novoStatus) {
    const quarto = this._quartos.find((q) => q.id === idQuarto);
    if (!quarto) return false;

    quarto.status = novoStatus;
    this._persistirQuartos();
    this._notify();

    try {
      await quartoApi.update(idQuarto, { status: novoStatus });
    } catch {
      // offline fallback
    }
    return true;
  }

  async atualizarDiariaQuarto(idQuarto, novaDiaria) {
    const quarto = this._quartos.find((q) => q.id === idQuarto);
    if (!quarto) return false;

    quarto.diaria = Number(novaDiaria);
    this._persistirQuartos();
    this._notify();

    try {
      await quartoApi.update(idQuarto, { diaria: Number(novaDiaria) });
    } catch {
      // offline fallback
    }
    return true;
  }

  async criarReserva({ idQuarto, idHospede, dataCheckin, dataCheckout, cafeDaManha, pet, almoco }) {
    const quarto = this._quartos.find((q) => q.id === Number(idQuarto));
    const hospede = this._hospedes.find((h) => h.id === Number(idHospede));

    const novaReserva = new Reserva({
      id: Date.now(),
      id_quarto: Number(idQuarto),
      id_hospede: Number(idHospede),
      data_checkin: dataCheckin,
      data_checkout: dataCheckout,
      status: 'Confirmada',
      cafe_da_manha: cafeDaManha,
      pet: pet,
      almoco: almoco,
      criado_em: new Date().toISOString(),
      quarto: quarto,
      hospede: hospede
    });

    novaReserva.recalcularTotal(quarto ? quarto.diaria : 150);

    this._reservas.unshift(novaReserva);
    if (quarto) {
      quarto.status = 'Ocupado';
      this._persistirQuartos();
    }

    this._persistirReservas();
    this._notify();

    try {
      await reservaApi.create(novaReserva.toDict());
    } catch {
      // offline fallback
    }

    return novaReserva;
  }

  async cancelarReserva(idReserva) {
    const reserva = this._reservas.find((r) => r.id === idReserva);
    if (!reserva) return false;

    reserva.status = 'Cancelada';
    const quarto = this._quartos.find((q) => q.id === reserva.idQuarto);
    if (quarto) {
      quarto.status = 'Disponível';
      this._persistirQuartos();
    }

    this._persistirReservas();
    this._notify();
    return true;
  }

  async realizarCheckin(idReserva) {
    const reserva = this._reservas.find((r) => r.id === idReserva);
    if (!reserva) return false;

    reserva.status = 'Check-in Realizado';
    const quarto = this._quartos.find((q) => q.id === reserva.idQuarto);
    if (quarto) {
      quarto.status = 'Ocupado';
      this._persistirQuartos();
    }

    this._persistirReservas();
    this._notify();
    return true;
  }

  async realizarCheckout(idReserva) {
    const reserva = this._reservas.find((r) => r.id === idReserva);
    if (!reserva) return false;

    reserva.status = 'Check-out Finalizado';
    const quarto = this._quartos.find((q) => q.id === reserva.idQuarto);
    if (quarto) {
      quarto.status = 'Em Limpeza';
      this._persistirQuartos();
    }

    this._persistirReservas();
    this._notify();
    return true;
  }

  async adicionarFuncionario(dados) {
    const novoFunc = new Funcionario({
      id: Date.now(),
      id_funcionario: Date.now(),
      id_hospede: Date.now(),
      nome: dados.nome,
      email: dados.email,
      senha: dados.senha || '123',
      telefone: dados.telefone || '',
      cargo: dados.cargo,
      id_hotel: 1
    });

    this._funcionarios.push(novoFunc);
    this._persistirUsuarios();
    this._notify();
    return novoFunc;
  }

  async adicionarQuarto(dados) {
    const novoQuarto = new Quarto({
      id: Date.now(),
      id_quarto: Date.now(),
      id_hotel: 1,
      tipo: dados.tipo,
      status: 'Disponível',
      andar: Number(dados.andar),
      num_quarto: Number(dados.num_quarto),
      diaria: Number(dados.diaria)
    });

    this._quartos.push(novoQuarto);
    this._persistirQuartos();
    this._notify();
    return novoQuarto;
  }
}

export const dataManager = new HotelDataManager();
export const hotelData = dataManager;
