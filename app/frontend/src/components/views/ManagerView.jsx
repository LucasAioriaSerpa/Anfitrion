import { useState } from "react";
import Button from "../common/Button";
import Modal from "../common/Modal";
import { quartoApi } from "../../services/apiService";
import "../../style/App.css";
import "../../style/Auth.css";

const STATUSES = ["Limpo", "Disponível", "Bloqueado", "Ocupado", "Sujo"];

export default function ManagerView({ dataManager }) {
  const [editing, setEditing] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [erro, setErro] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRoom, setNewRoom] = useState({
    num_quarto: "",
    andar: "1",
    tipo: "",
    diaria: "",
  });
  const quartos = dataManager.quartos;
  const roomBeingEdited = quartos.find((room) => room.id === editing);

  const openEdit = (room) => {
    setErro("");
    setEditing(room.id);
    setNewStatus(room.status);
  };

  const saveStatus = async (room) => {
    const updated = await dataManager.atualizarStatusQuarto(room.id, newStatus);
    if (!updated) {
      setErro("Falha ao atualizar status do quarto.");
      return;
    }

    setEditing(null);
    setErro("");
  };

  const deleteRoom = async (room) => {
    if (!window.confirm(`Deseja excluir o quarto Nº ${room.numQuarto}?`)) {
      return;
    }

    setErro("");
    try {
      const response = await quartoApi.delete(room.id);
      if (!response.ok || !response.data?.success) {
        setErro(
          response.data?.message || response.error || "Falha ao excluir quarto.",
        );
        return;
      }

      setEditing(null);
      await dataManager.init(true);
    } catch (error) {
      setErro(error.message || "Erro ao conectar com servidor.");
    }
  };

  const createRoom = async (event) => {
    event.preventDefault();
    setErro("");

    try {
      const createdRoom = await dataManager.adicionarQuarto(newRoom);
      if (!createdRoom) {
        setErro("Falha ao criar quarto.");
        return;
      }

      setNewRoom({ num_quarto: "", andar: "1", tipo: "", diaria: "" });
      setShowCreateForm(false);
    } catch (error) {
      setErro(error.message || "Erro ao conectar com servidor.");
    }
  };

  return (
    <div className="rooms-page">
      <main className="rooms-main">
        <div className="rooms-toolbar">
          <div className="rooms-title-wrap">
            <h1>Quartos</h1>
            <p>Controle de check-in, check-out, limpeza e acompanhantes</p>
          </div>
        </div>

        {erro && !showCreateForm && !editing && (
          <div className="rooms-error">{erro}</div>
        )}

        <div className="rooms-actions flex items-center gap-3">
          <button
            type="button"
            className="refresh-button"
            onClick={() => void dataManager.init(true)}
          >
            Atualizar
          </button>
          <button
            type="button"
            className="refresh-button"
            onClick={() => {
              setErro("");
              setShowCreateForm(true);
            }}
          >
            Criar
          </button>
        </div>

        <Modal
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          title="Criar quarto"
          subtitle="Informe os dados da nova acomodação."
          footer={
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowCreateForm(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                form="manager-create-room-form"
                size="sm"
                variant="primary"
              >
                Salvar quarto
              </Button>
            </>
          }
        >
          <form
            id="manager-create-room-form"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            onSubmit={createRoom}
          >
            {erro && <div className="rooms-error sm:col-span-2">{erro}</div>}
            <label className="text-sm font-medium text-stone-700">
              Número do quarto
              <input
                className="mt-1 w-full rounded border border-stone-300 p-2"
                type="number"
                min="1"
                required
                value={newRoom.num_quarto}
                onChange={(event) =>
                  setNewRoom({ ...newRoom, num_quarto: event.target.value })
                }
              />
            </label>
            <label className="text-sm font-medium text-stone-700">
              Andar
              <input
                className="mt-1 w-full rounded border border-stone-300 p-2"
                type="number"
                min="1"
                required
                value={newRoom.andar}
                onChange={(event) =>
                  setNewRoom({ ...newRoom, andar: event.target.value })
                }
              />
            </label>
            <label className="text-sm font-medium text-stone-700">
              Tipo
              <input
                className="mt-1 w-full rounded border border-stone-300 p-2"
                type="text"
                required
                value={newRoom.tipo}
                onChange={(event) =>
                  setNewRoom({ ...newRoom, tipo: event.target.value })
                }
              />
            </label>
            <label className="text-sm font-medium text-stone-700">
              Diária (R$)
              <input
                className="mt-1 w-full rounded border border-stone-300 p-2"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={newRoom.diaria}
                onChange={(event) =>
                  setNewRoom({ ...newRoom, diaria: event.target.value })
                }
              />
            </label>
          </form>
        </Modal>

        <div className="room-grid">
          {quartos.map((room) => (
            <div key={room.id} className="room-card">
              <div className="room-card-header">
                <div className="room-number">Nº {room.numQuarto}</div>
                <div className="room-status">{room.status}</div>
              </div>
              <div className="room-description">
                {room.tipo} · {room.andar}º andar
              </div>

              <button
                type="button"
                className="edit-button"
                onClick={() => openEdit(room)}
              >
                Editar
              </button>
            </div>
          ))}
        </div>

        <Modal
          isOpen={Boolean(roomBeingEdited)}
          onClose={() => {
            setEditing(null);
            setErro("");
          }}
          title={`Editar quarto ${roomBeingEdited?.numQuarto ?? ""}`}
          subtitle={`${roomBeingEdited?.tipo ?? ""} · ${roomBeingEdited?.andar ?? ""}º andar`}
          footer={
            <>
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  if (roomBeingEdited) void deleteRoom(roomBeingEdited);
                }}
              >
                Excluir quarto
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditing(null);
                  setErro("");
                }}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  if (roomBeingEdited) void saveStatus(roomBeingEdited);
                }}
              >
                Salvar
              </Button>
            </>
          }
        >
          {erro && <div className="rooms-error">{erro}</div>}
          <label className="text-sm font-medium text-stone-700">
            Status
            <select
              className="mt-1 w-full rounded border border-stone-300 p-2"
              value={newStatus}
              onChange={(event) => setNewStatus(event.target.value)}
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </Modal>
      </main>
    </div>
  );
}
