/**
 * Classe Hotel (Espelha Hotel.py do backend com métodos de agregação OO)
 */
export class Hotel {
  constructor({
    id = null,
    id_hotel = null,
    nome = 'Anfitrião Grand Hotel & Resort',
    endereso = '',
    franquia = 'Anfitrião Hotéis & Resorts',
    cidade = '',
    estado = '',
    total_quartos = 0,
    qtd_quartos = 0,
    estrelas = 5,
    telefone = '',
    email = '',
    cnpj = '',
    criado_em = null
  } = {}) {
    this._id = id ?? id_hotel;
    this._nome = nome;
    this._endereso = endereso || '';
    this._franquia = franquia || '';
    this._cidade = cidade;
    this._estado = estado;
    this._totalQuartos = Number(qtd_quartos || total_quartos) || 0;
    this._estrelas = Number(estrelas) || 5;
    this._telefone = telefone;
    this._email = email;
    this._cnpj = cnpj || '';
    this._criadoEm = criado_em || new Date().toISOString();
  }

  get id() {
    return this._id;
  }

  get nome() {
    return this._nome;
  }

  get endereso() {
    return this._endereso;
  }

  get cidade() {
    return this._cidade;
  }

  get estado() {
    return this._estado;
  }

  get totalQuartos() {
    return this._totalQuartos;
  }

  get estrelas() {
    return this._estrelas;
  }

  get telefone() {
    return this._telefone;
  }

  get email() {
    return this._email;
  }

  get franquia() {
    return this._franquia;
  }

  get cnpj() {
    return this._cnpj;
  }

  getLocalizacao() {
    if (this._cidade && this._estado) return `${this._cidade}, ${this._estado}`;
    return this._endereso || "Localização não informada";
  }

  getEnderecoCompleto() {
    if (this._cidade && this._estado && this._endereso) {
      return `${this._endereso} - ${this._cidade}, ${this._estado}`;
    }
    return this._endereso || this.getLocalizacao();
  }

  /**
   * Calcula a taxa percentual de ocupação baseada em uma lista de quartos POO
   */
  calcularTaxaOcupacao(quartos = []) {
    const total = quartos.length || this._totalQuartos;
    if (!total) return 0;
    const ocupados = quartos.filter(q => q.isOcupado()).length;
    return Math.round((ocupados / total) * 100);
  }

  toDict() {
    return {
      id: this._id,
      id_hotel: this._id,
      nome: this._nome,
      endereso: this._endereso,
      franquia: this._franquia,
      cnpj: this._cnpj,
      qtd_quartos: this._totalQuartos,
      cidade: this._cidade,
      estado: this._estado,
      total_quartos: this._totalQuartos,
      estrelas: this._estrelas,
      telefone: this._telefone,
      email: this._email,
      criado_em: this._criadoEm
    };
  }

  static fromDict(data) {
    if (!data) return null;
    return new Hotel(data);
  }
}
