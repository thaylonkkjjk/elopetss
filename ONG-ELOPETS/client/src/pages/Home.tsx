import { useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { PawPrint, Heart, HandHeart, ArrowRight, ChevronRight, Star } from 'lucide-react';
import { animals, helpRequests, stats } from '@/lib/data';
import AnimalCard from '@/components/AnimalCard';
import HelpRequestCard from '@/components/HelpRequestCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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

function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.08 }
    );
    el.querySelectorAll('.fade-in-up').forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, []);
  return ref;
}

export default function Home() {
  const statsRef = useFadeIn();
  const adoptionRef = useFadeIn();
  const helpRef = useFadeIn();

  const ongsCount = useCountUp(stats.ongs);
  const animalsCount = useCountUp(stats.animals);
  const adoptedCount = useCountUp(stats.adopted);
  const citiesCount = useCountUp(stats.cities);

  const featuredAnimals = animals.slice(0, 4);
  const featuredRequests = helpRequests.slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* hero - primeira coisa que a pessoa vê */}
      <section className="relative min-h-[100svh] flex items-center overflow-hidden pt-16">
        {/* foto de fundo */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663509286533/ALSGtEaicPFzf5G3RQ9za7/hero-banner-BoKFF4fLyBMCG6FeowBkni.webp"
            alt="Cachorro e gato juntos"
            className="w-full h-full object-cover"
          />
          {/* degradê por cima da foto pra dar legibilidade no texto do lado esquerdo */}
          <div className="absolute inset-0 bg-gradient-to-r from-white from-30% via-white/70 via-60% to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent" />
        </div>

        <div className="container relative z-10 py-20">
          <div className="max-w-lg hero-content">
            {/* selinho pequeno acima do título */}
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 text-orange-600 text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <PawPrint className="w-4 h-4" />
              Plataforma de ONGs para Animais
            </div>

            {/* título principal */}
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

            {/* botões de ação */}
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

            {/* avatarzinhos + estrelas, pra passar confiança */}
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

      {/* cards de atalho logo abaixo do hero */}
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

      {/* seção com os números gerais da plataforma */}
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

      {/* prévia dos animais disponíveis pra adoção */}
      <section className="py-16 paw-bg" ref={adoptionRef}>
        <div className="container">
          {/* título e descrição da seção */}
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

          {/* mostra só os 4 primeiros aqui, o resto fica na página de adoção */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {featuredAnimals.map((animal, i) => (
              <AnimalCard key={animal.id} animal={animal} delay={i * 80} />
            ))}
          </div>

          {/* leva pra página completa de adoção */}
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

      {/* prévia dos pedidos de ajuda das ongs */}
      <section className="py-16 bg-gradient-to-br from-sky-50 to-orange-50" ref={helpRef}>
        <div className="container">
          {/* título e descrição da seção */}
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

          {/* só os 3 primeiros pedidos, resto fica na página de ajuda */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {featuredRequests.map((request, i) => (
              <HelpRequestCard key={request.id} request={request} delay={i * 80} />
            ))}
          </div>

          {/* leva pra página com todos os pedidos */}
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

      {/* banner final chamando ongs pra se cadastrarem */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-10 md:p-14 text-center relative overflow-hidden">
            {/* patinhas decorativas de fundo, só estética */}
            <div className="absolute top-4 left-8 text-white/10 text-6xl">🐾</div>
            <div className="absolute bottom-4 right-8 text-white/10 text-6xl">🐾</div>
            <div className="absolute top-1/2 left-4 -translate-y-1/2 text-white/5 text-8xl">🐶</div>
            <div className="absolute top-1/2 right-4 -translate-y-1/2 text-white/5 text-8xl">🐱</div>

            <div className="relative z-10">
              <h2
                className="text-3xl md:text-4xl font-black text-white mb-4"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Sua ONG faz parte do EloPets?
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

      <Footer />
    </div>
  );
}
