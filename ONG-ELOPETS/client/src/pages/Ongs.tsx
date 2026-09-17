import { useState, useEffect, useRef } from 'react';
import { Search, PawPrint, Plus } from 'lucide-react';
import { ongs } from '@/lib/data';
import OngCard from '@/components/OngCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Link } from 'wouter';

export default function Ongs() {
  const [search, setSearch] = useState('');
  const [state, setState] = useState('todos');
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

  const states = ['todos', ...Array.from(new Set(ongs.map((o) => o.state))).sort()];

  const filtered = ongs.filter((o) => {
    const matchSearch =
      search === '' ||
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.city.toLowerCase().includes(search.toLowerCase()) ||
      o.description.toLowerCase().includes(search.toLowerCase());
    const matchState = state === 'todos' || o.state === state;
    return matchSearch && matchState;
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* cabeçalho */}
      <div className="pt-16 bg-gradient-to-br from-sky-50 to-green-50 paw-bg">
        <div className="container py-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <PawPrint className="w-6 h-6 text-orange-400" />
                <h1
                  className="text-4xl font-black text-gray-800"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  ONGs <span className="text-sky-500">Parceiras</span>
                </h1>
              </div>
              <p className="text-gray-500 max-w-xl">
                Conheça as organizações que trabalham incansavelmente pelo bem-estar animal em todo o Brasil. Apoie, doe e faça a diferença.
              </p>
            </div>
            <Link href="/ongs/cadastrar" className="hidden sm:block">
              <button className="ep-btn-orange flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Cadastrar ONG
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* busca e filtro */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="container py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* campo de busca */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome, cidade ou descrição..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm transition-all"
              />
            </div>

            {/* filtro por estado */}
            <div className="flex items-center gap-2 flex-wrap">
              {states.map((s) => (
                <button
                  key={s}
                  onClick={() => setState(s)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    state === s
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  {s === 'todos' ? '🗺️ Todos' : s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* resultados */}
      <div className="container py-10" ref={sectionRef}>
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500 text-sm">
            <span className="font-bold text-gray-800">{filtered.length}</span> ONGs encontradas
          </p>
          {(state !== 'todos' || search) && (
            <button
              onClick={() => { setState('todos'); setSearch(''); }}
              className="text-sm text-orange-500 hover:text-orange-600 font-semibold"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((ong, i) => (
              <OngCard key={ong.id} ong={ong} delay={i * 60} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Nenhuma ONG encontrada
            </h3>
            <p className="text-gray-500 mb-6">Tente ajustar os filtros ou buscar por outro termo.</p>
            <Link href="/ongs/cadastrar">
              <button className="ep-btn-orange">Cadastrar sua ONG</button>
            </Link>
          </div>
        )}
      </div>

      {/* banner incentivando a cadastrar a ong */}
      <div className="bg-sky-50 border-t border-sky-100">
        <div className="container py-10 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Sua ONG ainda não está aqui?
          </h3>
          <p className="text-gray-500 mb-5">Cadastre-se gratuitamente e alcance mais pessoas dispostas a ajudar!</p>
          <Link href="/ongs/cadastrar">
            <button className="ep-btn-orange px-8 py-3 flex items-center gap-2 mx-auto">
              <Plus className="w-4 h-4" />
              Cadastrar Minha ONG
            </button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
