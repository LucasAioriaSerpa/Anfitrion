import { useState } from 'react';
import Button from '../common/Button';
import DataTable from '../common/DataTable';
import StatusIndicator from '../common/StatusIndicator';
import MetricCard from '../common/MetricCard';
import Modal from '../common/Modal';
import { LogIn, LogOut, CheckCircle2, UserCheck, KeyRound } from 'lucide-react';

/**
 * ReceptionView (Variante Recepção & Balcão - Orientado a Reuso & POO)
 * Focado nas operações de entrada, saída, conferência de reservas e chaves.
 */
export default function ReceptionView({ usuario, dataManager }) {
  const [feedback, setFeedback] = useState('');
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [reservaSelecionada, setReservaSelecionada] = useState(null);

  const reservas = dataManager.reservas;
  const quartos = dataManager.quartos;
  const hospedes = dataManager.hospedes;

  const totalAtivas = reservas.filter((r) => r.isAtiva()).length;
  const totalCheckins = reservas.filter((r) => r.isCheckinRealizado()).length;
  const quartosLivres = quartos.filter((q) => q.isDisponivel()).length;

  const handleCheckin = async (reserva) => {
    await dataManager.realizarCheckin(reserva.id);
    setFeedback(`Check-in realizado com sucesso para a Reserva #${reserva.id}! Quarto entregue. 🔑`);
    setTimeout(() => setFeedback(''), 4500);
  };

  const handleCheckout = async (reserva) => {
    await dataManager.realizarCheckout(reserva.id);
    setFeedback(`Check-out finalizado para a Reserva #${reserva.id}. Quarto liberado e enviado para higienização. ✨`);
    setTimeout(() => setFeedback(''), 4500);
  };

  // Colunas do componente DataTable Reutilizável
  const colunas = [
    {
      header: 'Reserva',
      accessor: 'id',
      render: (val) => <span className="font-semibold text-stone-900 font-mono">#{val}</span>
    },
    {
      header: 'Hóspede',
      accessor: (row) => row.hospede?.nome || `Hóspede #${row.idHospede}`,
      render: (_, row) => {
        const h = row.hospede || hospedes.find((item) => item.id === row.idHospede);
        return (
          <div>
            <div className="font-medium text-stone-900">{h ? h.nome : `Hóspede #${row.idHospede}`}</div>
            <div className="text-[11px] text-stone-400">{h ? h.email : '-'}</div>
          </div>
        );
      }
    },
    {
      header: 'Quarto',
      accessor: (row) => row.quarto?.numQuarto || row.idQuarto,
      render: (_, row) => {
        const q = row.quarto || quartos.find((item) => item.id === row.idQuarto);
        return (
          <div>
            <span className="font-semibold text-stone-800">Quarto {q ? q.numQuarto : row.idQuarto}</span>
            <span className="text-[11px] text-stone-400 block">{q ? q.tipo : ''}</span>
          </div>
        );
      }
    },
    {
      header: 'Período',
      accessor: (row) => `${row.dataCheckin} a ${row.dataCheckout}`,
      render: (_, row) => (
        <span className="text-stone-600">
          {row.formatarCheckin ? row.formatarCheckin() : row.dataCheckin} → {row.formatarCheckout ? row.formatarCheckout() : row.dataCheckout}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (val) => <StatusIndicator status={val} />
    },
    {
      header: 'Total',
      accessor: 'valorTotal',
      align: 'right',
      render: (_, row) => (
        <span className="font-semibold text-stone-900 font-serif">
          {row.formatarTotal ? row.formatarTotal() : `R$ ${row.valorTotal}`}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-8">
      {/* Banner da Recepção */}
      <div className="bg-[#c9d6ea]/30 border border-[#9bb2d6]/60 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-bold text-stone-600 block mb-1">
            Mesa de Operações de Entrada & Saída
          </span>
          <h2 className="text-xl font-serif font-bold text-stone-900">
            Recepção · {usuario.nome}
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Realize check-ins imediatos, confira chegadas e partidas de hóspedes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="espresso"
            icon={KeyRound}
            onClick={() => {
              const r = reservas.find((item) => item.isAtiva() && !item.isCheckinRealizado());
              if (r) {
                setReservaSelecionada(r);
                setModalDetalhesAberto(true);
              }
            }}
          >
            Próxima Chegada Pendente
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Métricas do Balcão */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Reservas Ativas"
          value={totalAtivas}
          subtitle="No sistema neste período"
          icon={UserCheck}
        />
        <MetricCard
          title="Hóspedes Instalados"
          value={totalCheckins}
          subtitle="Check-in concluído hoje"
          icon={LogIn}
        />
        <MetricCard
          title="Quartos Prontos"
          value={quartosLivres}
          subtitle="Disponíveis para check-in imediato"
          icon={KeyRound}
        />
      </div>

      {/* Tabela de Reservas e Ações da Recepção */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-base text-stone-900">
              Controle de Estadias & Hóspedes
            </h3>
            <p className="text-xs text-stone-500">
              Utilize as ações de balcão para registrar entrada e saída com liberação automática de limpeza
            </p>
          </div>
        </div>

        <DataTable
          data={reservas}
          columns={colunas}
          searchPlaceholder="Pesquisar por hóspede, quarto ou código..."
          actions={(reserva) => (
            <div className="flex items-center justify-end gap-1.5">
              {!reserva.isCheckinRealizado() && reserva.isAtiva() && (
                <Button
                  size="sm"
                  variant="primary"
                  className="text-xs px-2.5 py-1"
                  onClick={() => handleCheckin(reserva)}
                >
                  <LogIn className="w-3.5 h-3.5 mr-1" />
                  Check-in
                </Button>
              )}

              {reserva.isCheckinRealizado() && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs px-2.5 py-1"
                  onClick={() => handleCheckout(reserva)}
                >
                  <LogOut className="w-3.5 h-3.5 mr-1" />
                  Check-out
                </Button>
              )}

              <Button
                size="sm"
                variant="ghost"
                className="text-xs px-2 py-1"
                onClick={() => {
                  setReservaSelecionada(reserva);
                  setModalDetalhesAberto(true);
                }}
              >
                Detalhes
              </Button>
            </div>
          )}
        />
      </div>

      {/* Modal Reutilizável de Detalhes da Reserva */}
      <Modal
        isOpen={modalDetalhesAberto}
        onClose={() => setModalDetalhesAberto(false)}
        title={reservaSelecionada ? `Reserva #${reservaSelecionada.id}` : 'Ficha da Reserva'}
        subtitle="Registro de hospedagem e faturamento"
        footer={
          <Button size="sm" variant="ghost" onClick={() => setModalDetalhesAberto(false)}>
            Fechar Ficha
          </Button>
        }
      >
        {reservaSelecionada && (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-stone-50 rounded-xl space-y-2 border border-stone-200">
              <div className="flex justify-between">
                <span className="text-stone-500">Status Atual:</span>
                <StatusIndicator status={reservaSelecionada.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Entrada (Check-in):</span>
                <strong className="text-stone-900">{reservaSelecionada.dataCheckin}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Saída (Check-out):</span>
                <strong className="text-stone-900">{reservaSelecionada.dataCheckout}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Noites calculadas:</span>
                <span className="text-stone-900">{reservaSelecionada.calcularNoites()} noite(s)</span>
              </div>
            </div>

            <div className="p-3 bg-[#e8f7ee] rounded-xl border border-[#b8c4bb]/50 space-y-1">
              <div className="flex justify-between text-stone-700">
                <span>Café da manhã:</span>
                <span>{reservaSelecionada.cafeDaManha ? 'Incluso (+ R$ 35/dia)' : 'Não'}</span>
              </div>
              <div className="flex justify-between text-stone-700">
                <span>Almoço buffet:</span>
                <span>{reservaSelecionada.almoco ? 'Incluso (+ R$ 55/dia)' : 'Não'}</span>
              </div>
              <div className="flex justify-between text-stone-700">
                <span>Pet Friendly:</span>
                <span>{reservaSelecionada.pet ? 'Sim (+ R$ 70)' : 'Não'}</span>
              </div>
              <div className="flex justify-between text-stone-900 font-bold text-sm pt-2 border-t border-[#b8c4bb]/60">
                <span>Faturamento Total:</span>
                <span className="text-[#663f46]">
                  {reservaSelecionada.formatarTotal()}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
