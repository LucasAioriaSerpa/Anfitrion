/**
 * Classe Reserva (Espelha Reserva.py do backend com métodos de cálculo e regras de domínio)
 */
export class Reserva {
  constructor({
    id = null,
    id_reserva = null,
    id_quarto = null,
    id_hospede = null,
    check_in = "",
    check_out = "",
    valor_total = 0.0,
    status = "Confirmada",
    cafe_da_manha = false,
    pet = false,
    almoco = false,
    jantar = false,
    qtd_hospedes = 1,
    id_hotel = null,
    quarto_numero = null,
    quarto_tipo = null,
    criado_em = null,
    // Propriedades anexadas opcionais para enriquecer exibições
    quarto = null,
    hospede = null,
  } = {}) {
    this._id = id ?? id_reserva;
    this._idQuarto = Number(id_quarto);
    this._idHospede = Number(id_hospede);
    this._idHotel = id_hotel != null ? Number(id_hotel) : null;
    this._dataCheckin = check_in;
    this._dataCheckout = check_out;
    this._valorTotal = Number(valor_total) || 0.0;
    this._status = status || "Confirmada";
    this._cafeDaManha = Boolean(cafe_da_manha);
    this._pet = Boolean(pet);
    this._almoco = Boolean(almoco);
    this._jantar = Boolean(jantar);
    this._qtdHospedes = Number(qtd_hospedes) || 1;
    this._quartoNumero = quarto_numero ?? null;
    this._quartoTipo = quarto_tipo ?? null;
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

  get idHotel() {
    return this._idHotel ?? this.quarto?.idHotel ?? null;
  }

  get qtdHospedes() {
    return this._qtdHospedes;
  }

  set qtdHospedes(val) {
    this._qtdHospedes = Number(val) || 1;
  }

  get quartoNumero() {
    return this.quarto?.numQuarto ?? this._quartoNumero;
  }

  get quartoTipo() {
    return this.quarto?.tipo ?? this._quartoTipo;
  }

  get dataCheckin() {
    return this._dataCheckin;
  }

  set dataCheckin(value) {
    this._dataCheckin = value;
  }

  get dataCheckout() {
    return this._dataCheckout;
  }

  set dataCheckout(value) {
    this._dataCheckout = value;
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

  set cafeDaManha(val) {
    this._cafeDaManha = Boolean(val);
  }

  get pet() {
    return this._pet;
  }

  set pet(val) {
    this._pet = Boolean(val);
  }

  get almoco() {
    return this._almoco;
  }

  set almoco(val) {
    this._almoco = Boolean(val);
  }

  get jantar() {
    return this._jantar;
  }

  set jantar(val) {
    this._jantar = Boolean(val);
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
      total += 35 * noites;
    }
    if (this._almoco) {
      total += 55 * noites;
    }
    if (this._jantar) {
      total += 65 * noites;
    }
    if (this._pet) {
      total += 70;
    }

    this._valorTotal = total;
    return total;
  }

  isAtiva() {
    const s = this._status.toLowerCase();
    return (
      s.includes("confirmad") ||
      s.includes("check-in") ||
      s.includes("em andamento")
    );
  }

  isCheckinRealizado() {
    return this._status.toLowerCase().includes("check-in");
  }

  isFinalizada() {
    const s = this._status.toLowerCase();
    return (
      s.includes("check-out") || s.includes("conclu") || s.includes("finaliz")
    );
  }

  isCancelada() {
    return this._status.toLowerCase().includes("cancel");
  }

  formatarCheckin() {
    if (!this._dataCheckin) return "-";
    try {
      return new Date(this._dataCheckin).toLocaleDateString("pt-BR");
    } catch {
      return this._dataCheckin;
    }
  }

  formatarCheckout() {
    if (!this._dataCheckout) return "-";
    try {
      return new Date(this._dataCheckout).toLocaleDateString("pt-BR");
    } catch {
      return this._dataCheckout;
    }
  }

  formatarTotal() {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(this._valorTotal);
  }

  toDict() {
    return {
      id: this._id,
      id_reserva: this._id,
      id_quarto: this._idQuarto,
      id_hospede: this._idHospede,
      check_in: this._dataCheckin,
      check_out: this._dataCheckout,
      qtd_hospedes: this._qtdHospedes,
      id_hotel: this.idHotel,
      valor_total: this._valorTotal,
      status: this._status,
      cafe_da_manha: this._cafeDaManha,
      pet: this._pet,
      almoco: this._almoco,
      jantar: this._jantar,
      taxa_cafe_manha: this._cafeDaManha ? 35 : 0,
      taxa_almoco: this._almoco ? 55 : 0,
      taxa_jantar: this._jantar ? 65 : 0,
      taxa_pet: this._pet ? 70 : 0,
      criado_em: this._criadoEm,
    };
  }

  static fromDict(data) {
    if (!data) return null;
    return new Reserva(data);
  }
}
