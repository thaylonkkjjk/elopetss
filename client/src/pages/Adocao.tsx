import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Search, PawPrint, Loader2, SlidersHorizontal } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type SpeciesFilter = 'todos' | 'cachorro' | 'gato' | 'outro';
type SizeFilter = 'todos' | 'Pequeno' | 'Médio' | 'Grande';
type GenderFilter = 'todos' | 'Macho' | 'Fêmea';

export default function Adocao() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState('');
  const [size, setSize] = useState<SizeFilter>('todos');
  const [gender, setGender] = useState<GenderFilter>('todos');
  const [showFilters, setShowFilters] = useState(false);

  const { data: allPosts, isLoading } = trpc.ongs.getAllPosts.useQuery(undefined, { placeholderData: (p: any) => p });
  const { data: ongs } = trpc.ongs.getAllApproved.useQuery(undefined, { placeholderData: (p: any) => p });

  const donations = (allPosts || [])
    .filter(p => p.type === 'donation')
    .map(p => {
      const ong = ongs?.find(o => o.id === (p as any).ong_id);
      return { ...p, ong };
    });

  const filtered = donations.filter(p => {
    const post = p as any;
    const matchSearch = search === '' ||
      (post.pet_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (post.pet_breed || '').toLowerCase().includes(search.toLowerCase()) ||
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.ong?.city || '').toLowerCase().includes(search.toLowerCase());
    const matchSize = size === 'todos' || post.pet_size === size;
    const matchGender = gender === 'todos' || post.pet_gender === gender;
    return matchSearch && matchSize && matchGender;
  });

  const sizeOptions: { value: SizeFilter; label: string }[] = [
    { value: 'todos',    label: 'Qualquer porte' },
    { value: 'Pequeno',  label: 'Pequeno' },
    { value: 'Médio',    label: 'Médio' },
    { value: 'Grande',   label: 'Grande' },
  ];

  const genderOptions: { value: GenderFilter; label: string }[] = [
    { value: 'todos',  label: 'Qualquer sexo' },
    { value: 'Macho',  label: 'Macho' },
    { value: 'Fêmea',  label: 'Fêmea' },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <div className="pt-16 bg-[#FFF8F0]">
        <div className="container py-12">
          <div className="flex items-center gap-2 mb-3">
            <PawPrint className="w-6 h-6 text-orange-400" />
            <h1 className="text-4xl font-black text-gray-800" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Animais para <span className="text-orange-500">Adoção</span>
            </h1>
          </div>
          <p className="text-gray-500 max-w-xl">
            Encontre seu novo melhor amigo! Todos os animais estão sob os cuidados de ONGs parceiras.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-16 z-30 bg-white border-b shadow-sm">
        <div className="container py-4 flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Buscar por nome, raça ou cidade..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
            </div>
            <button onClick={() => setShowFilters(f => !f)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${showFilters ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              <SlidersHorizontal className="w-4 h-4" /> Filtros
            </button>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-4">
              <div className="flex gap-2 flex-wrap items-center">
                <span className="text-xs text-gray-500 font-medium">Porte:</span>
                {sizeOptions.map(opt => (
                  <button key={opt.value} onClick={() => setSize(opt.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${size === opt.value ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 flex-wrap items-center">
                <span className="text-xs text-gray-500 font-medium">Sexo:</span>
                {genderOptions.map(opt => (
                  <button key={opt.value} onClick={() => setGender(opt.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${gender === opt.value ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="container py-12 flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <PawPrint className="w-12 h-12 mx-auto mb-3 text-gray-200" />
            <p className="text-gray-500 text-lg mb-2">Nenhum animal disponível no momento.</p>
            <p className="text-gray-400 text-sm">Em breve novas ONGs publicarão animais para adoção!</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6">{filtered.length} animal{filtered.length !== 1 ? 'is' : ''} disponíve{filtered.length !== 1 ? 'is' : 'l'}</p>
            <div className={
              filtered.length === 1
                ? 'flex justify-center'
                : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
            }>
              {filtered.map(p => {
                const post = p as any;
                return (
                  <Card
                    key={p.id}
                    onClick={() => navigate(`/ongs/${post.ong_id}?post=${post.id}`)}
                    className={`fade-in-up overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group ${filtered.length === 1 ? 'w-full max-w-sm' : ''}`}
                  >
                    <div className="h-48 overflow-hidden bg-gradient-to-br from-orange-50 to-amber-100">
                      {post.image_url ? (
                        <img src={post.image_url} alt={post.pet_name || post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <PawPrint className="w-16 h-16 text-orange-200" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-gray-900">{post.pet_name || post.title}</h3>
                        {post.is_urgent && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">🚨</span>}
                      </div>
                      {post.pet_breed && <p className="text-sm text-gray-500 mb-2">{post.pet_breed}</p>}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.pet_age && <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">{post.pet_age}</span>}
                        {post.pet_size && <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">{post.pet_size}</span>}
                        {post.pet_gender && <span className="text-xs bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full">{post.pet_gender}</span>}
                        {post.pet_vaccinated && <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">✓ Vacinado</span>}
                        {post.pet_castrated && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">✓ Castrado</span>}
                      </div>
                      {p.ong && (
                        <p className="text-xs text-gray-400">📍 {p.ong.city}/{p.ong.state} · {p.ong.name}</p>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
