import { useState } from 'react';
import Button from '../common/Button';
import DataTable from '../common/DataTable';
import MetricCard from '../common/MetricCard';
import StatusIndicator from '../common/StatusIndicator';
import Modal from '../common/Modal';
import { TrendingUp, DollarSign, BedDouble, Users, CheckCircle2, Edit3 } from 'lucide-react';

/**
 * ManagerView (Variante Gerência Geral & Subgerência - Orientado a Reuso & POO)
 * Focado na gestão estratégica, taxa de ocupação, receitas e gestão de tarifas.
 */
export default function ManagerView({ usuario, dataManager }) {
  const [quartoEmEdicao, setQuartoEmEdicao] = useState(null);
  const [novaDiaria, setNovaDiaria] = useState('');
  const [feedback, setFeedback] = useState('');

  const quartos = dataManager.quartos;
  const reservas = dataManager.reservas;
  const hotel = dataManager.hotel;

  // Lógica OO: cálculo de ocupação e receita
  const taxaOcupacao = hotel ? hotel.calcularTaxaOcupacao(quartos) : 0;
  const faturamentoEstimado = reservas.reduce((acc, r) => acc + (r.valorTotal || 0), 0);
  const totalHospedes = dataManager.hospedes.length;

  const handleSalvarDiaria = async () => {
    if (!quartoEmEdicao || !novaDiaria) return;

    await dataManager.atualizarDiariaQuarto(quartoEmEdicao.id, novaDiaria);
    setQuartoEmEdicao(null);
    setFeedback(`Diária do Quarto ${quartoEmEdicao.numQuarto} atualizada com sucesso para R$ ${novaDiaria}!`);
    setTimeout(() => setFeedback(''), 4000);
  };

  const colunasQuartos = [
    {
      header: 'Número',
      accessor: 'numQuarto',
      render: (val) => <span className="font-semibold text-stone-900 font-mono">Quarto {val}</span>
    },
    {
      header: 'Categoria',
      accessor: 'tipo',
      render: (val) => <span className="text-stone-800 font-medium">{val}</span>
    },
    {
      header: 'Andar',
      accessor: 'andar',
      render: (val) => <span>{val}º Andar</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (val) => <StatusIndicator status={val} />
    },
    {
      header: 'Tarifa Vigente',
      accessor: 'diaria',
      align: 'right',
      render: (_, row) => (
        <span className="font-semibold text-stone-900 font-serif">
          {row.formatarDiaria ? row.formatarDiaria() : `R$ ${row.diaria}`}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-8">
      {/* Banner da Gerência */}
      <div className="bg-[#3c362a] text-[#b8c4bb] rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-bold text-[#b8c4bb]/70 block mb-1">
            Gestão Estratégica & Desempenho
          </span>
          <h2 className="text-xl font-serif font-bold text-white">
            {usuario.cargo} · {usuario.nome}
          </h2>
          <p className="text-xs text-[#b8c4bb]/80 mt-1">
            Controle de tarifas, ocupação hoteleira e faturamento consolidado.
          </p>
        </div>
        <div className="text-right text-xs">
          <span className="text-white font-medium block">{hotel ? hotel.nome : 'Anfitrião'}</span>
          <span className="text-[#b8c4bb]/70">{hotel ? hotel.getLocalizacao() : 'Copacabana, RJ'}</span>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* KPIs Gerenciais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Taxa de Ocupação"
          value={`${taxaOcupacao}%`}
          subtitle="Capacidade do hotel em uso"
          icon={TrendingUp}
          trend={{ text: 'Alta temporada', positive: true }}
        />
        <MetricCard
          title="Receita Contratada"
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(faturamentoEstimado)}
          subtitle="Total acumulado em reservas"
          icon={DollarSign}
        />
        <MetricCard
          title="Inventário de Quartos"
          value={quartos.length}
          subtitle={`${quartos.filter(q => q.isDisponivel()).length} prontos para venda`}
          icon={BedDouble}
        />
        <MetricCard
          title="Hóspedes Cadastrados"
          value={totalHospedes}
          subtitle="Base de clientes fidelizados"
          icon={Users}
        />
      </div>

      {/* Gestão de Tarifas e Tabela de Quartos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-base text-stone-900">
              Gestão de Tarifas por Acomodação
            </h3>
            <p className="text-xs text-stone-500">
              Ajuste preços de diárias conforme demanda e sazonalidade
            </p>
          </div>
        </div>

        <DataTable
          data={quartos}
          columns={colunasQuartos}
          searchPlaceholder="Filtrar quartos por número, categoria ou status..."
          actions={(quarto) => (
            <Button
              size="sm"
              variant="outline"
              className="text-xs px-2.5 py-1"
              icon={Edit3}
              onClick={() => {
                setQuartoEmEdicao(quarto);
                setNovaDiaria(String(quarto.diaria));
              }}
            >
              Ajustar Diária
            </Button>
          )}
        />
      </div>

      {/* Modal Reutilizável de Ajuste de Diária */}
      <Modal
        isOpen={Boolean(quartoEmEdicao)}
        onClose={() => setQuartoEmEdicao(null)}
        title={quartoEmEdicao ? `Ajustar Tarifa: Quarto ${quartoEmEdicao.numQuarto}` : 'Ajustar Diária'}
        subtitle={quartoEmEdicao ? `${quartoEmEdicao.tipo} · ${quartoEmEdicao.andar}º Andar` : ''}
        footer={
          <>
            <Button size="sm" variant="ghost" onClick={() => setQuartoEmEdicao(null)}>
              Cancelar
            </Button>
            <Button size="sm" variant="primary" onClick={handleSalvarDiaria}>
              Salvar Nova Tarifa
            </Button>
          </>
        }
      >
        {quartoEmEdicao && (
          <div className="space-y-3 text-xs">
            <div>
              <label className="font-medium text-stone-700 block mb-1">
                Nova Diária Padrão (R$)
              </label>
              <input
                type="number"
                step="5"
                value={novaDiaria}
                onChange={(e) => setNovaDiaria(e.target.value)}
                className="w-full p-2.5 border border-stone-300 rounded-lg text-stone-900 font-mono text-sm"
                placeholder="Ex: 280.00"
              />
              <span className="text-[11px] text-stone-500 mt-1 block">
                Valor anterior: {quartoEmEdicao.formatarDiaria()}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
