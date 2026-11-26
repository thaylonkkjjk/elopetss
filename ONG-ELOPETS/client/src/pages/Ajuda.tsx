import { useState, useEffect, useRef } from 'react';
import { Search, PawPrint } from 'lucide-react';
import { helpRequests } from '@/lib/data';
import HelpRequestCard from '@/components/HelpRequestCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type TypeFilter = 'todos' | 'dinheiro' | 'itens' | 'voluntariado';

export default function Ajuda() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState<TypeFilter>('todos');
  const [urgentOnly, setUrgentOnly] = useState(false);
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

  const filtered = helpRequests.filter((r) => {
    const matchSearch =
      search === '' ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.ongName.toLowerCase().includes(search.toLowerCase()) ||
      r.city.toLowerCase().includes(search.toLowerCase());
    const matchType = type === 'todos' || r.type === type;
    const matchUrgent = !urgentOnly || r.urgent;
    return matchSearch && matchType && matchUrgent;
  });

  const typeOptions: { value: TypeFilter; label: string; emoji: string }[] = [
    { value: 'todos', label: 'Todos', emoji: '🐾' },
    { value: 'dinheiro', label: 'Dinheiro', emoji: '💰' },
    { value: 'itens', label: 'Itens', emoji: '📦' },
    { value: 'voluntariado', label: 'Voluntariado', emoji: '🤝' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* cabeçalho */}
      <div className="pt-16 bg-gradient-to-br from-orange-50 to-sky-50 paw-bg">
        <div className="container py-12">
          <div className="flex items-center gap-2 mb-3">
            <PawPrint className="w-6 h-6 text-orange-400" />
            <h1
              className="text-4xl font-black text-gray-800"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Pedidos de <span className="text-orange-500">Ajuda</span>
            </h1>
          </div>
          <p className="text-gray-500 max-w-xl">
            ONGs precisam do seu apoio! Doe itens, dinheiro ou seu tempo como voluntário. Cada contribuição faz a diferença na vida de um animal.
          </p>
        </div>
      </div>

      {/* busca e filtros */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="container py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* campo de busca */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por título, ONG ou cidade..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm transition-all"
              />
            </div>

            {/* filtro por tipo de ajuda */}
            <div className="flex items-center gap-2 flex-wrap">
              {typeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setType(opt.value)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    type === opt.value
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  {opt.emoji} {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* botão pra mostrar só os urgentes */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => setUrgentOnly(!urgentOnly)}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                urgentOnly
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🚨 Apenas urgentes
            </button>
          </div>
        </div>
      </div>

      {/* lista de resultados */}
      <div className="container py-10" ref={sectionRef}>
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500 text-sm">
            <span className="font-bold text-gray-800">{filtered.length}</span> pedidos encontrados
          </p>
          {(type !== 'todos' || urgentOnly || search) && (
            <button
              onClick={() => { setType('todos'); setUrgentOnly(false); setSearch(''); }}
              className="text-sm text-orange-500 hover:text-orange-600 font-semibold"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((request, i) => (
              <HelpRequestCard key={request.id} request={request} delay={i * 60} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🤝</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Nenhum pedido encontrado
            </h3>
            <p className="text-gray-500">Tente ajustar os filtros ou buscar por outro termo.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
