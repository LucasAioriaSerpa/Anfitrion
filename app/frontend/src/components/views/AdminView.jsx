import { useState } from 'react';
import Button from '../common/Button';
import DataTable from '../common/DataTable';
import MetricCard from '../common/MetricCard';
import Modal from '../common/Modal';
import { ShieldCheck, UserPlus, PlusCircle, CheckCircle2, Building, Bed } from 'lucide-react';

/**
 * AdminView (Variante Administrador - Orientado a Reuso & POO)
 * Gestão integral do hotel: equipe de funcionários, inventário de quartos e infraestrutura.
 */
export default function AdminView({ usuario, dataManager }) {
  const [modalFuncAberto, setModalFuncAberto] = useState(false);
  const [modalQuartoAberto, setModalQuartoAberto] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Form states funcionário
  const [novoFunc, setNovoFunc] = useState({
    nome: '',
    email: '',
    cargo: 'Recepcionista',
    telefone: '',
    senha: '123'
  });

  // Form states quarto
  const [novoQuarto, setNovoQuarto] = useState({
    num_quarto: '',
    andar: 1,
    tipo: 'Standard Casal',
    diaria: '220.00'
  });

  const funcionarios = dataManager.funcionarios;
  const quartos = dataManager.quartos;
  const hotel = dataManager.hotel;

  const handleSalvarFuncionario = async (e) => {
    e.preventDefault();
    if (!novoFunc.nome || !novoFunc.email) return;

    await dataManager.adicionarFuncionario(novoFunc);
    setModalFuncAberto(false);
    setNovoFunc({ nome: '', email: '', cargo: 'Recepcionista', telefone: '', senha: '123' });
    setFeedback(`Funcionário(a) "${novoFunc.nome}" cadastrado(a) com sucesso como ${novoFunc.cargo}! 🎉`);
    setTimeout(() => setFeedback(''), 4000);
  };

  const handleSalvarQuarto = async (e) => {
    e.preventDefault();
    if (!novoQuarto.num_quarto || !novoQuarto.diaria) return;

    await dataManager.adicionarQuarto(novoQuarto);
    setModalQuartoAberto(false);
    setNovoQuarto({ num_quarto: '', andar: 1, tipo: 'Standard Casal', diaria: '220.00' });
    setFeedback(`Novo Quarto ${novoQuarto.num_quarto} (${novoQuarto.tipo}) adicionado ao inventário! 🏨`);
    setTimeout(() => setFeedback(''), 4000);
  };

  const colunasFuncionarios = [
    {
      header: 'Nome',
      accessor: 'nome',
      render: (_, row) => (
        <div>
          <div className="font-semibold text-stone-900">{row.nome}</div>
          <div className="text-[11px] text-stone-400">{row.email}</div>
        </div>
      )
    },
    {
      header: 'Cargo / Função',
      accessor: 'cargo',
      render: (val) => (
        <span className="font-medium text-stone-800 bg-stone-100 px-2 py-0.5 rounded text-[11px]">
          {val}
        </span>
      )
    },
    {
      header: 'Telefone',
      accessor: (row) => row.formatarTelefone ? row.formatarTelefone() : row.telefone
    },
    {
      header: 'Nível de Acesso',
      accessor: (row) => (row.isAdmin && row.isAdmin() ? 'Acesso Total' : 'Operacional'),
      render: (val) => (
        <span className={val === 'Acesso Total' ? 'text-[#663f46] font-bold' : 'text-stone-600'}>
          {val}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-8">
      {/* Banner do Administrador */}
      <div className="bg-[#663f46] text-white rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-[#e8f7ee]" />
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#e8f7ee]">
              Administração Geral do Sistema
            </span>
          </div>
          <h2 className="text-xl font-serif font-bold text-white">
            {usuario.nome} · Administrador
          </h2>
          <p className="text-xs text-white/80 mt-1">
            Gestão global de usuários, quadro de colaboradores e patrimônio hoteleiro.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="espresso"
            icon={UserPlus}
            onClick={() => setModalFuncAberto(true)}
          >
            Novo Colaborador
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={PlusCircle}
            onClick={() => setModalQuartoAberto(true)}
          >
            Novo Quarto
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Métricas de Administração */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Colaboradores Ativos"
          value={funcionarios.length}
          subtitle="Governança, Recepção e Gerência"
          icon={Building}
        />
        <MetricCard
          title="Total de Acomodações"
          value={quartos.length}
          subtitle="Quartos cadastrados na rede"
          icon={Bed}
        />
        <MetricCard
          title="Unidade Hoteleira"
          value={hotel ? `${hotel.estrelas} Estrelas` : '5 Estrelas'}
          subtitle={hotel ? hotel.nome : 'Anfitrião Grand Hotel'}
          icon={ShieldCheck}
        />
      </div>

      {/* Gestão do Quadro de Funcionários */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-base text-stone-900">
              Quadro de Colaboradores & Cargos
            </h3>
            <p className="text-xs text-stone-500">
              Controle de acesso por cargo (Governanta, Camareira, Recepção, Gerência e Admin)
            </p>
          </div>
        </div>

        <DataTable
          data={funcionarios}
          columns={colunasFuncionarios}
          searchPlaceholder="Buscar colaborador por nome, cargo ou e-mail..."
        />
      </div>

      {/* Modal Reutilizável de Cadastro de Novo Funcionário */}
      <Modal
        isOpen={modalFuncAberto}
        onClose={() => setModalFuncAberto(false)}
        title="Cadastrar Novo Colaborador"
        subtitle="Adicione um membro à equipe do hotel com atribuição de cargo"
        footer={
          <>
            <Button size="sm" variant="ghost" onClick={() => setModalFuncAberto(false)}>
              Cancelar
            </Button>
            <Button size="sm" variant="primary" onClick={handleSalvarFuncionario}>
              Cadastrar Colaborador
            </Button>
          </>
        }
      >
        <form onSubmit={handleSalvarFuncionario} className="space-y-3 text-xs">
          <div>
            <label className="font-medium text-stone-700 block mb-1">Nome Completo</label>
            <input
              type="text"
              required
              value={novoFunc.nome}
              onChange={(e) => setNovoFunc({ ...novoFunc, nome: e.target.value })}
              placeholder="Ex: Roberto Dias"
              className="w-full p-2 border border-stone-300 rounded-lg text-stone-800"
            />
          </div>

          <div>
            <label className="font-medium text-stone-700 block mb-1">E-mail Corporativo</label>
            <input
              type="email"
              required
              value={novoFunc.email}
              onChange={(e) => setNovoFunc({ ...novoFunc, email: e.target.value })}
              placeholder="roberto@anfitrion.com"
              className="w-full p-2 border border-stone-300 rounded-lg text-stone-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-stone-700 block mb-1">Cargo / Função</label>
              <select
                value={novoFunc.cargo}
                onChange={(e) => setNovoFunc({ ...novoFunc, cargo: e.target.value })}
                className="w-full p-2 border border-stone-300 rounded-lg text-stone-800 bg-white"
              >
                <option value="Recepcionista">Recepcionista</option>
                <option value="Governanta Chefe">Governanta Chefe</option>
                <option value="Camareira Sênior">Camareira Sênior</option>
                <option value="Subgerente Operacional">Subgerente Operacional</option>
                <option value="Gerente Geral">Gerente Geral</option>
                <option value="Administrador">Administrador</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-stone-700 block mb-1">Telefone</label>
              <input
                type="text"
                value={novoFunc.telefone}
                onChange={(e) => setNovoFunc({ ...novoFunc, telefone: e.target.value })}
                placeholder="(21) 98888-0000"
                className="w-full p-2 border border-stone-300 rounded-lg text-stone-800"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal Reutilizável de Cadastro de Quarto */}
      <Modal
        isOpen={modalQuartoAberto}
        onClose={() => setModalQuartoAberto(false)}
        title="Cadastrar Nova Acomodação"
        subtitle="Adicione um novo quarto ao inventário do hotel"
        footer={
          <>
            <Button size="sm" variant="ghost" onClick={() => setModalQuartoAberto(false)}>
              Cancelar
            </Button>
            <Button size="sm" variant="primary" onClick={handleSalvarQuarto}>
              Cadastrar Quarto
            </Button>
          </>
        }
      >
        <form onSubmit={handleSalvarQuarto} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-stone-700 block mb-1">Número do Quarto</label>
              <input
                type="number"
                required
                value={novoQuarto.num_quarto}
                onChange={(e) => setNovoQuarto({ ...novoQuarto, num_quarto: e.target.value })}
                placeholder="Ex: 305"
                className="w-full p-2 border border-stone-300 rounded-lg text-stone-800"
              />
            </div>
            <div>
              <label className="font-medium text-stone-700 block mb-1">Andar</label>
              <input
                type="number"
                min="1"
                max="20"
                required
                value={novoQuarto.andar}
                onChange={(e) => setNovoQuarto({ ...novoQuarto, andar: e.target.value })}
                className="w-full p-2 border border-stone-300 rounded-lg text-stone-800"
              />
            </div>
          </div>

          <div>
            <label className="font-medium text-stone-700 block mb-1">Categoria</label>
            <select
              value={novoQuarto.tipo}
              onChange={(e) => setNovoQuarto({ ...novoQuarto, tipo: e.target.value })}
              className="w-full p-2 border border-stone-300 rounded-lg text-stone-800 bg-white"
            >
              <option value="Standard Solteiro">Standard Solteiro</option>
              <option value="Standard Casal">Standard Casal</option>
              <option value="Suíte Luxo">Suíte Luxo</option>
              <option value="Suíte Executiva">Suíte Executiva</option>
              <option value="Suíte Master Presidencial">Suíte Master Presidencial</option>
            </select>
          </div>

          <div>
            <label className="font-medium text-stone-700 block mb-1">Valor da Diária (R$)</label>
            <input
              type="number"
              step="5"
              required
              value={novoQuarto.diaria}
              onChange={(e) => setNovoQuarto({ ...novoQuarto, diaria: e.target.value })}
              placeholder="Ex: 250.00"
              className="w-full p-2 border border-stone-300 rounded-lg text-stone-800"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
