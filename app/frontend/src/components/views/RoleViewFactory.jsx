import AdminView from "./AdminView";
import ManagerView from "./ManagerView";
import HousekeepingView from "./HousekeepingView";
import GuestView from "./GuestView";
import RoomsView from "./RoomsView";
//* remover caso for utilizado a view WIP *\\ import WipView from "./WipView";

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

  //? Mapeamento polimórfico de componentes (Strategy Map)
  switch (strategyKey) {
    case "admin":
      return <AdminView usuario={usuario} dataManager={dataManager} />;
    // return <WipView usuario={usuario} dataManager={dataManager} />;

    case "manager":
      return <ManagerView usuario={usuario} dataManager={dataManager} />;
    // return <WipView usuario={usuario} dataManager={dataManager} />;

    case "reception":
      // TODO: TRANSFORMAR O <RoomsView> em o novo <ReceptionView>! \\  return <ReceptionView usuario={usuario} dataManager={dataManager} />;
      return <RoomsView usuario={usuario} dataManager={dataManager} />;

    case "housekeeping":
    case "staff":
      return <HousekeepingView usuario={usuario} dataManager={dataManager} />;
    // return <WipView usuario={usuario} dataManager={dataManager} />;

    case "hospede":
    default:
      return <GuestView usuario={usuario} dataManager={dataManager} />;
    // return <WipView usuario={usuario} dataManager={dataManager} />;
  }
}
