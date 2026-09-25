/**
 * Classe Reserva (Espelha Reserva.py do backend com métodos de cálculo e regras de domínio)
 */
export class Reserva {
  constructor({
    id = null,
    id_reserva = null,
    id_quarto = null,
    id_hospede = null,
    data_checkin = '',
    data_checkout = '',
    valor_total = 0.0,
    status = 'Confirmada',
    cafe_da_manha = false,
    pet = false,
    almoco = false,
    criado_em = null,
    // Propriedades anexadas opcionais para enriquecer exibições
    quarto = null,
    hospede = null
  } = {}) {
    this._id = id ?? id_reserva;
    this._idQuarto = Number(id_quarto);
    this._idHospede = Number(id_hospede);
    this._dataCheckin = data_checkin;
    this._dataCheckout = data_checkout;
    this._valorTotal = Number(valor_total) || 0.0;
    this._status = status || 'Confirmada';
    this._cafeDaManha = Boolean(cafe_da_manha);
    this._pet = Boolean(pet);
    this._almoco = Boolean(almoco);
    this._criadoEm = criado_em || new Date().toISOString();
    this.quarto = quarto;
    this.hospede = hospede;
  }

  get id() {
    return this._id;
  }

  get idQuarto() {
    return this._idQuarto;
  }

  get idHospede() {
    return this._idHospede;
  }

  get dataCheckin() {
    return this._dataCheckin;
  }

  get dataCheckout() {
    return this._dataCheckout;
  }

  get valorTotal() {
    return this._valorTotal;
  }

  set valorTotal(val) {
    this._valorTotal = Number(val);
  }

  get status() {
    return this._status;
  }

  set status(val) {
    this._status = String(val);
  }

  get cafeDaManha() {
    return this._cafeDaManha;
  }

  get pet() {
    return this._pet;
  }

  get almoco() {
    return this._almoco;
  }

  // Métodos de cálculo e lógica de negócio
  calcularNoites() {
    if (!this._dataCheckin || !this._dataCheckout) return 1;
    const entrada = new Date(this._dataCheckin);
    const saida = new Date(this._dataCheckout);
    const diff = saida.getTime() - entrada.getTime();
    const noites = Math.ceil(diff / (1000 * 3600 * 24));
    return noites > 0 ? noites : 1;
  }

  /**
   * Recalcula o total com base no preço da diária e taxas opcionais
   */
  recalcularTotal(diariaQuarto = 150) {
    const noites = this.calcularNoites();
    let total = diariaQuarto * noites;

    if (this._cafeDaManha) {
      total += 35 * noites; // R$ 35/dia café
    }
    if (this._almoco) {
      total += 55 * noites; // R$ 55/dia almoço
    }
    if (this._pet) {
      total += 70; // taxa única pet
    }

    this._valorTotal = total;
    return total;
  }

  isAtiva() {
    const s = this._status.toLowerCase();
    return s.includes('confirmad') || s.includes('check-in') || s.includes('em andamento');
  }

  isCheckinRealizado() {
    return this._status.toLowerCase().includes('check-in');
  }

  isFinalizada() {
    const s = this._status.toLowerCase();
    return s.includes('check-out') || s.includes('conclu') || s.includes('finaliz');
  }

  isCancelada() {
    return this._status.toLowerCase().includes('cancel');
  }

  formatarCheckin() {
    if (!this._dataCheckin) return '-';
    try {
      return new Date(this._dataCheckin).toLocaleDateString('pt-BR');
    } catch {
      return this._dataCheckin;
    }
  }

  formatarCheckout() {
    if (!this._dataCheckout) return '-';
    try {
      return new Date(this._dataCheckout).toLocaleDateString('pt-BR');
    } catch {
      return this._dataCheckout;
    }
  }

  formatarTotal() {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(this._valorTotal);
  }

  toDict() {
    return {
      id: this._id,
      id_reserva: this._id,
      id_quarto: this._idQuarto,
      id_hospede: this._idHospede,
      data_checkin: this._dataCheckin,
      data_checkout: this._dataCheckout,
      valor_total: this._valorTotal,
      status: this._status,
      cafe_da_manha: this._cafeDaManha,
      pet: this._pet,
      almoco: this._almoco,
      criado_em: this._criadoEm
    };
  }

  static fromDict(data) {
    if (!data) return null;
    return new Reserva(data);
  }
}
