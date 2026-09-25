/**
 * Classe Base Usuario (POO - Encapsulamento e Abstração)
 * Representa os atributos e comportamentos comuns a qualquer usuário do sistema Anfitrião.
 */
export class Usuario {
  constructor({
    id = null,
    id_hospede = null,
    nome = '',
    email = '',
    senha = '',
    telefone = '',
    role = 'hospede',
    criado_em = null
  } = {}) {
    this._id = id ?? id_hospede;
    this._nome = (nome || '').trim();
    this._email = (email || '').trim().toLowerCase();
    this._senha = senha || '';
    this._telefone = (telefone || '').trim();
    this._role = role;
    this._criadoEm = criado_em || new Date().toISOString();
  }

  // Getters e Setters com encapsulamento
  get id() {
    return this._id;
  }

  set id(value) {
    this._id = value ? Number(value) : null;
  }

  get nome() {
    return this._nome;
  }

  set nome(value) {
    this._nome = (value || '').trim();
  }

  get email() {
    return this._email;
  }

  set email(value) {
    this._email = (value || '').trim().toLowerCase();
  }

  get telefone() {
    return this._telefone;
  }

  set telefone(value) {
    this._telefone = (value || '').trim();
  }

  get role() {
    return this._role;
  }

  get criadoEm() {
    return this._criadoEm;
  }

  // Métodos de Domínio e Comportamento
  getIniciais() {
    if (!this._nome) return 'U';
    const partes = this._nome.split(' ').filter(Boolean);
    if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
    return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
  }

  getPrimeiroNome() {
    if (!this._nome) return 'Usuário';
    return this._nome.split(' ')[0];
  }

  formatarTelefone() {
    const nums = this._telefone.replace(/\D/g, '');
    if (nums.length === 11) {
      return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
    }
    if (nums.length === 10) {
      return `(${nums.slice(0, 2)}) ${nums.slice(2, 6)}-${nums.slice(6)}`;
    }
    return this._telefone || 'Não informado';
  }

  isFuncionario() {
    return this._role === 'funcionario';
  }

  isHospede() {
    return this._role === 'hospede';
  }

  // Serialização para intercâmbio com APIs
  toDict(includeSenha = false) {
    const data = {
      id: this._id,
      id_hospede: this._id,
      nome: this._nome,
      email: this._email,
      telefone: this._telefone,
      role: this._role,
      criado_em: this._criadoEm
    };
    if (includeSenha) {
      data.senha = this._senha;
    }
    return data;
  }

  static fromDict(data) {
    if (!data) return null;
    return new Usuario(data);
  }
}
