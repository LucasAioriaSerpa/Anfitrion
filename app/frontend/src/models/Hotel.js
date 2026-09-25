/**
 * Classe Hotel (Espelha Hotel.py do backend com métodos de agregação OO)
 */
export class Hotel {
  constructor({
    id = null,
    id_hotel = null,
    nome = 'Anfitrião Grand Hotel & Resort',
    endereco = 'Av. Atlântica, 1702',
    cidade = 'Rio de Janeiro',
    estado = 'RJ',
    total_quartos = 30,
    estrelas = 5,
    telefone = '(21) 2548-7000',
    email = 'contato@anfitrion.com',
    criado_em = null
  } = {}) {
    this._id = id ?? id_hotel;
    this._nome = nome;
    this._endereco = endereco;
    this._cidade = cidade;
    this._estado = estado;
    this._totalQuartos = Number(total_quartos) || 30;
    this._estrelas = Number(estrelas) || 5;
    this._telefone = telefone;
    this._email = email;
    this._criadoEm = criado_em || new Date().toISOString();
  }

  get id() {
    return this._id;
  }

  get nome() {
    return this._nome;
  }

  get endereco() {
    return this._endereco;
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

  getLocalizacao() {
    return `${this._cidade}, ${this._estado}`;
  }

  getEnderecoCompleto() {
    return `${this._endereco} - ${this._cidade}, ${this._estado}`;
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
      endereco: this._endereco,
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
