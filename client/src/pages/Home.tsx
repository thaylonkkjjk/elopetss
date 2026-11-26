// Mundo ONG Home Page — "Warm Companion" design
// Hero: asymmetric layout with photo right, text left
// Sections: Stats, Quick Nav, Adoption Area, Help Requests
// Colors: Orange #F97316 (CTA), Blue #0EA5E9 (trust), White background

import { useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { PawPrint, Heart, HandHeart, ArrowRight, ChevronRight, Star } from 'lucide-react';
import { stats } from '@/lib/data';
import { trpc } from '@/lib/trpc';
import HelpRequestCard from '@/components/HelpRequestCard';
import { PawPrint as PawIcon } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Counter animation hook
function useCountUp(target: number, duration: number = 2000) {
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const increment = target / (duration / 16);
          const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
              el.textContent = target.toLocaleString('pt-BR');
              clearInterval(timer);
            } else {
              el.textContent = Math.floor(start).toLocaleString('pt-BR');
            }
          }, 16);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return ref;
}

// useFadeIn removido - animação agora é CSS pura via @keyframes fadeInUp
// fade-in-up não precisa mais de .visible para aparecer
function useFadeIn() {
  return useRef<HTMLDivElement>(null);
}

export default function Home() {
  // ONG/Admin logado (para esconder o CTA de cadastro quando já estiver logado)
  const { data: currentOng } = trpc.ongAuth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const { data: currentAdmin } = trpc.adminAuth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Real data from DB
  const { data: allPosts, isLoading: postsLoading } = trpc.ongs.getAllPosts.useQuery(undefined, {
    placeholderData: (prev) => prev, // mantém dados anteriores enquanto refetch
  });
  const { data: allOngs } = trpc.ongs.getAllApproved.useQuery(undefined, {
    placeholderData: (prev) => prev,
  });

  const donationPosts = (allPosts || [])
    .filter(p => p.type === 'donation')
    .slice(0, 4)
    .map(p => {
      const post = p as any;
      const ong = allOngs?.find(o => o.id === post.ong_id) as any;
      return { ...post, ong };
    });

  const requestPosts = (allPosts || [])
    .filter(p => p.type !== 'donation')
    .slice(0, 3)
    .map(p => {
      const post = p as any;
      const ong = allOngs?.find(o => o.id === post.ong_id) as any;
      return {
        id: post.id,
        title: post.title,
        description: post.description,
        type: 'itens' as const,
        rawType: post.type,
        items: post.items || undefined,
        ongId: post.ong_id,
        ongName: ong?.name || 'ONG',
        city: ong?.city || '',
        state: ong?.state || '',
        image: post.image_url || undefined,
        createdAt: new Date(post.created_at),
        urgent: post.is_urgent,
      };
    });

  const statsRef = useFadeIn();
  const adoptionRef = useFadeIn();
  const helpRef = useFadeIn();

  const ongsCount = useCountUp(stats.ongs);
  const animalsCount = useCountUp(stats.animals);
  const adoptedCount = useCountUp(stats.adopted);
  const citiesCount = useCountUp(stats.cities);


  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[100svh] flex items-center overflow-hidden pt-16">
        {/* Background: gradiente + padrão de patinhas (patinhas à esquerda) */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-paw-pattern.png"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Cachorro e gato — lado direito, mesmo blend de antes */}
        <div className="absolute inset-y-0 right-0 w-full sm:w-3/4 lg:w-1/2 z-0 pointer-events-none">
          <img
            src="/hero-dog-cat.webp"
            alt="Cachorro e gato juntos"
            className="w-full h-full object-contain object-bottom opacity-25"
          />
        </div>

        {/* Gradiente único cobrindo a seção inteira — sem emenda no meio */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-r from-[#FFF8F0] from-10% via-[#FFF8F0]/40 via-45% to-transparent" />

        <div className="container relative z-10 py-20">
          <div className="max-w-lg hero-content">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 text-orange-600 text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <PawPrint className="w-4 h-4" />
              Plataforma de ONGs para Animais
            </div>

            {/* Headline */}
            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-800 leading-tight mb-4"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Juntos pelos{' '}
              <span className="text-orange-500">animais!</span>
            </h1>

            <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-md">
              Ajude ONGs a cuidar dos animais e encontre um novo amigo para adoção. Cada gesto de amor faz a diferença.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              <Link href="/adocao">
                <button className="ep-btn-orange text-base px-8 py-3.5 flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Adotar um Pet
                </button>
              </Link>
              <Link href="/ajuda">
                <button className="ep-btn-blue text-base px-8 py-3.5 flex items-center gap-2">
                  <HandHeart className="w-4 h-4" />
                  Fazer Doação
                </button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-4 mt-8">
              <div className="flex -space-x-2">
                {['🐶', '🐱', '🐾'].map((emoji, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 bg-orange-100 border-2 border-white rounded-full flex items-center justify-center text-sm"
                  >
                    {emoji}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  +4.500 animais encontraram um lar
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== QUICK NAV CARDS ===== */}
      <section className="relative z-10 -mt-8 pb-4">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/ongs">
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors shrink-0">
                  <PawPrint className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    Ajude ONGs
                  </h3>
                  <p className="text-xs text-gray-500">Apoie organizações locais</p>
                </div>
              </div>
            </Link>

            <Link href="/adocao">
              <div className="bg-sky-50 border border-sky-100 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center group-hover:bg-sky-200 transition-colors shrink-0">
                  <Heart className="w-6 h-6 text-sky-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    Adote um Pet
                  </h3>
                  <p className="text-xs text-gray-500">Encontre seu novo amigo</p>
                </div>
              </div>
            </Link>

            <Link href="/ajuda">
              <div className="bg-green-50 border border-green-100 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors shrink-0">
                  <HandHeart className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    Como Ajudar
                  </h3>
                  <p className="text-xs text-gray-500">Doe itens ou dinheiro</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="py-16 bg-gradient-to-br from-slate-800 to-slate-900" ref={statsRef}>
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { ref: ongsCount, value: stats.ongs, label: 'ONGs Cadastradas', icon: '🏠', color: 'text-orange-400' },
              { ref: animalsCount, value: stats.animals, label: 'Animais Cadastrados', icon: '🐾', color: 'text-sky-400' },
              { ref: adoptedCount, value: stats.adopted, label: 'Animais Adotados', icon: '❤️', color: 'text-green-400' },
              { ref: citiesCount, value: stats.cities, label: 'Cidades Atendidas', icon: '📍', color: 'text-yellow-400' },
            ].map((stat, i) => (
              <div
                key={i}
                className="fade-in-up text-center"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className={`text-4xl font-black ${stat.color}`} style={{ fontFamily: 'Nunito, sans-serif' }}>
                  <span ref={stat.ref}>0</span>
                  <span>+</span>
                </div>
                <p className="text-slate-400 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ADOPTION SECTION ===== */}
      <section className="py-16 bg-[#FFF8F0]">
        <div className="container">
          {/* Section header */}
          <div className="text-center mb-10 fade-in-up">
            <div className="flex items-center justify-center gap-2 mb-3">
              <PawPrint className="w-6 h-6 text-orange-400" />
              <h2 className="ep-section-title">
                Área de <span className="text-sky-500">Adoção</span>
              </h2>
              <PawPrint className="w-6 h-6 text-orange-400" />
            </div>
            <p className="text-gray-500 max-w-lg mx-auto">
              Encontre seu novo amigo de quatro patas! Clique nos pets para mais informações e adoção.
            </p>
          </div>

          {/* Animal cards — só com dados reais: vazio, 1 centralizado, ou grid */}
          {donationPosts.length === 0 ? (
            <div className="text-center py-14 text-gray-400 bg-white rounded-2xl mb-8">
              <span className="text-4xl block mb-2">🐾</span>
              <p className="text-sm font-medium">Nenhuma doação disponível no momento.</p>
            </div>
          ) : (
            <div className={
              donationPosts.length === 1
                ? 'flex justify-center mb-8'
                : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8'
            }>
              {donationPosts.map((post, i) => (
                <div
                  key={post.id}
                  className={`ep-card fade-in-up group ${donationPosts.length === 1 ? 'w-full max-w-xs' : ''}`}
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div className="relative overflow-hidden aspect-[4/3]">
                    {post.image_url ? (
                      <img src={post.image_url} alt={post.pet_name || post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center">
                        <span className="text-5xl">🐾</span>
                      </div>
                    )}
                    {post.is_urgent && (
                      <div className="absolute top-3 left-3">
                        <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">🚨 Urgente</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 text-base mb-0.5" style={{ fontFamily: "Nunito, sans-serif" }}>
                      {post.pet_name || post.title}
                    </h3>
                    {post.pet_breed && <p className="text-xs text-gray-400 mb-2">{post.pet_breed}</p>}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.pet_age && <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">{post.pet_age}</span>}
                      {post.pet_size && <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">{post.pet_size}</span>}
                      {post.pet_gender && <span className="text-xs bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full">{post.pet_gender}</span>}
                    </div>
                    {post.ong && (
                      <p className="text-xs text-gray-400 mb-3">📍 {post.ong.city}/{post.ong.state} · {post.ong.name}</p>
                    )}
                    <Link href={`/ongs/${post.ong_id}?post=${post.id}`}>
                      <button className="w-full ep-btn-orange text-sm py-2">
                        Ver detalhes
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Ver todos button */}
          <div className="text-center fade-in-up">
            <Link href="/adocao">
              <button className="ep-btn-blue px-8 py-3 flex items-center gap-2 mx-auto">
                Ver Todos
                <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== HELP REQUESTS SECTION ===== */}
      <section className="py-16 bg-gradient-to-br from-sky-50 to-orange-50">
        <div className="container">
          {/* Section header */}
          <div className="text-center mb-10 fade-in-up">
            <div className="flex items-center justify-center gap-2 mb-3">
              <PawPrint className="w-6 h-6 text-orange-400" />
              <h2 className="ep-section-title">
                Pedidos de <span className="text-orange-500">Ajuda</span>
              </h2>
              <PawPrint className="w-6 h-6 text-orange-400" />
            </div>
            <p className="text-gray-500 max-w-lg mx-auto">
              Veja como apoiar as ONGs que precisam de ajuda! Clique nos pedidos para mais detalhes e contato.
            </p>
          </div>

          {/* Help request cards — só com dados reais: vazio, 1 centralizado, ou grid */}
          {requestPosts.length === 0 ? (
            <div className="text-center py-14 text-gray-400 bg-white rounded-2xl mb-8">
              <span className="text-4xl block mb-2">🤝</span>
              <p className="text-sm font-medium">Nenhum pedido de ajuda no momento.</p>
            </div>
          ) : (
            <div className={
              requestPosts.length === 1
                ? 'flex justify-center mb-8'
                : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8'
            }>
              {requestPosts.map((req, i) => (
                <div key={req.id} className={requestPosts.length === 1 ? 'w-full max-w-sm' : ''}>
                  <HelpRequestCard request={req} delay={i * 80} />
                </div>
              ))}
            </div>
          )}

          {/* Ver mais button */}
          <div className="text-center fade-in-up">
            <Link href="/ajuda">
              <button className="bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full px-8 py-3 flex items-center gap-2 mx-auto transition-all duration-200 active:scale-95" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Ver Mais Pedidos
                <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      {/* Só aparece para quem não está logado (nem como ONG, nem como admin) */}
      {!currentOng && !currentAdmin && (
        <section className="py-16 bg-white">
          <div className="container">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-10 md:p-14 text-center relative overflow-hidden">
              {/* Decorative paw prints */}
              <div className="absolute top-4 left-8 text-white/10 text-6xl">🐾</div>
              <div className="absolute bottom-4 right-8 text-white/10 text-6xl">🐾</div>
              <div className="absolute top-1/2 left-4 -translate-y-1/2 text-white/5 text-8xl">🐶</div>
              <div className="absolute top-1/2 right-4 -translate-y-1/2 text-white/5 text-8xl">🐱</div>

              <div className="relative z-10">
                <h2
                  className="text-3xl md:text-4xl font-black text-white mb-4"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  Sua ONG quer fazer parte do Mundo ONG?
                </h2>
                <p className="text-orange-100 text-lg mb-8 max-w-lg mx-auto">
                  Cadastre-se gratuitamente e alcance mais pessoas dispostas a ajudar e adotar!
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Link href="/ongs/cadastrar">
                    <button className="bg-white text-orange-500 hover:bg-orange-50 font-bold px-8 py-3.5 rounded-full transition-all duration-200 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                      Cadastrar ONG
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                  <Link href="/ongs">
                    <button className="border-2 border-white text-white hover:bg-white/10 font-bold px-8 py-3.5 rounded-full transition-all duration-200" style={{ fontFamily: 'Nunito, sans-serif' }}>
                      Ver ONGs Parceiras
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
