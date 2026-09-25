import logoAnfitrion from '../../assets/logo-Anfitrion.png';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer({ onSwitchToStaff }) {
  return (
    <footer className="bg-[#3c362a] text-[#b8c4bb] pt-12 pb-8 border-t border-[#b8c4bb]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#b8c4bb]/20">
          
          {/* Brand info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center p-1.5 border border-white/20">
                <img src={logoAnfitrion} alt="Anfitrião" className="w-full h-full object-contain" />
              </div>
              <span className="font-serif text-2xl font-bold text-white tracking-tight">
                Anfitrião
              </span>
            </div>
            <p className="text-xs text-[#b8c4bb]/80 leading-relaxed italic">
              "A hospitalidade é a arte de fazer o hóspede sentir-se em casa."
            </p>
            <p className="text-xs text-[#b8c4bb]/60">
              Sistema Hoteleiro de Re-uso desenvolvido com arquitetura robusta em Python Flask, SQLite e React.
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-2 text-xs">
            <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider mb-3">
              Unidades da Rede
            </h4>
            <p className="text-[#b8c4bb]/80">Anfitrião Grand Hotel (Copacabana - RJ)</p>
            <p className="text-[#b8c4bb]/80">Anfitrião Boutique (Jardins - SP)</p>
            <p className="text-[#b8c4bb]/80">Anfitrião Serra & Charme (Gramado - RS)</p>
            <p className="text-[#b8c4bb]/80">Anfitrião Eco Resort (Praia do Forte - BA)</p>
          </div>

          {/* Team roles & Responsibilities */}
          <div className="space-y-2 text-xs">
            <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider mb-3">
              Portal da Equipe
            </h4>
            <p className="text-[#b8c4bb]/80 hover:text-white cursor-pointer" onClick={() => onSwitchToStaff('Camareira/Governanta')}>
              • Camareira & Governanta (Higienização)
            </p>
            <p className="text-[#b8c4bb]/80 hover:text-white cursor-pointer" onClick={() => onSwitchToStaff('Recepcionista')}>
              • Recepcionista (Check-in & Balcão)
            </p>
            <p className="text-[#b8c4bb]/80 hover:text-white cursor-pointer" onClick={() => onSwitchToStaff('Gerente/Subgerente')}>
              • Gerente & Subgerente (KPIs e Ocupação)
            </p>
            <p className="text-[#b8c4bb]/80 hover:text-white cursor-pointer" onClick={() => onSwitchToStaff('Administrador')}>
              • Administrador (Gestão e Sistema)
            </p>
          </div>

          {/* Contact & Support */}
          <div className="space-y-2 text-xs">
            <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider mb-3">
              Central de Atendimento
            </h4>
            <div className="flex items-center gap-2 text-[#b8c4bb]/80">
              <Phone className="w-3.5 h-3.5 text-[#e8f7ee]" />
              <span>0800 700 2026 (24 Horas)</span>
            </div>
            <div className="flex items-center gap-2 text-[#b8c4bb]/80">
              <Mail className="w-3.5 h-3.5 text-[#e8f7ee]" />
              <span>reservas@anfitrion.com</span>
            </div>
            <div className="flex items-center gap-2 text-[#b8c4bb]/80">
              <MapPin className="w-3.5 h-3.5 text-[#e8f7ee]" />
              <span>Atendimento em todo o território nacional</span>
            </div>
          </div>

        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#b8c4bb]/60 gap-3">
          <p>© {new Date().getFullYear()} Anfitrião Hotéis & Resorts. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <span>Privacidade</span>
            <span>Termos de Uso</span>
            <span>Políticas de Cancelamento</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
