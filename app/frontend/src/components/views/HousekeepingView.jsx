import { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import StatusIndicator from '../common/StatusIndicator';
import MetricCard from '../common/MetricCard';
import { Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

/**
 * HousekeepingView (Variante Governança & Camareira - Orientado a Reuso & POO)
 * Focado no ciclo operacional de higienização, liberação de quartos e checklist.
 */
export default function HousekeepingView({ usuario, dataManager }) {
  const [andarFiltro, setAndarFiltro] = useState('todos');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const quartos = dataManager.quartos;

  // Métricas operacionais
  const quartosLimpos = quartos.filter((q) => q.isDisponivel()).length;
  const quartosEmLimpeza = quartos.filter((q) => q.isEmLimpeza()).length;
  const quartosOcupados = quartos.filter((q) => q.isOcupado()).length;
  const quartosManutencao = quartos.filter((q) => q.isManutencao()).length;

  const handleMudarStatus = async (quarto, novoStatus) => {
    await dataManager.atualizarStatusQuarto(quarto.id, novoStatus);
    setFeedbackMsg(`Status do Quarto ${quarto.numQuarto} atualizado para "${novoStatus}"! ✨`);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const quartosFiltrados = quartos.filter((q) => {
    if (andarFiltro !== 'todos' && q.andar !== Number(andarFiltro)) return false;
    if (statusFiltro === 'limpeza' && !q.isEmLimpeza()) return false;
    if (statusFiltro === 'disponivel' && !q.isDisponivel()) return false;
    if (statusFiltro === 'ocupado' && !q.isOcupado()) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Banner de Identificação da Equipe de Governança */}
      <div className="bg-[#f4f3ec] border border-stone-300/80 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-bold text-stone-500 block mb-1">
            Painel Operacional de Higienização & Governança
          </span>
          <h2 className="text-xl font-serif font-bold text-stone-900">
            {usuario.cargo} · {usuario.nome}
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Gerenciamento e ciclo de limpeza dos quartos do Anfitrião Grand Hotel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => dataManager.inicializar()}
          >
            Sincronizar Andares
          </Button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Indicadores Operacionais de Limpeza */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Higienizados / Livres"
          value={quartosLimpos}
          subtitle="Aptos para novos hóspedes"
          icon={CheckCircle2}
        />
        <MetricCard
          title="Fila de Limpeza"
          value={quartosEmLimpeza}
          subtitle="Requerem higienização agora"
          icon={Sparkles}
        />
        <MetricCard
          title="Quartos Ocupados"
          value={quartosOcupados}
          subtitle="Hóspedes instalados"
          icon={ShieldCheck}
        />
        <MetricCard
          title="Em Manutenção"
          value={quartosManutencao}
          subtitle="Reparos técnicos pendentes"
          icon={AlertTriangle}
        />
      </div>

      {/* Controles de Filtro e Ciclo de Quartos */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="font-serif font-bold text-base text-stone-900">
            Quartos por Andar & Estado
          </h3>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-stone-500 font-medium">Andar:</span>
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg">
              {['todos', '1', '2', '3'].map((andar) => (
                <button
                  key={andar}
                  type="button"
                  onClick={() => setAndarFiltro(andar)}
                  className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                    andarFiltro === andar ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {andar === 'todos' ? 'Todos' : `${andar}º Andar`}
                </button>
              ))}
            </div>

            <span className="text-stone-500 font-medium ml-2">Status:</span>
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'limpeza', label: 'Em Limpeza' },
                { id: 'disponivel', label: 'Disponível' },
                { id: 'ocupado', label: 'Ocupado' }
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatusFiltro(st.id)}
                  className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                    statusFiltro === st.id ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid de Quartos para Ação Imediata da Camareira */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quartosFiltrados.map((quarto) => (
            <Card key={quarto.id} variant="default" className="flex flex-col justify-between">
              <Card.Header action={<StatusIndicator status={quarto.status} />}>
                <Card.Title>Quarto {quarto.numQuarto}</Card.Title>
                <Card.Description>
                  {quarto.andar}º Andar · {quarto.tipo}
                </Card.Description>
              </Card.Header>

              <Card.Body>
                <div className="space-y-3 text-xs text-stone-600">
                  <div className="p-2.5 bg-stone-50 rounded-lg space-y-1">
                    <span className="font-semibold text-stone-700 block text-[11px] uppercase">
                      Checklist Rápido:
                    </span>
                    <div>• Roupa de cama & toalhas esterilizadas</div>
                    <div>• Reposição de amenities e frigobar</div>
                    <div>• Aspiração e higienização do banheiro</div>
                  </div>
                </div>
              </Card.Body>

              <Card.Footer>
                <div className="w-full flex items-center justify-between gap-2">
                  {quarto.isEmLimpeza() ? (
                    <Button
                      size="sm"
                      variant="primary"
                      className="w-full text-xs"
                      onClick={() => handleMudarStatus(quarto, 'Disponível')}
                    >
                      ✓ Marcar como Higienizado (Liberar)
                    </Button>
                  ) : quarto.isDisponivel() ? (
                    <div className="w-full flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-1/2 text-xs"
                        onClick={() => handleMudarStatus(quarto, 'Em Limpeza')}
                      >
                        Iniciar Limpeza
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-1/2 text-xs"
                        onClick={() => handleMudarStatus(quarto, 'Manutenção')}
                      >
                        Reparo
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full flex items-center justify-between">
                      <span className="text-[11px] text-stone-500">Hóspede no quarto</span>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="text-xs"
                        onClick={() => handleMudarStatus(quarto, 'Em Limpeza')}
                      >
                        Solicitar Limpeza
                      </Button>
                    </div>
                  )}
                </div>
              </Card.Footer>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
