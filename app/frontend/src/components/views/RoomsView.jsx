import { useCallback, useEffect, useState } from "react";
import "../../style/App.css";
import "../../style/Auth.css";
import { quartoApi } from "../../services/apiService";

const STATUSES = ["Limpo", "Disponível", "Bloqueado", "Ocupado", "Sujo"];

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [editing, setEditing] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [erro, setErro] = useState("");
  const [sessionUser] = useState(() => {
    const storedUser = localStorage.getItem("anfitrion_user");
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  });
  const roomsStorageKey = `anfitrion_quartos_${sessionUser?.id_hotel || "sem-hotel"}`;

  const fetchRooms = useCallback(async () => {
    try {
      const res = await quartoApi.getAll();
      if (res.ok && res.data?.success) {
        setRooms(res.data.data || []);
        if (Array.isArray(res.data.data) && res.data.data.length > 0) {
          localStorage.setItem(roomsStorageKey, JSON.stringify(res.data.data));
        }
        return;
      }
    } catch {
      // fallback silencioso para preservar o estado atualizado no navegador
    }

    try {
      const savedRooms = localStorage.getItem(roomsStorageKey);
      if (savedRooms) {
        const parsed = JSON.parse(savedRooms);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRooms(parsed);
          return;
        }
      }
    } catch {
      // ignora erro de parse
    }

    const sample = [];
    for (let floor = 1; floor <= 3; floor++) {
      for (let i = 1; i <= 4; i++) {
        const num = floor * 100 + i;
        sample.push({
          id_quarto: num,
          num_quarto: num,
          descricao: `Standard · ${floor}º andar`,
          status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
        });
      }
    }
    setRooms(sample);
  }, [roomsStorageKey]);

  useEffect(() => {
    const loadRooms = window.setTimeout(() => {
      void fetchRooms();
    }, 0);
    return () => window.clearTimeout(loadRooms);
  }, [fetchRooms]);

  const openEdit = (room) => {
    setEditing(room.id_quarto ?? room.id);
    setNewStatus(room.status);
  };

  const saveStatus = async (room) => {
    const id = room.id_quarto ?? room.id;
    try {
      const payload = { status: newStatus };
      const res = await quartoApi.update(id, payload);
      if (res.ok && res.data?.success) {
        const nextRooms = rooms.map((r) =>
          (r.id_quarto ?? r.id) === id ? { ...r, status: newStatus } : r,
        );
        setRooms(nextRooms);
        localStorage.setItem(roomsStorageKey, JSON.stringify(nextRooms));
        setEditing(null);
        setErro("");
        return;
      }

      setErro(res.data?.message || "Falha ao atualizar status");
    } catch (e) {
      setErro(e.message || "Erro ao conectar com servidor");
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

        {erro && <div className="rooms-error">{erro}</div>}

        <div className="rooms-actions">
          <button
            type="button"
            className="refresh-button"
            onClick={() => fetchRooms()}
          >
            Atualizar
          </button>
        </div>

        <div className="room-grid">
          {rooms.map((room) => (
            <div key={room.id_quarto ?? room.id} className="room-card">
              <div className="room-card-header">
                <div className="room-number">
                  Nº {room.num_quarto ?? room.numero}
                </div>
                <div className="room-status">{room.status}</div>
              </div>
              <div className="room-description">{room.descricao ?? ""}</div>

              {editing === (room.id_quarto ?? room.id) ? (
                <div className="room-editor">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <div className="editor-actions">
                    <button
                      type="button"
                      className="save-button"
                      onClick={() => saveStatus(room)}
                    >
                      Salvar
                    </button>
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={() => setEditing(null)}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="edit-button"
                  onClick={() => openEdit(room)}
                >
                  Editar
                </button>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Rooms;
