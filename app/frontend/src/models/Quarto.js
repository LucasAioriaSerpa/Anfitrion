/**
 * Classe Quarto (Espelha Quarto.py do backend com métodos de domínio OO)
 */
export class Quarto {
  constructor({
    id = null,
    id_quarto = null,
    id_hotel = 1,
    tipo = 'Standard Casal',
    status = 'Disponível',
    andar = 1,
    num_quarto = 101,
    diaria = 150.0,
    criado_em = null
  } = {}) {
    this._id = id ?? id_quarto;
    this._idHotel = Number(id_hotel) || 1;
    this._tipo = tipo || 'Standard Casal';
    this._status = status || 'Disponível';
    this._andar = Number(andar) || 1;
    this._numQuarto = Number(num_quarto) || 101;
    this._diaria = Number(diaria) || 150.0;
    this._criadoEm = criado_em || new Date().toISOString();
  }

  get id() {
    return this._id;
  }

  set id(value) {
    this._id = value ? Number(value) : null;
  }

  get idHotel() {
    return this._idHotel;
  }

  set idHotel(value) {
    this._idHotel = Number(value);
  }

  get tipo() {
    return this._tipo;
  }

  set tipo(value) {
    this._tipo = String(value);
  }

  get status() {
    return this._status;
  }

  set status(value) {
    this._status = String(value);
  }

  get andar() {
    return this._andar;
  }

  set andar(value) {
    this._andar = Number(value);
  }

  get numQuarto() {
    return this._numQuarto;
  }

  set numQuarto(value) {
    this._numQuarto = Number(value);
  }

  get diaria() {
    return this._diaria;
  }

  set diaria(value) {
    this._diaria = Math.max(0, Number(value));
  }

  get criadoEm() {
    return this._criadoEm;
  }

  // Regras de Negócios e Predicados OO
  isDisponivel() {
    return this._status.toLowerCase() === 'disponível' || this._status.toLowerCase() === 'disponivel';
  }

  isOcupado() {
    return this._status.toLowerCase() === 'ocupado';
  }

  isEmLimpeza() {
    const s = this._status.toLowerCase();
    return s.includes('limpeza') || s.includes('higieniz') || s.includes('sujo');
  }

  isManutencao() {
    return this._status.toLowerCase().includes('manuten');
  }

  formatarDiaria() {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(this._diaria);
  }

  /**
   * Ciclo de transição de status para governança e hotelaria
   */
  obterProximoStatusHigienizacao() {
    if (this.isOcupado()) return 'Limpeza Solicitada';
    if (this.isEmLimpeza()) return 'Disponível';
    if (this.isDisponivel()) return 'Em Limpeza';
    return 'Disponível';
  }

  /**
   * Metadados visuais (cor do ponto, sem gerar pill excessiva)
   */
  getStatusMeta() {
    if (this.isDisponivel()) {
      return { label: 'Disponível', dotColor: '#28a745', textColor: '#155724' };
    }
    if (this.isOcupado()) {
      return { label: 'Ocupado', dotColor: '#dc3545', textColor: '#721c24' };
    }
    if (this.isEmLimpeza()) {
      return { label: 'Em Limpeza', dotColor: '#d39e00', textColor: '#856404' };
    }
    return { label: this._status, dotColor: '#6c757d', textColor: '#383d41' };
  }

  toDict() {
    return {
      id: this._id,
      id_quarto: this._id,
      id_hotel: this._idHotel,
      tipo: this._tipo,
      status: this._status,
      andar: this._andar,
      num_quarto: this._numQuarto,
      diaria: this._diaria,
      criado_em: this._criadoEm
    };
  }

  static fromDict(data) {
    if (!data) return null;
    return new Quarto(data);
  }
}
