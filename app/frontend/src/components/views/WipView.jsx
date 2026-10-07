import { logout } from "../../services/apiService";
import "../../style/wip.css";

export default function WipView() {
  return (
    <main className="wip-page" aria-label="WIP">
      <div className="wip-title">
        <h1>WIP!</h1>
        <p>Ainda está em desenvolvimento!</p>
      </div>
      <button type="button" className="wip-logout-button" onClick={logout}>
        Sair
      </button>
    </main>
  );
}
