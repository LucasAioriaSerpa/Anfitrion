import { Hospede } from './Hospede.js';

/**
 * Classe Funcionario (Herança de Hospede/Usuario - Espelha a classe Funcionario.py do backend)
 * Encapsula o cargo, o hotel de lotação e o polimorfismo de regras de acesso do sistema.
 */
export class Funcionario extends Hospede {
  constructor(data = {}) {
    super(data);
    this._role = 'funcionario';
    this._idFuncionario = data.id_funcionario ?? data.id ?? null;
    this._idHotel = data.id_hotel ? Number(data.id_hotel) : 1;
    this._cargo = (data.cargo || 'Funcionário').trim();
  }

  get idFuncionario() {
    return this._idFuncionario;
  }

  get idHotel() {
    return this._idHotel;
  }

  set idHotel(value) {
    this._idHotel = Number(value);
  }

  get cargo() {
    return this._cargo;
  }

  set cargo(value) {
    this._cargo = (value || '').trim();
  }

  isFuncionario() {
    return true;
  }

  isHospede() {
    return false;
  }

  // =========================================================================
  // Polimorfismo e Regras de Negócio de Permissão / Variabilidade Operacional
  // =========================================================================

  /**
   * Administrador: Acesso irrestrito a configurações, quartos, funcionários e relatórios.
   */
  isAdmin() {
    return this._cargo.toLowerCase().includes('admin');
  }

  /**
   * Gerência Geral / Subgerência: Visão estratégica, tarifas, relatórios e gestão operacional.
   */
  isGerenteOuSuperior() {
    const c = this._cargo.toLowerCase();
    return this.isAdmin() || c.includes('gerente') || c.includes('subgerente');
  }

  /**
   * Recepção e Front-desk: Check-in, check-out, alocação de quartos e visualização de estadias.
   */
  isRecepcao() {
    const c = this._cargo.toLowerCase();
    return this.isGerenteOuSuperior() || c.includes('recep');
  }

  /**
   * Governança & Camareiras: Status de limpeza, manutenção e higienização dos quartos.
   */
  isGovernancaOuCamareira() {
    const c = this._cargo.toLowerCase();
    return this.isGerenteOuSuperior() || c.includes('governan') || c.includes('camareir');
  }

  // Permissões granulares de ação
  podeGerenciarFuncionarios() {
    return this.isAdmin() || this._cargo.toLowerCase() === 'gerente geral';
  }

  podeModificarTarifas() {
    return this.isGerenteOuSuperior();
  }

  podeRealizarCheckinCheckout() {
    return this.isGerenteOuSuperior() || this.isRecepcao();
  }

  podeAlterarStatusQuarto() {
    // Todos os funcionários da equipe interna podem atuar no status
    return true;
  }

  podeCriarQuarto() {
    return this.isGerenteOuSuperior();
  }

  podeVerRelatorioFinanceiro() {
    return this.isGerenteOuSuperior();
  }

  /**
   * Retorna a chave de interface ideal (para Strategy / Factory de views)
   */
  getViewStrategyKey() {
    const c = this._cargo.toLowerCase();
    if (this.isAdmin()) return 'admin';
    if (c.includes('gerente')) return 'manager';
    if (c.includes('recep')) return 'reception';
    if (c.includes('governan') || c.includes('camareir')) return 'housekeeping';
    return 'staff';
  }

  toDict(includeSenha = false) {
    const base = super.toDict(includeSenha);
    return {
      ...base,
      role: 'funcionario',
      id_funcionario: this._idFuncionario,
      id_hotel: this._idHotel,
      cargo: this._cargo
    };
  }

  static fromDict(data) {
    if (!data) return null;
    return new Funcionario(data);
  }
}
