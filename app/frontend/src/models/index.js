import { Usuario } from './Usuario.js';
import { Hospede } from './Hospede.js';
import { Funcionario } from './Funcionario.js';
import { Quarto } from './Quarto.js';
import { Reserva } from './Reserva.js';
import { Hotel } from './Hotel.js';

/**
 * Factory method para instanciar o modelo de usuário correto via Polimorfismo
 */
export function criarUsuario(userData) {
  if (!userData) return null;
  if (userData.role === 'funcionario' || userData.cargo) {
    return Funcionario.fromDict(userData);
  }
  return Hospede.fromDict(userData);
}

export {
  Usuario,
  Hospede,
  Funcionario,
  Quarto,
  Reserva,
  Hotel
};
