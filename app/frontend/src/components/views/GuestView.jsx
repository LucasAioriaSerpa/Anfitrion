import { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import StatusIndicator from '../common/StatusIndicator';
import MetricCard from '../common/MetricCard';
import { Bed, Calendar, CheckCircle2, Coffee, ShieldCheck } from 'lucide-react';

/**
 * GuestView (Variante Hóspede - Orientado a Reuso & POO)
 * Utiliza instâncias de Quarto e Reserva para orquestrar a jornada do hóspede.
 */
export default function GuestView({ usuario, dataManager }) {
  const [quartoSelecionado, setQuartoSelecionado] = useState(null);
  const [modalReservaAberto, setModalReservaAberto] = useState(false);
  const [sucessoMsg, setSucessoMsg] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');

  // Form states de reserva (com inicializadores de estado puro para conformidade com regras React)
  const [hoje] = useState(() => new Date().toISOString().split('T')[0]);
  const [checkin, setCheckin] = useState(() => new Date().toISOString().split('T')[0]);
  const [checkout, setCheckout] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [cafeDaManha, setCafeDaManha] = useState(true);
  const [almoco, setAlmoco] = useState(false);
  const [pet, setPet] = useState(false);

  const quartos = dataManager.quartos;
  const reservas = dataManager.reservas;
  const minhasReservas = reservas.filter((r) => r.idHospede === usuario.id);

  // Filtro
  const quartosDisponiveis = quartos.filter((q) => {
    if (!q.isDisponivel()) return false;
    if (filtroTipo === 'todos') return true;
    return q.tipo.toLowerCase().includes(filtroTipo.toLowerCase());
  });

  const abrirModalReserva = (quarto) => {
    setQuartoSelecionado(quarto);
    setModalReservaAberto(true);
  };

  // Cálculo prévio no front usando lógica OO
  const calcularEstimativa = () => {
    if (!quartoSelecionado) return { noites: 1, total: 0 };
    const entrada = new Date(checkin);
    const saida = new Date(checkout);
    const noites = Math.max(1, Math.ceil((saida - entrada) / (1000 * 3600 * 24)));
    let total = quartoSelecionado.diaria * noites;
    if (cafeDaManha) total += 35 * noites;
    if (almoco) total += 55 * noites;
    if (pet) total += 70;
    return { noites, total };
  };

  const handleConfirmarReserva = async () => {
    if (!quartoSelecionado) return;

    await dataManager.criarReserva({
      idQuarto: quartoSelecionado.id,
      idHospede: usuario.id,
      dataCheckin: checkin,
      dataCheckout: checkout,
      cafeDaManha,
      pet,
      almoco
    });

    setModalReservaAberto(false);
    setSucessoMsg(`Reserva confirmada no Quarto ${quartoSelecionado.numQuarto} (${quartoSelecionado.tipo})! Bom descanso! 🎉`);
    setTimeout(() => setSucessoMsg(''), 5000);
  };

  const handleCancelarReserva = async (idReserva) => {
    if (window.confirm('Deseja realmente cancelar esta reserva?')) {
      await dataManager.cancelarReserva(idReserva);
    }
  };

  const { noites, total } = calcularEstimativa();

  return (
    <div className="space-y-8">
      {/* Banner de Boas-vindas ao Hóspede */}
      <div className="bg-[#e8f7ee] border border-[#b8c4bb]/40 rounded-2xl p-6 text-[#3c362a] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold tracking-tight text-stone-900">
            Olá, {usuario.getPrimeiroNome ? usuario.getPrimeiroNome() : usuario.nome}!
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Seja muito bem-vindo ao Anfitrião Grand Hotel & Resort. Selecione sua acomodação ou acompanhe suas estadias.
          </p>
        </div>
        <div className="text-xs text-stone-600 space-y-1 shrink-0">
          <div>• Telefone: <strong className="text-stone-800">{usuario.formatarTelefone ? usuario.formatarTelefone() : usuario.telefone}</strong></div>
          <div>• E-mail: <strong className="text-stone-800">{usuario.email}</strong></div>
        </div>
      </div>

      {sucessoMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{sucessoMsg}</span>
        </div>
      )}

      {/* Métricas Rápidas do Hóspede */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Minhas Reservas Ativas"
          value={minhasReservas.filter((r) => r.isAtiva()).length}
          subtitle="Estadias programadas"
          icon={Calendar}
        />
        <MetricCard
          title="Quartos Disponíveis Hoje"
          value={quartosDisponiveis.length}
          subtitle="Prontos para reserva imediata"
          icon={Bed}
        />
        <MetricCard
          title="Programa Fidelidade"
          value={minhasReservas.length > 3 ? "Gold (10% OFF)" : "Standard"}
          subtitle={`${minhasReservas.length} estadias realizadas`}
          icon={ShieldCheck}
        />
      </div>

      {/* Minhas Reservas Recentes */}
      {minhasReservas.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-stone-900">
              Minhas Reservas
            </h3>
            <span className="text-xs text-stone-500">
              {minhasReservas.length} reserva(s) no sistema
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {minhasReservas.map((res) => {
              const q = res.quarto || quartos.find((item) => item.id === res.idQuarto);
              return (
                <Card key={res.id} variant="default" className="flex flex-col justify-between">
                  <Card.Header
                    action={<StatusIndicator status={res.status} />}
                  >
                    <Card.Title>
                      {q ? `Quarto ${q.numQuarto} - ${q.tipo}` : `Quarto #${res.idQuarto}`}
                    </Card.Title>
                    <Card.Description>
                      Check-in: {res.formatarCheckin ? res.formatarCheckin() : res.dataCheckin} até {res.formatarCheckout ? res.formatarCheckout() : res.dataCheckout}
                    </Card.Description>
                  </Card.Header>

                  <Card.Body>
                    <div className="space-y-2 text-xs text-stone-600">
                      <div className="flex justify-between">
                        <span>Duração:</span>
                        <strong className="text-stone-800">{res.calcularNoites ? res.calcularNoites() : 1} noite(s)</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Serviços Adicionais:</span>
                        <span>
                          {[
                            res.cafeDaManha ? 'Café da manhã' : null,
                            res.almoco ? 'Almoço buffet' : null,
                            res.pet ? 'Acomodação Pet' : null
                          ].filter(Boolean).join(', ') || 'Sem adicionais'}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-stone-100 text-sm font-semibold text-stone-900">
                        <span>Total:</span>
                        <span className="text-[#663f46] font-bold">
                          {res.formatarTotal ? res.formatarTotal() : `R$ ${res.valorTotal}`}
                        </span>
                      </div>
                    </div>
                  </Card.Body>

                  {res.isAtiva && res.isAtiva() && (
                    <Card.Footer>
                      <span className="text-[11px] text-stone-500">Cancelamento gratuito até 24h antes</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-700 hover:text-red-800 hover:bg-red-50 text-xs"
                        onClick={() => handleCancelarReserva(res.id)}
                      >
                        Cancelar Reserva
                      </Button>
                    </Card.Footer>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Catálogo de Quartos para Reserva */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif font-bold text-base text-stone-900">
              Quartos Disponíveis para Reserva
            </h3>
            <p className="text-xs text-stone-500">
              Escolha seu quarto e personalize sua estadia
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg text-xs">
            {['todos', 'standard', 'luxo', 'executiva', 'master'].map((tipo) => (
              <button
                key={tipo}
                type="button"
                onClick={() => setFiltroTipo(tipo)}
                className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                  filtroTipo === tipo
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {quartosDisponiveis.map((quarto) => (
            <Card key={quarto.id} variant="default" className="flex flex-col justify-between">
              <Card.Header
                action={<StatusIndicator status={quarto.status} />}
              >
                <Card.Title>Quarto {quarto.numQuarto}</Card.Title>
                <Card.Description>
                  {quarto.tipo} · {quarto.andar}º Andar
                </Card.Description>
              </Card.Header>

              <Card.Body>
                <div className="space-y-3">
                  <div className="text-xs text-stone-600 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Bed className="w-3.5 h-3.5 text-stone-400" />
                      <span>Cama king-size, ar split & TV smart 50"</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Coffee className="w-3.5 h-3.5 text-stone-400" />
                      <span>Frigobar e cafeteira cortesia</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-baseline justify-between">
                    <span className="text-xs text-stone-500">Diária:</span>
                    <div className="text-right">
                      <span className="text-lg font-serif font-bold text-stone-900">
                        {quarto.formatarDiaria ? quarto.formatarDiaria() : `R$ ${quarto.diaria}`}
                      </span>
                      <span className="text-[11px] text-stone-400 block">/noite</span>
                    </div>
                  </div>
                </div>
              </Card.Body>

              <Card.Footer>
                <span className="text-[11px] text-emerald-800 font-medium">✓ Pronto para hospedagem</span>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => abrirModalReserva(quarto)}
                >
                  Reservar Agora
                </Button>
              </Card.Footer>
            </Card>
          ))}
        </div>
      </div>

      {/* Modal Reutilizável de Confirmação de Reserva */}
      <Modal
        isOpen={modalReservaAberto}
        onClose={() => setModalReservaAberto(false)}
        title={quartoSelecionado ? `Reservar Quarto ${quartoSelecionado.numQuarto}` : 'Nova Reserva'}
        subtitle={quartoSelecionado ? `${quartoSelecionado.tipo} · ${quartoSelecionado.andar}º Andar` : ''}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setModalReservaAberto(false)}>
              Voltar
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirmarReserva}>
              Confirmar Reserva ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)})
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-stone-700 block mb-1">Data de Check-in</label>
              <input
                type="date"
                value={checkin}
                min={hoje}
                onChange={(e) => setCheckin(e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-lg text-stone-800"
              />
            </div>
            <div>
              <label className="font-medium text-stone-700 block mb-1">Data de Check-out</label>
              <input
                type="date"
                value={checkout}
                min={checkin}
                onChange={(e) => setCheckout(e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-lg text-stone-800"
              />
            </div>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl space-y-2 border border-stone-200">
            <span className="font-semibold text-stone-800 block">Personalize sua Hospedagem:</span>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={cafeDaManha}
                onChange={(e) => setCafeDaManha(e.target.checked)}
                className="rounded text-[#663f46]"
              />
              <span className="text-stone-700">Café da Manhã Colonial (+ R$ 35/noite)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={almoco}
                onChange={(e) => setAlmoco(e.target.checked)}
                className="rounded text-[#663f46]"
              />
              <span className="text-stone-700">Almoço Executivo Buffet (+ R$ 55/noite)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={pet}
                onChange={(e) => setPet(e.target.checked)}
                className="rounded text-[#663f46]"
              />
              <span className="text-stone-700">Hospedagem Pet Friendly (+ R$ 70 taxa única)</span>
            </label>
          </div>

          <div className="p-3 bg-[#e8f7ee] rounded-xl border border-[#b8c4bb]/60 space-y-1">
            <div className="flex justify-between text-stone-700">
              <span>Período da estadia:</span>
              <span className="font-medium">{noites} noite(s)</span>
            </div>
            <div className="flex justify-between text-stone-700">
              <span>Diária do quarto:</span>
              <span className="font-medium">{quartoSelecionado ? quartoSelecionado.formatarDiaria() : '-'}</span>
            </div>
            <div className="flex justify-between text-stone-900 font-bold text-sm pt-1 border-t border-[#b8c4bb]/50">
              <span>Valor Total Previsto:</span>
              <span className="text-[#663f46]">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
              </span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
