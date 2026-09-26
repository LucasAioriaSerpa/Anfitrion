import { useEffect, useState } from 'react';
import '../style/App.css';
import '../style/Auth.css';
import logoAnfitrion from '../assets/logo-Anfitrion.png';
import { quartoApi } from '../services/apiService';

const STATUSES = ['Limpo', 'Disponível', 'Bloqueado', 'Ocupado', 'Sujo'];

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="user-icon">
      <path d="M12 12c2.76 0 5-2.24 5-5S14.76 2 12 2 7 4.24 7 7s2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v1h20v-1c0-3.33-6.67-5-10-5z" />
    </svg>
  );
}

function Rooms({ onLogout }) {
  const [rooms, setRooms] = useState([]);
  const [editing, setEditing] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [erro, setErro] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('anfitrion_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserEmail(parsedUser.email || '');
      } catch (error) {
        setUserEmail('');
      }
    }

    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await quartoApi.getAll();
      if (res.ok && res.data?.success) {
        setRooms(res.data.data || []);
        if (Array.isArray(res.data.data) && res.data.data.length > 0) {
          localStorage.setItem('anfitrion_quartos', JSON.stringify(res.data.data));
        }
        return;
      }
    } catch (e) {
      // fallback silencioso para preservar o estado atualizado no navegador
    }

    try {
      const savedRooms = localStorage.getItem('anfitrion_quartos');
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

    setRooms(generateSampleRooms());
  };

  const generateSampleRooms = () => {
    const sample = [];
    for (let floor = 1; floor <= 3; floor++) {
      for (let i = 1; i <= 4; i++) {
        const num = floor * 100 + i;
        sample.push({ id_quarto: num, num_quarto: num, descricao: `Standard · ${floor}º andar`, status: STATUSES[Math.floor(Math.random() * STATUSES.length)] });
      }
    }
    return sample;
  };

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
        const nextRooms = rooms.map(r => (r.id_quarto ?? r.id) === id ? { ...r, status: newStatus } : r);
        setRooms(nextRooms);
        localStorage.setItem('anfitrion_quartos', JSON.stringify(nextRooms));
        setEditing(null);
        setErro('');
        return;
      }

      setErro(res.data?.message || 'Falha ao atualizar status');
    } catch (e) {
      setErro(e.message || 'Erro ao conectar com servidor');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('anfitrion_user');
    localStorage.removeItem('anfitrion_quartos');
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="rooms-page">
      <header className="rooms-header">
        <div className="brand-block">
          <div className="brand-logo">
            <img src={logoAnfitrion} alt="Logo Anfitrião" className="brand-logo-image" />
          </div>
          <div className="brand-title">Quartos</div>
        </div>

        <div className="header-actions">
          <span className="header-email">{userEmail || 'Funcionário'}</span>
          <div className="header-avatar" aria-label="Usuário">
            <UserIcon />
          </div>
          <button type="button" className="header-menu" aria-label="Menu">☰</button>
        </div>
      </header>

      <main className="rooms-main">
        <div className="rooms-toolbar">
          <div className="rooms-title-wrap">
            <h1>Quartos</h1>
            <p>Controle de check-in, check-out, limpeza e acompanhantes</p>
          </div>
          <button
            type="button"
            className="refresh-button"
            onClick={handleLogout}
            style={{ background: '#7b2d2d' }}
          >
            Sair
          </button>
        </div>

        {erro && <div className="rooms-error">{erro}</div>}

        <div className="rooms-actions">
          <button type="button" className="refresh-button" onClick={() => fetchRooms()}>Atualizar</button>
        </div>

        <div className="room-grid">
          {rooms.map(room => (
            <div key={room.id_quarto ?? room.id} className="room-card">
              <div className="room-card-header">
                <div className="room-number">Nº {room.num_quarto ?? room.numero}</div>
                <div className="room-status">{room.status}</div>
              </div>
              <div className="room-description">{room.descricao ?? ''}</div>

              {editing === (room.id_quarto ?? room.id) ? (
                <div className="room-editor">
                  <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <div className="editor-actions">
                    <button type="button" className="save-button" onClick={() => saveStatus(room)}>Salvar</button>
                    <button type="button" className="cancel-button" onClick={() => setEditing(null)}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <button type="button" className="edit-button" onClick={() => openEdit(room)}>Editar</button>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Rooms;
