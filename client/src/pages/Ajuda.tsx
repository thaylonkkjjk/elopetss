import { useState, useEffect } from 'react';
import { Search, PawPrint, Loader2, Heart } from 'lucide-react';
import HelpRequestCard from '@/components/HelpRequestCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { trpc } from '@/lib/trpc';

type TypeFilter = 'todos' | 'request_food' | 'request_medicine' | 'request_other';

export default function Ajuda() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState<TypeFilter>('todos');
  const [urgentOnly, setUrgentOnly] = useState(false);

  const { data: ongPosts, isLoading } = trpc.ongs.getAllPosts.useQuery(undefined, { placeholderData: (p: any) => p });
  const { data: ongs } = trpc.ongs.getAllApproved.useQuery(undefined, { placeholderData: (p: any) => p });

  // Apenas posts de pedido (não doações — doações ficam em /adocao)
  const requestPosts = (ongPosts || []).filter(p => p.type !== 'donation');

  const formatted = requestPosts.map(post => {
    const ong = ongs?.find(o => o.id === (post as any).ong_id);
    return {
      id: post.id,
      title: post.title,
      description: post.description,
      type: post.type === 'request_food' ? 'itens'
          : post.type === 'request_medicine' ? 'itens'
          : 'itens' as const,
      rawType: post.type,
      items: (post as any).items || undefined,
      ongId: (post as any).ong_id,
      ongName: ong?.name || 'ONG',
      city: ong?.city || '',
      state: ong?.state || '',
      image: (post as any).image_url || undefined,
      createdAt: new Date(post.created_at),
      urgent: (post as any).is_urgent,
    };
  });

  const filtered = formatted.filter(r => {
    const matchSearch = search === '' ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.ongName.toLowerCase().includes(search.toLowerCase()) ||
      r.city.toLowerCase().includes(search.toLowerCase());
    const matchType = type === 'todos' || r.rawType === type;
    const matchUrgent = !urgentOnly || r.urgent;
    return matchSearch && matchType && matchUrgent;
  });

  const typeOptions = [
    { value: 'todos' as TypeFilter,            label: 'Todos',    emoji: '🐾' },
    { value: 'request_food' as TypeFilter,     label: 'Ração',    emoji: '🥣' },
    { value: 'request_medicine' as TypeFilter, label: 'Remédios', emoji: '💊' },
    { value: 'request_other' as TypeFilter,    label: 'Outros',   emoji: '📦' },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <div className="pt-16 bg-[#F0F9FF]">
        <div className="container py-12">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-6 h-6 text-orange-400" />
            <h1 className="text-4xl font-black text-gray-800" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Pedidos de <span className="text-orange-500">Ajuda</span>
            </h1>
          </div>
          <p className="text-gray-500 max-w-xl">
            ONGs precisam do seu apoio! Doe itens, remédios ou ração. Cada contribuição faz a diferença na vida de um animal.
          </p>
        </div>
      </div>

      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="container py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Buscar por título, ONG ou cidade..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {typeOptions.map(opt => (
                <button key={opt.value} onClick={() => setType(opt.value)}
                  className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${
                    type === opt.value ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}>
                  {opt.emoji} {opt.label}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer transition-all">
              <input type="checkbox" checked={urgentOnly} onChange={e => setUrgentOnly(e.target.checked)} className="w-4 h-4 rounded" />
              <span className="text-sm font-semibold text-gray-700">🚨 Urgentes</span>
            </label>
          </div>
        </div>
      </div>

      <div className="container py-12 flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <PawPrint className="w-12 h-12 mx-auto mb-3 text-gray-200" />
            <p className="text-gray-500 text-lg">Nenhum pedido de ajuda encontrado.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(r => (
                <div key={r.id} className="fade-in-up">
                  <HelpRequestCard request={r} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
