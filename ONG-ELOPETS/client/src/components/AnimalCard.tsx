import { MapPin, Heart } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'wouter';
import type { Animal } from '@/lib/data';

interface AnimalCardProps {
  animal: Animal;
  delay?: number;
}

export default function AnimalCard({ animal, delay = 0 }: AnimalCardProps) {
  const [liked, setLiked] = useState(false);

  const speciesLabel = {
    cachorro: '🐶 Cachorro',
    gato: '🐱 Gato',
    outro: '🐾 Outro',
  }[animal.species];

  const badgeClass = {
    cachorro: 'ep-badge-dog',
    gato: 'ep-badge-cat',
    outro: 'ep-badge-other',
  }[animal.species];

  return (
    <div
      className="ep-card fade-in-up group"
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* foto do bichinho */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={animal.image}
          alt={animal.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* botão de favoritar - por enquanto só fica no estado local mesmo, não salva em lugar nenhum */}
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
        {/* badge dizendo se é cachorro, gato etc */}
        <div className="absolute top-3 left-3">
          <span className={`${badgeClass} text-xs font-bold px-2.5 py-1 rounded-full shadow-sm`}>
            {speciesLabel}
          </span>
        </div>
        {/* se já foi adotado ou tá em processo, cobre a foto com um aviso */}
        {animal.status !== 'disponível' && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 font-bold text-sm px-3 py-1.5 rounded-full">
              {animal.status === 'adotado' ? '✓ Adotado' : 'Em Processo'}
            </span>
          </div>
        )}
      </div>

      {/* nome, idade, local e as tags de vacinado/castrado */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-bold text-gray-800 text-lg leading-tight" style={{ fontFamily: 'Nunito, sans-serif' }}>
            {animal.name}
          </h3>
          <span className="text-xs text-gray-500 font-medium mt-0.5">{animal.age}</span>
        </div>

        <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
          <MapPin className="w-3 h-3 shrink-0" />
          <span>{animal.city}, {animal.state}</span>
        </div>

        <div className="flex items-center gap-1.5 mb-4">
          {animal.vaccinated && (
            <span className="bg-green-50 text-green-600 text-xs font-semibold px-2 py-0.5 rounded-full">
              ✓ Vacinado
            </span>
          )}
          {animal.castrated && (
            <span className="bg-sky-50 text-sky-600 text-xs font-semibold px-2 py-0.5 rounded-full">
              ✓ Castrado
            </span>
          )}
        </div>

        <Link href={`/adocao/${animal.id}`}>
          <button className="w-full ep-btn-blue text-sm py-2.5">
            Ver detalhes
          </button>
        </Link>
      </div>
    </div>
  );
}
