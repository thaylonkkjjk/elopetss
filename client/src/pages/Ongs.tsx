import { useState, useEffect } from 'react';
import { Search, PawPrint, Plus, Loader2, MapPin, ExternalLink, Heart } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Link } from 'wouter';
import { trpc } from '@/lib/trpc';
import SafeImage from '@/components/SafeImage';
import { Card } from '@/components/ui/card';

export default function Ongs() {
  const [search, setSearch] = useState('');
  const [state, setState] = useState('todos');

  const { data: approvedOngs, isLoading } = trpc.ongs.getAllApproved.useQuery(undefined, { placeholderData: (p: any) => p });
  const { data: allPosts } = trpc.ongs.getAllPosts.useQuery(undefined, { placeholderData: (p: any) => p });
  const { data: currentOng } = trpc.ongAuth.me.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const { data: currentAdmin } = trpc.adminAuth.me.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const isLoggedIn = !!currentOng || !!currentAdmin;

  const states = ['todos', ...Array.from(new Set((approvedOngs || []).map(o => o.state))).sort()];

  const filtered = (approvedOngs || []).filter(o => {
    const matchSearch = search === '' ||
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.city.toLowerCase().includes(search.toLowerCase()) ||
      o.description.toLowerCase().includes(search.toLowerCase());
    const matchState = state === 'todos' || o.state === state;
    return matchSearch && matchState;
  });

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <div className="pt-16 bg-[#F0FFF8]">
        <div className="container py-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <PawPrint className="w-6 h-6 text-orange-400" />
                <h1 className="text-4xl font-black text-gray-800" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  ONGs <span className="text-sky-500">Parceiras</span>
                </h1>
              </div>
              <p className="text-gray-500 max-w-xl">
                Conheça as organizações que trabalham incansavelmente pelo bem-estar animal em todo o Brasil.
              </p>
            </div>
            {!isLoggedIn && (
              <Link href="/ongs/cadastrar" className="hidden sm:block">
                <button className="ep-btn-orange flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Cadastrar ONG
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="container py-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Buscar por nome, cidade ou descrição..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
          </div>
          <select value={state} onChange={e => setState(e.target.value)}
            className="px-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm font-semibold bg-white">
            {states.map(s => (
              <option key={s} value={s}>{s === 'todos' ? 'Todos os estados' : s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="container py-12 flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <PawPrint className="w-12 h-12 mx-auto mb-3 text-gray-200" />
            <p className="text-gray-500 text-lg">Nenhuma ONG encontrada.</p>
            {!isLoggedIn && (
              <>
                <p className="text-gray-400 text-sm mt-1">Seja o primeiro a cadastrar uma ONG!</p>
                <Link href="/ongs/cadastrar">
                  <button className="ep-btn-orange mt-4 flex items-center gap-2 mx-auto">
                    <Plus className="w-4 h-4" /> Cadastrar ONG
                  </button>
                </Link>
              </>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6">{filtered.length} ONG{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(ong => {
                const ongPosts = (allPosts || []).filter(p => (p as any).ong_id === ong.id);
                const animalsCount = ongPosts.filter(p => p.type === 'donation').length;
                const requestsCount = ongPosts.filter(p => p.type !== 'donation').length;
                return (
                  <div key={ong.id} className="fade-in-up">
                    <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
                      {/* Banner */}
                      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-orange-100 to-amber-50">
                        {(ong as any).banner_url ? (
                          <img
                            src={(ong as any).banner_url}
                            alt={ong.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <PawPrint className="w-12 h-12 text-orange-200" />
                          </div>
                        )}
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
                        {/* Avatar */}
                        {(ong as any).avatar_url && (
                          <div className="absolute top-3 right-3 w-10 h-10 rounded-lg overflow-hidden border-2 border-white shadow">
                            <img src={(ong as any).avatar_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">{ong.description}</p>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-orange-50 rounded-xl p-3 text-center">
                            <PawPrint className="w-3.5 h-3.5 text-orange-400 mx-auto mb-0.5" />
                            <p className="text-xl font-black text-orange-500">{animalsCount}</p>
                            <p className="text-xs text-gray-500">Animais</p>
                          </div>
                          <div className="bg-sky-50 rounded-xl p-3 text-center">
                            <Heart className="w-3.5 h-3.5 text-sky-400 mx-auto mb-0.5" />
                            <p className="text-xl font-black text-sky-500">{requestsCount}</p>
                            <p className="text-xs text-gray-500">Pedidos</p>
                          </div>
                        </div>

                        <Link href={`/ongs/${ong.id}`}>
                          <button className="w-full ep-btn-blue text-sm py-2.5 flex items-center justify-center gap-1.5">
                            <ExternalLink className="w-3.5 h-3.5" /> Ver ONG
                          </button>
                        </Link>
                      </div>
                    </Card>
                  </div>
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
