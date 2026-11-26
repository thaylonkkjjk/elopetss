import { MapPin, Clock, AlertCircle, Heart, Package, Users } from 'lucide-react';
import { Link } from 'wouter';

interface HelpRequest {
  id: string;
  ongId: string;
  title: string;
  description: string;
  type: 'itens' | 'dinheiro' | 'voluntariado';
  rawType?: string;
  ongName: string;
  city: string;
  state: string;
  image?: string;
  createdAt: Date | string;
  urgent?: boolean;
  items?: string;
}

interface HelpRequestCardProps {
  request: HelpRequest;
  delay?: number;
}

const typeConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  request_food:     { label: 'Pedido de Ração',    icon: Package, color: 'text-green-600',  bg: 'bg-green-50'  },
  request_medicine: { label: 'Pedido de Remédios', icon: Heart,   color: 'text-purple-600', bg: 'bg-purple-50' },
  request_other:    { label: 'Pedido de Ajuda',    icon: Users,   color: 'text-orange-600', bg: 'bg-orange-50' },
  itens:            { label: 'Doação de Itens',    icon: Package, color: 'text-sky-600',    bg: 'bg-sky-50'    },
  dinheiro:         { label: 'Doação em Dinheiro', icon: Heart,   color: 'text-orange-600', bg: 'bg-orange-50' },
  voluntariado:     { label: 'Voluntariado',        icon: Users,   color: 'text-green-600',  bg: 'bg-green-50'  },
};

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function HelpRequestCard({ request, delay = 0 }: HelpRequestCardProps) {
  const key = request.rawType || request.type;
  const config = typeConfig[key] ?? typeConfig.itens;
  const Icon = config.icon;

  return (
    <div className="ep-card fade-in-up group" style={{ transitionDelay: `${delay}ms` }}>
      {/* Image or placeholder */}
      <div className="relative overflow-hidden aspect-[16/9] bg-gradient-to-br from-orange-50 to-amber-100">
        {request.image ? (
          <img src={request.image} alt={request.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon className="w-14 h-14 text-orange-200" />
          </div>
        )}
        {request.urgent && (
          <div className="absolute top-3 left-3">
            <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Urgente
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className={`inline-flex items-center gap-1.5 ${config.bg} ${config.color} text-xs font-semibold px-2.5 py-1 rounded-full mb-2`}>
          <Icon className="w-3 h-3" />
          {config.label}
        </div>

        <h3 className="font-bold text-gray-800 text-base leading-tight mb-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
          {request.title}
        </h3>
        <p className="text-gray-500 text-xs font-semibold mb-1">{request.ongName}</p>
        <p className="text-gray-400 text-xs mb-3 line-clamp-2">{request.description}</p>

        <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 shrink-0" />
            <span>{request.city}{request.state ? `, ${request.state}` : ''}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatDate(request.createdAt)}</span>
          </div>
        </div>

        <Link href={`/ongs/${request.ongId}?post=${request.id}`}>
          <button className="w-full ep-btn-orange text-sm py-2.5" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Ver detalhes
          </button>
        </Link>
      </div>
    </div>
  );
}
