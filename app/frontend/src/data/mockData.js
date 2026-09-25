/**
 * Dados Mock / Seed para o Sistema Anfitrião
 * Abrange:
 * - Hoteis
 * - Funcionários (Administrador, Gerente Geral, Subgerente, Recepcionista, Governanta, Camareira)
 * - Hóspedes
 * - Quartos e Diárias
 * - Reservas
 */

export const mockHoteis = [
  {
    id_hotel: 1,
    cnpj: '12.345.678/0001-90',
    franquia: 'Anfitrião Hotéis & Resorts',
    nome: 'Anfitrião Grand Hotel & Resort',
    endereso: 'Avenida Atlântica, 1500 - Copacabana, Rio de Janeiro - RJ',
    qtd_quartos: 30,
    estrelas: 5
  },
  {
    id_hotel: 2,
    cnpj: '98.765.432/0001-10',
    franquia: 'Anfitrião Hotéis & Resorts',
    nome: 'Anfitrião Boutique Hotel Jardins',
    endereso: 'Alameda Santos, 850 - Cerqueira César, São Paulo - SP',
    qtd_quartos: 15,
    estrelas: 4
  }
];

export const mockFuncionarios = [
  {
    id_hospede: 1,
    id_funcionario: 1,
    nome: 'Administrador Geral',
    email: 'admin@anfitrion.com',
    senha: 'admin',
    telefone: '(11) 98888-7777',
    cargo: 'Administrador',
    role: 'funcionario',
    id_hotel: 1
  },
  {
    id_hospede: 2,
    id_funcionario: 2,
    nome: 'Roberto Silva',
    email: 'gerente@anfitrion.com',
    senha: '123',
    telefone: '(11) 98111-2222',
    cargo: 'Gerente Geral',
    role: 'funcionario',
    id_hotel: 1
  },
  {
    id_hospede: 3,
    id_funcionario: 3,
    nome: 'Fernanda Lima',
    email: 'subgerente@anfitrion.com',
    senha: '123',
    telefone: '(11) 98222-3333',
    cargo: 'Subgerente',
    role: 'funcionario',
    id_hotel: 1
  },
  {
    id_hospede: 4,
    id_funcionario: 4,
    nome: 'Lucas Martins',
    email: 'recepcao@anfitrion.com',
    senha: '123',
    telefone: '(11) 97777-6666',
    cargo: 'Recepcionista',
    role: 'funcionario',
    id_hotel: 1
  },
  {
    id_hospede: 5,
    id_funcionario: 5,
    nome: 'Clara Mendes',
    email: 'governanta@anfitrion.com',
    senha: '123',
    telefone: '(11) 97555-4444',
    cargo: 'Governanta',
    role: 'funcionario',
    id_hotel: 1
  },
  {
    id_hospede: 6,
    id_funcionario: 6,
    nome: 'Rosa Santos',
    email: 'camareira@anfitrion.com',
    senha: '123',
    telefone: '(11) 97444-3333',
    cargo: 'Camareira',
    role: 'funcionario',
    id_hotel: 1
  }
];

export const mockHospedes = [
  {
    id_hospede: 101,
    nome: 'Mariana Silva',
    email: 'mariana@gmail.com',
    senha: '123',
    telefone: '(21) 99999-1234',
    role: 'hospede'
  },
  {
    id_hospede: 102,
    nome: 'Carlos Oliveira',
    email: 'carlos@gmail.com',
    senha: '123',
    telefone: '(11) 98888-0000',
    role: 'hospede'
  },
  {
    id_hospede: 103,
    nome: 'Beatriz Costa',
    email: 'beatriz@gmail.com',
    senha: '123',
    telefone: '(31) 97777-8888',
    role: 'hospede'
  },
  {
    id_hospede: 104,
    nome: 'João Pedro Almeida',
    email: 'joao@gmail.com',
    senha: '123',
    telefone: '(41) 99111-2233',
    role: 'hospede'
  }
];

export const mockQuartos = [
  {
    id_quarto: 1,
    id_hotel: 1,
    num_quarto: 101,
    andar: 1,
    tipo: 'Standard Solteiro',
    diaria: 150.0,
    status: 'Disponível'
  },
  {
    id_quarto: 2,
    id_hotel: 1,
    num_quarto: 102,
    andar: 1,
    tipo: 'Standard Casal',
    diaria: 220.0,
    status: 'Ocupado'
  },
  {
    id_quarto: 3,
    id_hotel: 1,
    num_quarto: 201,
    andar: 2,
    tipo: 'Suíte Luxo',
    diaria: 380.0,
    status: 'Disponível'
  },
  {
    id_quarto: 4,
    id_hotel: 1,
    num_quarto: 202,
    andar: 2,
    tipo: 'Suíte Executiva',
    diaria: 450.0,
    status: 'Ocupado'
  },
  {
    id_quarto: 5,
    id_hotel: 1,
    num_quarto: 301,
    andar: 3,
    tipo: 'Suíte Master Presidencial',
    diaria: 750.0,
    status: 'Disponível'
  },
  {
    id_quarto: 6,
    id_hotel: 2,
    num_quarto: 101,
    andar: 1,
    tipo: 'Boutique Casal Charm',
    diaria: 320.0,
    status: 'Disponível'
  },
  {
    id_quarto: 7,
    id_hotel: 2,
    num_quarto: 201,
    andar: 2,
    tipo: 'Boutique Executive Suite',
    diaria: 520.0,
    status: 'Disponível'
  }
];

export const mockReservas = [
  {
    id_reserva: 1,
    id_quarto: 2,
    num_quarto: 102,
    id_hospede: 101,
    nome_hospede: 'Mariana Silva',
    email_hospede: 'mariana@gmail.com',
    check_in: '2026-09-24',
    check_out: '2026-09-28',
    qtd_hospedes: 2,
    diaria: 220.0,
    taxa_cafe_manha: 35.0,
    taxa_pet: 0.0,
    taxa_refeicao: 50.0,
    taxa_almoco: 0.0,
    taxa_jantar: 0.0,
    status: 'Em andamento'
  },
  {
    id_reserva: 2,
    id_quarto: 4,
    num_quarto: 202,
    id_hospede: 102,
    nome_hospede: 'Carlos Oliveira',
    email_hospede: 'carlos@gmail.com',
    check_in: '2026-09-22',
    check_out: '2026-09-27',
    qtd_hospedes: 1,
    diaria: 450.0,
    taxa_cafe_manha: 35.0,
    taxa_pet: 40.0,
    taxa_refeicao: 0.0,
    taxa_almoco: 0.0,
    taxa_jantar: 0.0,
    status: 'Em andamento'
  },
  {
    id_reserva: 3,
    id_quarto: 3,
    num_quarto: 201,
    id_hospede: 103,
    nome_hospede: 'Beatriz Costa',
    email_hospede: 'beatriz@gmail.com',
    check_in: '2026-10-01',
    check_out: '2026-10-05',
    qtd_hospedes: 2,
    diaria: 380.0,
    taxa_cafe_manha: 70.0,
    taxa_pet: 0.0,
    taxa_refeicao: 0.0,
    taxa_almoco: 0.0,
    taxa_jantar: 0.0,
    status: 'Confirmada'
  }
];

export const allMockUsers = [
  ...mockFuncionarios,
  ...mockHospedes
];

export const initialQuartos = mockQuartos;
export const initialReservas = mockReservas;

export default {
  hoteis: mockHoteis,
  funcionarios: mockFuncionarios,
  hospedes: mockHospedes,
  quartos: mockQuartos,
  reservas: mockReservas,
  usuarios: allMockUsers,
  initialQuartos,
  initialReservas
};
