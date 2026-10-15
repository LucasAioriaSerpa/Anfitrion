import { useMemo, useState } from "react";
import Card from "../common/Card";
import Button from "../common/Button";
import Modal from "../common/Modal";
import StatusIndicator from "../common/StatusIndicator";
import DataTable from "../common/DataTable";
import { ArrowLeft, Bed, Eye, MapPin, Pencil, Trash2 } from "lucide-react";

const TAXA_CAFE = 35;
const TAXA_ALMOCO = 55;
const TAXA_JANTAR = 65;
const TAXA_PET = 70;

function sameId(a, b) {
  return Number(a) === Number(b);
}

function hojeISO() {
  return new Date().toISOString().split("T")[0];
}

function maisDiasISO(dias) {
  const data = new Date();
  data.setDate(data.getDate() + dias);
  return data.toISOString().split("T")[0];
}

function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor) || 0);
}

function formVazio() {
  return {
    checkin: hojeISO(),
    checkout: maisDiasISO(2),
    cafeDaManha: false,
    almoco: false,
    jantar: false,
    pet: false,
    qtdHospedes: 1,
  };
}

function estimarTotal(quarto, form) {
  const entrada = new Date(form.checkin);
  const saida = new Date(form.checkout);
  const noites = Math.max(
    1,
    Math.ceil((saida - entrada) / (1000 * 3600 * 24)) || 1,
  );
  const valorReserva = Number(quarto?.diaria) * noites || 0;
  const extras = [];
  if (form.cafeDaManha) {
    extras.push({
      campo: "cafeDaManha",
      label: "Café da manhã",
      valor: TAXA_CAFE * noites,
    });
  }
  if (form.almoco) {
    extras.push({
      campo: "almoco",
      label: "Almoço",
      valor: TAXA_ALMOCO * noites,
    });
  }
  if (form.jantar) {
    extras.push({
      campo: "jantar",
      label: "Jantar",
      valor: TAXA_JANTAR * noites,
    });
  }
  if (form.pet) {
    extras.push({ campo: "pet", label: "Pet", valor: TAXA_PET });
  }
  const total =
    valorReserva + extras.reduce((soma, extra) => soma + extra.valor, 0);
  return { noites, valorReserva, extras, total };
}

function ReservaFormFields({ form, setForm, minCheckin, readOnly = false }) {
  const setCampo = (campo, valor) =>
    setForm((atual) => ({ ...atual, [campo]: valor }));

  return (
    <div className="space-y-4 text-xs">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-medium text-stone-700 block mb-1">
            Check-in
          </label>
          <input
            type="date"
            value={form.checkin}
            min={minCheckin}
            disabled={readOnly}
            onChange={(e) => setCampo("checkin", e.target.value)}
            className="w-full p-2 border border-stone-300 rounded-lg text-stone-800 disabled:bg-stone-50"
          />
        </div>
        <div>
          <label className="font-medium text-stone-700 block mb-1">
            Check-out
          </label>
          <input
            type="date"
            value={form.checkout}
            min={form.checkin || minCheckin}
            disabled={readOnly}
            onChange={(e) => setCampo("checkout", e.target.value)}
            className="w-full p-2 border border-stone-300 rounded-lg text-stone-800 disabled:bg-stone-50"
          />
        </div>
      </div>

      <div>
        <label className="font-medium text-stone-700 block mb-1">
          Quantidade de hóspedes
        </label>
        <input
          type="number"
          min={1}
          max={6}
          value={form.qtdHospedes}
          disabled={readOnly}
          onChange={(e) =>
            setCampo("qtdHospedes", Math.max(1, Number(e.target.value) || 1))
          }
          className="w-full p-2 border border-stone-300 rounded-lg text-stone-800 disabled:bg-stone-50"
        />
      </div>

      <div className="p-3 bg-stone-50 rounded-xl space-y-2 border border-stone-200">
        <span className="font-semibold text-stone-800 block">
          Serviços adicionais
        </span>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.cafeDaManha}
            disabled={readOnly}
            onChange={(e) => setCampo("cafeDaManha", e.target.checked)}
          />
          <span className="text-stone-700">
            Café da manhã (+ {formatarMoeda(TAXA_CAFE)}/noite)
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.almoco}
            disabled={readOnly}
            onChange={(e) => setCampo("almoco", e.target.checked)}
          />
          <span className="text-stone-700">
            Almoço (+ {formatarMoeda(TAXA_ALMOCO)}/noite)
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.jantar}
            disabled={readOnly}
            onChange={(e) => setCampo("jantar", e.target.checked)}
          />
          <span className="text-stone-700">
            Jantar (+ {formatarMoeda(TAXA_JANTAR)}/noite)
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.pet}
            disabled={readOnly}
            onChange={(e) => setCampo("pet", e.target.checked)}
          />
          <span className="text-stone-700">
            Pet (+ {formatarMoeda(TAXA_PET)} taxa única)
          </span>
        </label>
      </div>
    </div>
  );
}

export default function GuestView({ usuario, dataManager }) {
  const [hotelSelecionado, setHotelSelecionado] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalModo, setModalModo] = useState("create");
  const [quartoAlvo, setQuartoAlvo] = useState(null);
  const [reservaAlvo, setReservaAlvo] = useState(null);
  const [form, setForm] = useState(formVazio);
  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [erro, setErro] = useState("");

  const hoteis = dataManager.hoteis;
  const quartos = dataManager.quartos;
  const reservas = dataManager.reservas;
  const hoje = hojeISO();

  const minhasReservas = useMemo(
    () => reservas.filter((r) => sameId(r.idHospede, usuario.id)),
    [reservas, usuario.id],
  );

  const quartosDoHotel = useMemo(() => {
    if (!hotelSelecionado) return [];
    return quartos.filter((q) => sameId(q.idHotel, hotelSelecionado.id));
  }, [quartos, hotelSelecionado]);

  const quartosDisponiveis = useMemo(
    () => quartosDoHotel.filter((q) => q.isDisponivel()),
    [quartosDoHotel],
  );

  const reservasDoHotel = useMemo(() => {
    if (!hotelSelecionado) return [];
    return minhasReservas.filter((r) => {
      const quarto =
        r.quarto || quartos.find((q) => sameId(q.id, r.idQuarto));
      const idHotel = r.idHotel ?? quarto?.idHotel;
      return sameId(idHotel, hotelSelecionado.id);
    });
  }, [minhasReservas, hotelSelecionado, quartos]);

  const tiposDisponiveis = [
    ...new Set(quartosDisponiveis.map((q) => q.tipo).filter(Boolean)),
  ];

  const { noites, valorReserva, extras, total } = estimarTotal(
    quartoAlvo || reservaAlvo?.quarto,
    form,
  );

  const mostrarFeedback = (mensagem, tipo = "ok") => {
    if (tipo === "erro") {
      setErro(mensagem);
      setFeedback("");
    } else {
      setFeedback(mensagem);
      setErro("");
    }
    window.setTimeout(() => {
      setFeedback("");
      setErro("");
    }, 4500);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setQuartoAlvo(null);
    setReservaAlvo(null);
    setForm(formVazio());
  };

  const abrirCriacao = (quarto) => {
    setModalModo("create");
    setQuartoAlvo(quarto);
    setReservaAlvo(null);
    setForm(formVazio());
    setModalAberto(true);
  };

  const abrirEdicao = (reserva) => {
    const quarto =
      reserva.quarto || quartos.find((q) => sameId(q.id, reserva.idQuarto));
    setModalModo("edit");
    setReservaAlvo(reserva);
    setQuartoAlvo(quarto || null);
    setForm({
      checkin: reserva.dataCheckin,
      checkout: reserva.dataCheckout,
      cafeDaManha: Boolean(reserva.cafeDaManha),
      almoco: Boolean(reserva.almoco),
      jantar: Boolean(reserva.jantar),
      pet: Boolean(reserva.pet),
      qtdHospedes: reserva.qtdHospedes || 1,
    });
    setModalAberto(true);
  };

  const abrirVisualizacao = (reserva) => {
    const quarto =
      reserva.quarto || quartos.find((q) => sameId(q.id, reserva.idQuarto));
    setModalModo("view");
    setReservaAlvo(reserva);
    setQuartoAlvo(quarto || null);
    setForm({
      checkin: reserva.dataCheckin,
      checkout: reserva.dataCheckout,
      cafeDaManha: Boolean(reserva.cafeDaManha),
      almoco: Boolean(reserva.almoco),
      jantar: Boolean(reserva.jantar),
      pet: Boolean(reserva.pet),
      qtdHospedes: reserva.qtdHospedes || 1,
    });
    setModalAberto(true);
  };

  const handleSalvar = async () => {
    if (!form.checkin || !form.checkout) {
      mostrarFeedback("Informe as datas de check-in e check-out.", "erro");
      return;
    }
    if (form.checkout <= form.checkin) {
      mostrarFeedback("O check-out precisa ser depois do check-in.", "erro");
      return;
    }

    setSalvando(true);
    try {
      if (modalModo === "create") {
        if (!quartoAlvo) return;
        const resultado = await dataManager.criarReserva({
          idQuarto: quartoAlvo.id,
          idHospede: usuario.id,
          dataCheckin: form.checkin,
          dataCheckout: form.checkout,
          cafeDaManha: form.cafeDaManha,
          almoco: form.almoco,
          jantar: form.jantar,
          pet: form.pet,
          qtdHospedes: form.qtdHospedes,
        });
        if (!resultado?.ok) {
          mostrarFeedback(
            resultado?.message || "Não foi possível criar a reserva.",
            "erro",
          );
          return;
        }
        fecharModal();
        mostrarFeedback(
          `Reserva feita no quarto ${quartoAlvo.numQuarto} do ${hotelSelecionado.nome}.`,
        );
        return;
      }

      if (modalModo === "edit" && reservaAlvo) {
        const resultado = await dataManager.atualizarReserva(reservaAlvo.id, {
          dataCheckin: form.checkin,
          dataCheckout: form.checkout,
          cafeDaManha: form.cafeDaManha,
          almoco: form.almoco,
          jantar: form.jantar,
          pet: form.pet,
          qtdHospedes: form.qtdHospedes,
        });
        if (!resultado?.ok) {
          mostrarFeedback(
            resultado?.message || "Não foi possível atualizar a reserva.",
            "erro",
          );
          return;
        }
        fecharModal();
        mostrarFeedback("Reserva atualizada.");
      }
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async (reserva) => {
    const quarto =
      reserva.quarto || quartos.find((q) => sameId(q.id, reserva.idQuarto));
    const label = quarto
      ? `quarto ${quarto.numQuarto}`
      : `reserva #${reserva.id}`;
    if (!window.confirm(`Excluir a reserva do ${label}?`)) return;

    const resultado = await dataManager.excluirReserva(reserva.id);
    if (!resultado?.ok) {
      mostrarFeedback(
        resultado?.message || "Não foi possível excluir a reserva.",
        "erro",
      );
      return;
    }
    mostrarFeedback(resultado.message);
  };

  const tituloModal =
    modalModo === "create"
      ? quartoAlvo
        ? `Reservar quarto ${quartoAlvo.numQuarto}`
        : "Nova reserva"
      : modalModo === "edit"
        ? `Editar reserva #${reservaAlvo?.id ?? ""}`
        : `Reserva #${reservaAlvo?.id ?? ""}`;

  const subtituloModal = quartoAlvo
    ? `${quartoAlvo.tipo} · ${quartoAlvo.andar}º andar · ${quartoAlvo.formatarDiaria()}/noite`
    : reservaAlvo
      ? `${reservaAlvo.quartoTipo || "Quarto"} ${reservaAlvo.quartoNumero || reservaAlvo.idQuarto}`
      : "";

  if (!dataManager.inicializado) {
    return (
      <p className="text-sm text-stone-500">Carregando hotéis e reservas...</p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#e8f7ee] border border-[#b8c4bb]/40 rounded-2xl p-6 text-[#3c362a] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold tracking-tight text-stone-900">
            Olá, {usuario.getPrimeiroNome?.() || usuario.nome}
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            {hotelSelecionado
              ? `Quartos disponíveis em ${hotelSelecionado.nome}.`
              : "Escolha um hotel para ver os quartos disponíveis e gerenciar suas reservas."}
          </p>
        </div>
        <div className="text-xs text-stone-600 space-y-1 shrink-0">
          <div>
            Telefone:{" "}
            <strong className="text-stone-800">
              {usuario.formatarTelefone?.() || usuario.telefone}
            </strong>
          </div>
          <div>
            E-mail:{" "}
            <strong className="text-stone-800">{usuario.email}</strong>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl">
          {feedback}
        </div>
      )}
      {erro && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
          {erro}
        </div>
      )}

      {!hotelSelecionado ? (
        <section className="space-y-4">
          <div>
            <h3 className="font-serif font-bold text-base text-stone-900">
              Hotéis
            </h3>
            <p className="text-xs text-stone-500">
              Selecione um hotel para ver apenas os quartos disponíveis daquela
              unidade.
            </p>
          </div>

          {hoteis.length === 0 ? (
            <p className="text-sm text-stone-500">
              Nenhum hotel cadastrado no momento.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {hoteis.map((hotel) => {
                const doHotel = quartos.filter((q) =>
                  sameId(q.idHotel, hotel.id),
                );
                const disponiveis = doHotel.filter((q) => q.isDisponivel());
                const minhasNesteHotel = minhasReservas.filter((r) => {
                  const quarto =
                    r.quarto || quartos.find((q) => sameId(q.id, r.idQuarto));
                  return sameId(r.idHotel ?? quarto?.idHotel, hotel.id);
                }).length;

                return (
                  <Card
                    key={hotel.id}
                    onClick={() => setHotelSelecionado(hotel)}
                    className="flex flex-col justify-between"
                  >
                    <Card.Header>
                      <Card.Title>{hotel.nome}</Card.Title>
                      <Card.Description>
                        {hotel.franquia || "Anfitrião"}
                      </Card.Description>
                    </Card.Header>
                    <Card.Body>
                      <div className="space-y-2 text-xs text-stone-600">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 mt-0.5 shrink-0" />
                          <span>{hotel.getEnderecoCompleto()}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Bed className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>
                            {disponiveis.length} disponível(is) de{" "}
                            {doHotel.length || hotel.totalQuartos || 0} quartos
                          </span>
                        </div>
                        {minhasNesteHotel > 0 && (
                          <p className="text-stone-500">
                            Você tem {minhasNesteHotel} reserva(s) neste hotel.
                          </p>
                        )}
                      </div>
                    </Card.Body>
                    <Card.Footer>
                      <span className="text-[11px] text-stone-500">
                        Ver quartos e reservas
                      </span>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => setHotelSelecionado(hotel)}
                      >
                        Selecionar
                      </Button>
                    </Card.Footer>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        <section className="space-y-6">
          <div className="bg-white rounded-xl border border-stone-200/80 shadow-xs px-4 py-3 flex flex-col lg:flex-row lg:items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              icon={ArrowLeft}
              onClick={() => setHotelSelecionado(null)}
            >
              Hotéis
            </Button>
            <div className="hidden lg:block h-8 w-px bg-stone-200" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-stone-900 truncate">
                {hotelSelecionado.nome}
              </p>
              <p className="text-[11px] text-stone-500 truncate">
                {hotelSelecionado.getEnderecoCompleto()}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-stone-600">
              <span>
                <strong className="text-stone-900">
                  {quartosDisponiveis.length}
                </strong>{" "}
                disponíveis
              </span>
              <span>
                <strong className="text-stone-900">
                  {quartosDoHotel.length}
                </strong>{" "}
                quartos no hotel
              </span>
              <span className="truncate max-w-[16rem]">
                {tiposDisponiveis.length
                  ? tiposDisponiveis.join(" · ")
                  : "Nenhum tipo disponível"}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900">
                Quartos disponíveis
              </h3>
              <p className="text-xs text-stone-500">
                Somente quartos livres deste hotel. Ao reservar, o quarto deixa
                de aparecer aqui.
              </p>
            </div>

            {quartosDisponiveis.length === 0 ? (
              <p className="text-sm text-stone-500">
                Não há quartos disponíveis neste hotel no momento.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {quartosDisponiveis.map((quarto) => (
                  <Card
                    key={quarto.id}
                    className="flex flex-col justify-between"
                  >
                    <Card.Header
                      action={<StatusIndicator status={quarto.status} />}
                    >
                      <Card.Title>Quarto {quarto.numQuarto}</Card.Title>
                      <Card.Description>
                        {quarto.tipo} · {quarto.andar}º andar
                      </Card.Description>
                    </Card.Header>
                    <Card.Body>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-stone-500">Diária</span>
                        <div className="text-right">
                          <span className="text-lg font-serif font-bold text-stone-900">
                            {quarto.formatarDiaria()}
                          </span>
                          <span className="text-[11px] text-stone-400 block">
                            /noite
                          </span>
                        </div>
                      </div>
                    </Card.Body>
                    <Card.Footer>
                      <span className="text-[11px] text-emerald-800">
                        Pronto para reserva
                      </span>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => abrirCriacao(quarto)}
                      >
                        Reservar
                      </Button>
                    </Card.Footer>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900">
                Minhas reservas neste hotel
              </h3>
              <p className="text-xs text-stone-500">
                Visualize, edite ou exclua as reservas feitas nesta unidade.
              </p>
            </div>

            <DataTable
              data={reservasDoHotel}
              searchPlaceholder="Buscar por quarto ou data..."
              searchKeys={["id", "dataCheckin", "dataCheckout"]}
              emptyMessage="Você ainda não tem reservas neste hotel."
              columns={[
                {
                  header: "Reserva",
                  accessor: "id",
                  render: (val) => (
                    <span className="font-semibold font-mono text-stone-900">
                      #{val}
                    </span>
                  ),
                },
                {
                  header: "Quarto",
                  accessor: (row) => row.quartoNumero || row.idQuarto,
                  render: (_, row) => {
                    const quarto =
                      row.quarto ||
                      quartos.find((q) => sameId(q.id, row.idQuarto));
                    return (
                      <div>
                        <span className="font-medium text-stone-800">
                          {quarto
                            ? `Quarto ${quarto.numQuarto}`
                            : `Quarto #${row.idQuarto}`}
                        </span>
                        <span className="block text-[11px] text-stone-400">
                          {quarto?.tipo || row.quartoTipo || "-"}
                        </span>
                      </div>
                    );
                  },
                },
                {
                  header: "Período",
                  accessor: (row) => row.dataCheckin,
                  render: (_, row) => (
                    <span>
                      {row.formatarCheckin?.() || row.dataCheckin} →{" "}
                      {row.formatarCheckout?.() || row.dataCheckout}
                    </span>
                  ),
                },
                {
                  header: "Hóspedes",
                  accessor: (row) => row.qtdHospedes || 1,
                },
                {
                  header: "Status",
                  accessor: "status",
                  render: (val, row) => (
                    <StatusIndicator status={row.status || val || "Confirmada"} />
                  ),
                },
              ]}
              actions={(row) => (
                <div className="flex items-center justify-end gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={Eye}
                    onClick={() => abrirVisualizacao(row)}
                  >
                    Ver
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={Pencil}
                    onClick={() => abrirEdicao(row)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={Trash2}
                    className="text-red-700 hover:bg-red-50"
                    onClick={() => handleExcluir(row)}
                  >
                    Excluir
                  </Button>
                </div>
              )}
            />
          </div>
        </section>
      )}

      <Modal
        isOpen={modalAberto}
        onClose={fecharModal}
        title={tituloModal}
        subtitle={subtituloModal}
        footer={
          modalModo === "view" ? (
            <Button variant="ghost" size="sm" onClick={fecharModal}>
              Fechar
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={fecharModal}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={salvando}
                onClick={handleSalvar}
              >
                {modalModo === "create" ? "Confirmar reserva" : "Salvar alterações"}
              </Button>
            </>
          )
        }
      >
        <ReservaFormFields
          form={form}
          setForm={setForm}
          minCheckin={hoje}
          readOnly={modalModo === "view"}
        />
        <div className="mt-4 p-3 bg-[#e8f7ee] rounded-xl border border-[#b8c4bb]/60 space-y-1.5 text-xs">
          <div className="flex justify-between text-stone-700">
            <span>Noites</span>
            <span className="font-medium">{noites}</span>
          </div>
          <div className="flex justify-between text-stone-700">
            <span>Reserva</span>
            <span className="font-medium">{formatarMoeda(valorReserva)}</span>
          </div>
          {extras.map((extra) => (
            <div
              key={extra.campo}
              className="flex justify-between text-stone-700"
            >
              <span>{extra.label}</span>
              <span className="font-medium">{formatarMoeda(extra.valor)}</span>
            </div>
          ))}
          <div className="flex justify-between text-stone-900 font-bold text-sm pt-1.5 border-t border-dashed border-[#b8c4bb]">
            <span>Total previsto</span>
            <span className="text-[#663f46]">{formatarMoeda(total)}</span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
