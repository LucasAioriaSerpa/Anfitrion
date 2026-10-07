import GuestView from "./GuestView";
import HousekeepingView from "./HousekeepingView";
import ReceptionView from "./ReceptionView";
import ManagerView from "./ManagerView";
import AdminView from "./AdminView";
import WipView from "./WipView";
import RoomsView from "./RoomsView";

/**
 * RoleViewFactory (Padrão Strategy & Factory OO)
 * Resolve dinamicamente a interface de visualização adequada com base
 * na instância polimórfica de Usuario (Funcionario ou Hospede) ou no override de variabilidade.
 */
export default function RoleViewFactory({
  usuario,
  dataManager,
  overrideRole = "auto",
}) {
  if (!usuario) return null;

  let strategyKey;
  if (overrideRole && overrideRole !== "auto") {
    strategyKey = overrideRole;
  } else if (usuario.isFuncionario && usuario.isFuncionario()) {
    strategyKey = usuario.getViewStrategyKey
      ? usuario.getViewStrategyKey()
      : "staff";
  } else {
    strategyKey = "hospede";
  }

  // Mapeamento polimórfico de componentes (Strategy Map)
  switch (strategyKey) {
    case "admin":
      //TODO: COLOCAR AS PAGINAS CORRESPONDENTES ) return <AdminView usuario={usuario} dataManager={dataManager} />;
      return <WipView />;

    case "manager":
      //TODO: COLOCAR AS PAGINAS CORRESPONDENTES ) return <ManagerView usuario={usuario} dataManager={dataManager} />;
      return <WipView />;

    case "reception":
      //TODO: COLOCAR AS PAGINAS CORRESPONDENTES ) return <ReceptionView usuario={usuario} dataManager={dataManager} />;
      return <RoomsView />;

    case "housekeeping":
    case "staff":
      //TODO: COLOCAR AS PAGINAS CORRESPONDENTES ) return <HousekeepingView usuario={usuario} dataManager={dataManager} />;
      return <WipView />;

    case "hospede":
    default:
      //TODO: COLOCAR AS PAGINAS CORRESPONDENTES ) return <GuestView usuario={usuario} dataManager={dataManager} />;
      return <WipView />;
  }
}
