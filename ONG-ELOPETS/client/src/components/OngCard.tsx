import { MapPin, PawPrint, Heart, ExternalLink } from 'lucide-react';
import { Link } from 'wouter';
import type { ONG } from '@/lib/data';

interface OngCardProps {
  ong: ONG;
  delay?: number;
}

export default function OngCard({ ong, delay = 0 }: OngCardProps) {
  return (
    <div
      className="ep-card fade-in-up group"
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* foto de capa da ong + nome/local por cima com um degradê */}
      <div className="relative overflow-hidden h-40">
        <img
          src={ong.image || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=200&fit=crop'}
          alt={ong.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-bold text-white text-base leading-tight" style={{ fontFamily: 'Nunito, sans-serif' }}>
            {ong.name}
          </h3>
          <div className="flex items-center gap-1 text-white/80 text-xs mt-0.5">
            <MapPin className="w-3 h-3" />
            <span>{ong.city}, {ong.state}</span>
          </div>
        </div>
      </div>

      {/* descrição curta + numerinhos de animais/pedidos */}
      <div className="p-4">
        <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
          {ong.description}
        </p>

        {/* stats rápidos: quantos animais e pedidos essa ong tem */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-orange-50 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-orange-500 mb-0.5">
              <PawPrint className="w-3.5 h-3.5" />
            </div>
            <p className="text-xl font-black text-orange-500" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {ong.animalsCount}
            </p>
            <p className="text-xs text-gray-500">Animais</p>
          </div>
          <div className="bg-sky-50 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-sky-500 mb-0.5">
              <Heart className="w-3.5 h-3.5" />
            </div>
            <p className="text-xl font-black text-sky-500" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {ong.helpRequestsCount}
            </p>
            <p className="text-xs text-gray-500">Pedidos</p>
          </div>
        </div>

        <Link href={`/ongs/${ong.id}`}>
          <button className="w-full ep-btn-blue text-sm py-2.5 flex items-center justify-center gap-1.5">
            <ExternalLink className="w-3.5 h-3.5" />
            Ver ONG
          </button>
        </Link>
      </div>
    </div>
  );
}
