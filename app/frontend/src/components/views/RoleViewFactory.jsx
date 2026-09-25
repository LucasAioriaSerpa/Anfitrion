import GuestView from './GuestView';
import HousekeepingView from './HousekeepingView';
import ReceptionView from './ReceptionView';
import ManagerView from './ManagerView';
import AdminView from './AdminView';

/**
 * RoleViewFactory (Padrão Strategy & Factory OO)
 * Resolve dinamicamente a interface de visualização adequada com base
 * na instância polimórfica de Usuario (Funcionario ou Hospede) ou no override de variabilidade.
 */
export default function RoleViewFactory({
  usuario,
  dataManager,
  overrideRole = 'auto'
}) {
  if (!usuario) return null;

  let strategyKey;
  if (overrideRole && overrideRole !== 'auto') {
    strategyKey = overrideRole;
  } else if (usuario.isFuncionario && usuario.isFuncionario()) {
    strategyKey = usuario.getViewStrategyKey ? usuario.getViewStrategyKey() : 'staff';
  } else {
    strategyKey = 'hospede';
  }

  // Mapeamento polimórfico de componentes (Strategy Map)
  switch (strategyKey) {
    case 'admin':
      return <AdminView usuario={usuario} dataManager={dataManager} />;

    case 'manager':
      return <ManagerView usuario={usuario} dataManager={dataManager} />;

    case 'reception':
      return <ReceptionView usuario={usuario} dataManager={dataManager} />;

    case 'housekeeping':
    case 'staff':
      return <HousekeepingView usuario={usuario} dataManager={dataManager} />;

    case 'hospede':
    default:
      return <GuestView usuario={usuario} dataManager={dataManager} />;
  }
}
