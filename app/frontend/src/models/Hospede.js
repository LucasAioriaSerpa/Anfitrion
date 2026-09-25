import { Usuario } from './Usuario.js';

/**
 * Classe Hospede (Herança de Usuario)
 * Especializa comportamentos do hóspede, histórico de estadias e cálculo de fidelidade.
 */
export class Hospede extends Usuario {
  constructor(data = {}) {
    super({
      ...data,
      role: 'hospede'
    });
    this._idHospede = this._id;
    this._preferencias = data.preferencias || [];
  }

  get idHospede() {
    return this._idHospede;
  }

  get preferencias() {
    return [...this._preferencias];
  }

  adicionarPreferencia(pref) {
    if (pref && !this._preferencias.includes(pref)) {
      this._preferencias.push(pref);
    }
  }

  isFuncionario() {
    return false;
  }

  isHospede() {
    return true;
  }

  /**
   * Calcula o nível de fidelidade com base no total de estadias
   * Exemplo de método de regra de negócios OO
   */
  calcularNivelFidelidade(totalEstadias = 0) {
    if (totalEstadias >= 10) return { nivel: 'Diamond', desconto: 0.15, cor: '#4e2f34' };
    if (totalEstadias >= 5) return { nivel: 'Gold', desconto: 0.10, cor: '#8b998f' };
    if (totalEstadias >= 2) return { nivel: 'Silver', desconto: 0.05, cor: '#9bb2d6' };
    return { nivel: 'Standard', desconto: 0, cor: '#663f46' };
  }

  toDict(includeSenha = false) {
    const base = super.toDict(includeSenha);
    return {
      ...base,
      id_hospede: this._idHospede,
      preferencias: this._preferencias
    };
  }

  static fromDict(data) {
    if (!data) return null;
    return new Hospede(data);
  }
}
