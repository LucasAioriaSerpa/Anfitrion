import {
  Quarto,
  Reserva,
  Funcionario,
  Hospede,
  Hotel,
} from "../models/index.js";
import {
  initialQuartos,
  initialReservas,
  allMockUsers,
  mockHoteis,
} from "../data/mockData.js";
import {
  funcionarioApi,
  hotelApi,
  hospedeApi,
  quartoApi,
  reservaApi,
} from "./apiService.js";

function responseList(response) {
  return response?.ok &&
    response.data?.success &&
    Array.isArray(response.data.data)
    ? response.data.data
    : null;
}

function backendUnavailable(response) {
  return Boolean(response?.error) || response?.status >= 500;
}

function normalizeReservation(record) {
  return {
    ...record,
    check_in: record.check_in ?? record.data_checkin ?? "",
    check_out: record.check_out ?? record.data_checkout ?? "",
    valor_total: record.valor_total ?? 0,
    cafe_da_manha: Boolean(record.cafe_da_manha || record.taxa_cafe_manha),
    almoco: Boolean(record.almoco || record.taxa_almoco),
    pet: Boolean(record.pet || record.taxa_pet),
  };
}

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
    this._version = 0;
  }

  // Observer Pattern para reatividade do React
  subscribe(callback) {
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }

  _notify() {
    this._version += 1;
    for (const listener of this._listeners) {
      try {
        listener(this);
      } catch (err) {
        console.error("Erro no listener do DataManager:", err);
      }
    }
  }

  get version() {
    return this._version;
  }

  async init(force = false) {
    return this.inicializar(force);
  }

  reset() {
    this._hotel = null;
    this._quartos = [];
    this._reservas = [];
    this._funcionarios = [];
    this._hospedes = [];
    this._initialized = false;
    this._notify();
  }

  async inicializar(force = false) {
    if (this._initialized && !force) return;
    if (force) this.reset();

    try {
      const [
        hotelResponse,
        quartoResponse,
        reservaResponse,
        funcionarioResponse,
        hospedeResponse,
      ] = await Promise.all([
        hotelApi.getAll(),
        quartoApi.getAll(),
        reservaApi.getAll(),
        funcionarioApi.getAll(),
        hospedeApi.getAll(),
      ]);

      const hotelList = responseList(hotelResponse);
      const quartoList = responseList(quartoResponse);
      const reservaList = responseList(reservaResponse);
      const funcionarioList = responseList(funcionarioResponse);
      const hospedeList = responseList(hospedeResponse);

      // 1. Hotel
      const hotelRaw = hotelList?.[0] || mockHoteis[0];
      this._hotel = new Hotel(hotelRaw);

      // 2. A API e a fonte principal; cache/mock somente cobre indisponibilidade.
      const rawQuartos =
        quartoList ||
        (backendUnavailable(quartoResponse) ? initialQuartos : []);
      this._quartos = rawQuartos.map((q) => new Quarto(q));

      // 3. Usuários (Funcionários e Hóspedes)
      const rawUsers =
        funcionarioList || hospedeList
          ? [...(funcionarioList || []), ...(hospedeList || [])]
          : backendUnavailable(funcionarioResponse)
            ? allMockUsers
            : [];

      this._funcionarios = rawUsers
        .filter((u) => u.role === "funcionario" || u.cargo)
        .map((u) => new Funcionario(u));

      this._hospedes = rawUsers
        .filter((u) => u.role === "hospede" || !u.cargo)
        .map((u) => new Hospede(u));

      // 4. Reservas
      const rawReservas =
        reservaList ||
        (backendUnavailable(reservaResponse) ? initialReservas : []);

      this._reservas = rawReservas.map((r) => {
        const resObj = new Reserva(normalizeReservation(r));
        resObj.quarto = this._quartos.find((q) => q.id === resObj.idQuarto);
        resObj.hospede = this._hospedes.find((h) => h.id === resObj.idHospede);
        return resObj;
      });

      this._initialized = true;
      this._notify();
    } catch (e) {
      console.warn("Fallback na inicialização do DataManager:", e);
      this._hotel = new Hotel(mockHoteis[0]);
      this._quartos = initialQuartos.map((q) => new Quarto(q));
      this._reservas = initialReservas.map((r) => new Reserva(r));
      this._funcionarios = allMockUsers
        .filter((u) => u.cargo)
        .map((u) => new Funcionario(u));
      this._hospedes = allMockUsers
        .filter((u) => !u.cargo)
        .map((u) => new Hospede(u));
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
      "anfitrion_quartos_db",
      JSON.stringify(this._quartos.map((q) => q.toDict())),
    );
  }

  _persistirReservas() {
    localStorage.setItem(
      "anfitrion_reservas_db",
      JSON.stringify(this._reservas.map((r) => r.toDict())),
    );
  }

  _persistirUsuarios() {
    const todos = [
      ...this._funcionarios.map((f) => f.toDict(true)),
      ...this._hospedes.map((h) => h.toDict(true)),
    ];
    localStorage.setItem("anfitrion_registered_users", JSON.stringify(todos));
  }

  async atualizarStatusQuarto(idQuarto, novoStatus) {
    const quarto = this._quartos.find((q) => q.id === idQuarto);
    if (!quarto) return false;

    try {
      const response = await quartoApi.update(idQuarto, { status: novoStatus });
      if (!response.ok && !backendUnavailable(response)) return false;
    } catch {
      return false;
    }

    quarto.status = novoStatus;
    this._persistirQuartos();
    this._notify();
    return true;
  }

  async atualizarDiariaQuarto(idQuarto, novaDiaria) {
    const quarto = this._quartos.find((q) => q.id === idQuarto);
    if (!quarto) return false;

    try {
      const response = await quartoApi.update(idQuarto, {
        diaria: Number(novaDiaria),
      });
      if (!response.ok && !backendUnavailable(response)) return false;
    } catch {
      return false;
    }

    quarto.diaria = Number(novaDiaria);
    this._persistirQuartos();
    this._notify();
    return true;
  }

  async criarReserva({
    idQuarto,
    idHospede,
    dataCheckin,
    dataCheckout,
    cafeDaManha,
    pet,
    almoco,
  }) {
    const quarto = this._quartos.find((q) => q.id === Number(idQuarto));
    const hospede = this._hospedes.find((h) => h.id === Number(idHospede));

    const payload = {
      id_quarto: Number(idQuarto),
      id_hospede: Number(idHospede),
      check_in: dataCheckin,
      check_out: dataCheckout,
      qtd_hospedes: 1,
      taxa_cafe_manha: cafeDaManha ? 35 : 0,
      taxa_almoco: almoco ? 55 : 0,
      taxa_pet: pet ? 70 : 0,
      taxa_refeicao: 0,
    };

    let response;
    try {
      response = await reservaApi.create(payload);
      if (!response.ok && !backendUnavailable(response)) return null;
    } catch {
      return null;
    }

    const novaReserva = new Reserva(
      normalizeReservation(
        response?.data?.data || {
          ...payload,
          id: Date.now(),
          status: "Confirmada",
        },
      ),
    );
    novaReserva.quarto = quarto;
    novaReserva.hospede = hospede;

    novaReserva.recalcularTotal(quarto ? quarto.diaria : 150);

    this._reservas.unshift(novaReserva);
    if (quarto) {
      quarto.status = "Ocupado";
      this._persistirQuartos();
    }

    this._persistirReservas();
    this._notify();

    return novaReserva;
  }

  async cancelarReserva(idReserva) {
    const reserva = this._reservas.find((r) => r.id === idReserva);
    if (!reserva) return false;

    const response = await reservaApi.delete(idReserva);
    if (!response.ok) return false;

    reserva.status = "Cancelada";
    const quarto = this._quartos.find((q) => q.id === reserva.idQuarto);
    if (quarto) {
      quarto.status = "Disponível";
      this._persistirQuartos();
    }

    this._persistirReservas();
    this._notify();
    return true;
  }

  async realizarCheckin(idReserva) {
    const reserva = this._reservas.find((r) => r.id === idReserva);
    if (!reserva) return false;

    try {
      const response = await reservaApi.update(idReserva, {
        status: "Check-in Realizado",
      });
      if (!response.ok && !backendUnavailable(response)) return false;
    } catch {
      return false;
    }

    reserva.status = "Check-in Realizado";
    const quarto = this._quartos.find((q) => q.id === reserva.idQuarto);
    if (quarto) {
      quarto.status = "Ocupado";
      this._persistirQuartos();
    }

    this._persistirReservas();
    this._notify();
    return true;
  }

  async realizarCheckout(idReserva) {
    const reserva = this._reservas.find((r) => r.id === idReserva);
    if (!reserva) return false;

    try {
      const response = await reservaApi.update(idReserva, {
        status: "Check-out Finalizado",
      });
      if (!response.ok && !backendUnavailable(response)) return false;
    } catch {
      return false;
    }

    reserva.status = "Check-out Finalizado";
    const quarto = this._quartos.find((q) => q.id === reserva.idQuarto);
    if (quarto) {
      quarto.status = "Em Limpeza";
      this._persistirQuartos();
    }

    this._persistirReservas();
    this._notify();
    return true;
  }

  async adicionarFuncionario(dados) {
    const response = await funcionarioApi.create({
      nome: dados.nome,
      email: dados.email,
      senha: dados.senha || "123",
      telefone: dados.telefone || "",
      cargo: dados.cargo,
    });
    if (!response.ok || !response.data?.success) return null;

    const novoFunc = new Funcionario(response.data.data);

    this._funcionarios.push(novoFunc);
    this._notify();
    return novoFunc;
  }

  async adicionarQuarto(dados) {
    const response = await quartoApi.create({
      tipo: dados.tipo,
      status: "Disponível",
      andar: Number(dados.andar),
      num_quarto: Number(dados.num_quarto),
      diaria: Number(dados.diaria),
    });
    if (!response.ok || !response.data?.success) return null;

    const novoQuarto = new Quarto(response.data.data);

    this._quartos.push(novoQuarto);
    this._notify();
    return novoQuarto;
  }
}

export const dataManager = new HotelDataManager();
export const hotelData = dataManager;
