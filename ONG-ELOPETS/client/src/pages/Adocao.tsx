import { useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, PawPrint } from 'lucide-react';
import { animals } from '@/lib/data';
import type { Animal } from '@/lib/data';
import AnimalCard from '@/components/AnimalCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type SpeciesFilter = 'todos' | 'cachorro' | 'gato' | 'outro';
type SizeFilter = 'todos' | 'pequeno' | 'médio' | 'grande';

export default function Adocao() {
  const [search, setSearch] = useState('');
  const [species, setSpecies] = useState<SpeciesFilter>('todos');
  const [size, setSize] = useState<SizeFilter>('todos');
  const [showFilters, setShowFilters] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.05 }
    );
    el.querySelectorAll('.fade-in-up').forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, []);

  const filtered = animals.filter((a) => {
    const matchSearch =
      search === '' ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.breed.toLowerCase().includes(search.toLowerCase()) ||
      a.city.toLowerCase().includes(search.toLowerCase());
    const matchSpecies = species === 'todos' || a.species === species;
    const matchSize = size === 'todos' || a.size === size;
    return matchSearch && matchSpecies && matchSize;
  });

  const speciesOptions: { value: SpeciesFilter; label: string; emoji: string }[] = [
    { value: 'todos', label: 'Todos', emoji: '🐾' },
    { value: 'cachorro', label: 'Cachorros', emoji: '🐶' },
    { value: 'gato', label: 'Gatos', emoji: '🐱' },
    { value: 'outro', label: 'Outros', emoji: '🐰' },
  ];

  const sizeOptions: { value: SizeFilter; label: string }[] = [
    { value: 'todos', label: 'Qualquer porte' },
    { value: 'pequeno', label: 'Pequeno' },
    { value: 'médio', label: 'Médio' },
    { value: 'grande', label: 'Grande' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* cabeçalho da página */}
      <div className="pt-16 bg-gradient-to-br from-sky-50 to-orange-50 paw-bg">
        <div className="container py-12">
          <div className="flex items-center gap-2 mb-3">
            <PawPrint className="w-6 h-6 text-orange-400" />
            <h1
              className="text-4xl font-black text-gray-800"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Área de <span className="text-sky-500">Adoção</span>
            </h1>
          </div>
          <p className="text-gray-500 max-w-xl">
            Encontre seu novo companheiro de quatro patas. Todos os animais estão em abrigos parceiros aguardando um lar cheio de amor.
          </p>
        </div>
      </div>

      {/* barra de busca e filtros */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="container py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* campo de busca */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome, raça ou cidade..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm transition-all"
              />
            </div>

            {/* botão que abre os filtros no celular */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-full text-sm font-semibold text-gray-600"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtros
            </button>

            {/* filtros de espécie, só aparece no desktop */}
            <div className="hidden sm:flex items-center gap-2">
              {speciesOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSpecies(opt.value)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    species === opt.value
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  {opt.emoji} {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* filtros abertos no celular (espécie + porte) */}
          {showFilters && (
            <div className="sm:hidden mt-3 space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">Espécie</p>
                <div className="flex flex-wrap gap-2">
                  {speciesOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSpecies(opt.value)}
                      className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                        species === opt.value
                          ? 'bg-sky-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {opt.emoji} {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">Porte</p>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSize(opt.value)}
                      className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                        size === opt.value
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* filtro de porte, versão desktop */}
          <div className="hidden sm:flex items-center gap-2 mt-3">
            <span className="text-xs text-gray-400 font-medium">Porte:</span>
            {sizeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSize(opt.value)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  size === opt.value
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* resultado da busca/filtro */}
      <div className="container py-10" ref={sectionRef}>
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500 text-sm">
            <span className="font-bold text-gray-800">{filtered.length}</span> animais encontrados
          </p>
          {(species !== 'todos' || size !== 'todos' || search) && (
            <button
              onClick={() => { setSpecies('todos'); setSize('todos'); setSearch(''); }}
              className="text-sm text-orange-500 hover:text-orange-600 font-semibold"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((animal, i) => (
              <AnimalCard key={animal.id} animal={animal} delay={i * 60} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🐾</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Nenhum animal encontrado
            </h3>
            <p className="text-gray-500">Tente ajustar os filtros ou buscar por outro termo.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
