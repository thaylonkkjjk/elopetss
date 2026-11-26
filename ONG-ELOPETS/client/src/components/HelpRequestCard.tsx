import { MapPin, Clock, AlertCircle, Heart, Package, Users } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'wouter';
import type { HelpRequest } from '@/lib/data';
import { formatDate } from '@/lib/data';
import { toast } from 'sonner';

interface HelpRequestCardProps {
  request: HelpRequest;
  delay?: number;
}

const typeConfig = {
  dinheiro: {
    label: 'Doação em Dinheiro',
    icon: Heart,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
  },
  itens: {
    label: 'Doação de Itens',
    icon: Package,
    color: 'text-sky-500',
    bg: 'bg-sky-50',
  },
  voluntariado: {
    label: 'Voluntariado',
    icon: Users,
    color: 'text-green-500',
    bg: 'bg-green-50',
  },
};

export default function HelpRequestCard({ request, delay = 0 }: HelpRequestCardProps) {
  const [liked, setLiked] = useState(false);
  const config = typeConfig[request.type];
  const Icon = config.icon;

  const handleHelp = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.success('Obrigado pelo interesse! Entre em contato com a ONG para ajudar.', {
      description: `${request.ongName} — ${request.city}, ${request.state}`,
    });
  };

  return (
    <div
      className="ep-card fade-in-up group"
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* imagem do pedido */}
      <div className="relative overflow-hidden aspect-[16/9]">
        <img
          src={request.image}
          alt={request.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* botão de favoritar, mesma lógica do card de animal */}
        <button
          onClick={(e) => { e.preventDefault(); setLiked(!liked); }}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-all"
          aria-label="Favoritar"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              liked ? 'text-red-500 fill-red-500' : 'text-gray-400'
            }`}
          />
        </button>
        {/* badge vermelho quando é urgente */}
        {request.urgent && (
          <div className="absolute top-3 left-3">
            <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Urgente
            </span>
          </div>
        )}
      </div>

      {/* título, ong, local e botões de ação */}
      <div className="p-4">
        {/* badge indicando o tipo de ajuda pedida (dinheiro/itens/voluntariado) */}
        <div className={`inline-flex items-center gap-1.5 ${config.bg} ${config.color} text-xs font-semibold px-2.5 py-1 rounded-full mb-2`}>
          <Icon className="w-3 h-3" />
          {config.label}
        </div>

        <h3 className="font-bold text-gray-800 text-base leading-tight mb-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
          {request.title}
        </h3>

        <p className="text-gray-500 text-xs font-semibold mb-2">{request.ongName}</p>

        <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 shrink-0" />
            <span>{request.city}, {request.state}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatDate(request.createdAt)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/ajuda/${request.id}`} className="flex-1">
            <button className="w-full border border-gray-200 text-gray-600 hover:border-sky-300 hover:text-sky-600 font-semibold text-sm py-2.5 rounded-full transition-all" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Ver detalhes
            </button>
          </Link>
          <button
            onClick={handleHelp}
            className="flex-1 ep-btn-orange text-sm py-2.5"
          >
            Quero Ajudar
          </button>
        </div>
      </div>
    </div>
  );
}
